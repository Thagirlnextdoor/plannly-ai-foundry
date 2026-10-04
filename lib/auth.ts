import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { getEnv } from "./env";
import { sendTransactionalEmail } from "./email";

function envSafe() {
  try {
    return getEnv();
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  providers: [
    EmailProvider({
      from: process.env.AUTH_EMAIL_FROM ?? process.env.EMAIL_FROM ?? "Plannly <noreply@localhost>",
      sendVerificationRequest: async ({ identifier, url }) => {
        const env = envSafe();
        if (!env) throw new Error("auth.email misconfigured: missing env");
        await sendTransactionalEmail({
          to: identifier,
          subject: "Sign in to Plannly",
          html: `<p>Sign in to Plannly:</p><p><a href="${url}">Sign in</a></p><p>This link expires soon. If you did not request it, ignore this email.</p>`,
        });
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, user }) {
      const role = (user as unknown as { role?: string }).role ?? "USER";
      return { ...session, user: { ...session.user, id: user.id, role } };
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await db.user.update({ where: { id: user.id }, data: { role: "USER" } }).catch(() => undefined);
    },
  },
};

export function requireRole(role: string, allowed: string[]): void {
  if (!allowed.includes(role)) {
    const err = new Error("forbidden: insufficient role");
    (err as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw err;
  }
}
