import { createHmac, timingSafeEqual } from "node:crypto";
import { getEnv } from "./env";

export type PaymentStatus = "pending" | "success" | "failed" | "abandoned";

export interface PaymentInit {
  email: string;
  amountKobo: number;
  currency?: string;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentRecord {
  reference: string;
  status: PaymentStatus;
  amountKobo: number;
  currency: string;
  raw?: unknown;
}

export interface PaymentProvider {
  readonly name: string;
  initialize(payment: PaymentInit): Promise<{ authorizationUrl: string; reference: string }>;
  verify(reference: string): Promise<PaymentRecord>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}

class PaystackProvider implements PaymentProvider {
  readonly name = "paystack";
  private base = "https://api.paystack.co";

  private async call(path: string, init?: RequestInit): Promise<unknown> {
    const env = getEnv();
    let res: Response;
    try {
      res = await fetch(`${this.base}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
    } catch (err) {
      throw new Error(`payments.paystack network failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    const json = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: unknown } | null;
    if (!res.ok || !json?.status) throw new Error(`payments.paystack error: ${json?.message ?? res.statusText}`);
    return json.data;
  }

  async initialize(payment: PaymentInit): Promise<{ authorizationUrl: string; reference: string }> {
    const data = (await this.call("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: payment.email,
        amount: payment.amountKobo,
        currency: payment.currency ?? "NGN",
        reference: payment.reference,
        callback_url: payment.callbackUrl,
        metadata: payment.metadata,
      }),
    })) as { authorization_url: string; reference: string };
    return { authorizationUrl: data.authorization_url, reference: data.reference };
  }

  async verify(reference: string): Promise<PaymentRecord> {
    const data = (await this.call(`/transaction/verify/${encodeURIComponent(reference)}`)) as {
      status: string;
      amount: number;
      currency: string;
      reference: string;
    };
    const status: PaymentStatus =
      data.status === "success" ? "success" : data.status === "abandoned" ? "abandoned" : "failed";
    return { reference: data.reference, status, amountKobo: data.amount, currency: data.currency, raw: data };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = getEnv().PAYSTACK_WEBHOOK_SECRET || getEnv().PAYSTACK_SECRET_KEY;
    const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
    const a = Buffer.from(digest);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}

export function getPaymentProvider(name = process.env.PAYMENTS_PROVIDER ?? "paystack"): PaymentProvider {
  if (name === "paystack") return new PaystackProvider();
  throw new Error(`payments: unknown provider "${name}" (add a class implementing PaymentProvider)`);
}
