import { Resend } from "resend";
import { getEnv } from "./env";

let resend: Resend | null = null;

function client(): Resend {
  const env = getEnv();
  if (!resend) resend = new Resend(env.RESEND_API_KEY);
  return resend;
}

export interface TransactionalEmail {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendTransactionalEmail(mail: TransactionalEmail): Promise<{ id: string }> {
  const env = getEnv();
  try {
    const { data, error } = await client().emails.send({
      from: env.EMAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: mail.replyTo,
    });
    if (error) throw new Error(error.message);
    return { id: data?.id ?? "unknown" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`email.send failed: ${msg}`);
  }
}

export async function sendReminderEmail(to: string, title: string, context?: string): Promise<{ id: string }> {
  return sendTransactionalEmail({
    to,
    subject: `Reminder: ${title}`,
    html: `<p>${title}</p>${context ? `<p>${context}</p>` : ""}<p><a href="${getEnv().APP_URL}">Open Plannly</a></p>`,
  });
}

export async function sendApprovalEmail(to: string, subject: string, actionUrl: string, detail?: string): Promise<{ id: string }> {
  return sendTransactionalEmail({
    to,
    subject,
    html: `${detail ? `<p>${detail}</p>` : ""}<p><a href="${actionUrl}">Review and approve</a></p>`,
  });
}
