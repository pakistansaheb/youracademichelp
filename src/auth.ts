import NextAuth from "next-auth";
import type { EmailConfig } from "@auth/core/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { isRateLimited, recordAttempt } from "@/lib/rate-limit";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM ?? "YourAcademicHelp <onboarding@resend.dev>";

const resendEmailProvider: EmailConfig = {
  id: "resend",
  type: "email",
  name: "Email",
  from: emailFrom,
  maxAge: 24 * 60 * 60,
  async sendVerificationRequest({ identifier, url }) {
    if (await isRateLimited(identifier)) {
      // Stay silent: same UX as a normal send, no signal to an attacker
      // about whether this address has an account or is being targeted.
      return;
    }
    await recordAttempt(identifier);

    if (!resendApiKey) {
      console.log(`[dev] Magic link for ${identifier}: ${url}`);
      return;
    }

    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: emailFrom,
      to: identifier,
      subject: "Sign in to YourAcademicHelp",
      html: `<p>Click below to sign in. This link expires in 24 hours.</p><p><a href="${url}">Sign in to YourAcademicHelp</a></p><p>If you didn't request this, you can ignore this email.</p>`,
    });
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [resendEmailProvider],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.onboardingComplete = user.onboardingComplete;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
      if (user.email && ownerEmail && user.email.toLowerCase() === ownerEmail) {
        await db.update(users).set({ role: "owner" }).where(eq(users.id, user.id!));
      }
    },
  },
});
