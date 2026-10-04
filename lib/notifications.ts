import { db } from "./db";
import { sendReminderEmail } from "./email";

export type NotifyInput = {
  userId: string;
  title: string;
  body?: string;
  emailTo?: string;
};

// Phase 1: in-app notification + email only. SMS/WhatsApp intentionally not implemented.
export async function notifyUser(input: NotifyInput): Promise<{ inAppId: string; emailId?: string }> {
  let inApp;
  try {
    inApp = await db.notification.create({
      data: { userId: input.userId, channel: "in_app", title: input.title, body: input.body },
    });
  } catch (err) {
    throw new Error(`notify.inApp failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  let emailId: string | undefined;
  if (input.emailTo) {
    try {
      const sent = await sendReminderEmail(input.emailTo, input.title, input.body);
      emailId = sent.id;
      await db.notification.create({
        data: { userId: input.userId, channel: "email", title: input.title, body: input.body },
      }).catch(() => undefined);
    } catch (err) {
      throw new Error(`notify.email failed (in-app kept): ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { inAppId: inApp.id, emailId };
}

export function smsNotConfigured(): never {
  throw new Error("notify.sms not configured in Phase 1: use in-app + email (SMS/WhatsApp is a future integration)");
}
