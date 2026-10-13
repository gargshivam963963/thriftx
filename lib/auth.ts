import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";

import { PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const secret = process.env.BETTER_AUTH_SECRET;

if (!secret || secret.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET must be configured with at least 32 characters.",
  );
}

const baseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const trustedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://thriftx-sandy.vercel.app",
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

/**
 * Whether transactional auth emails (verification / password reset) can
 * actually be delivered. When email delivery is NOT configured (e.g. local
 * development without Resend), we must NOT require email verification —
 * otherwise every new account is created but can never sign in. In that case
 * Better Auth signs the user in immediately after sign-up instead.
 */
const emailDeliveryConfigured = Boolean(resendApiKey && emailFrom);

async function sendAuthEmail(to: string, subject: string, url: string) {
  if (!resendApiKey || !emailFrom) {
    // Don't crash the auth flow when email delivery isn't configured. Sign-up
    // and sign-in still succeed; the email simply isn't sent.
    console.warn(
      `[auth] Email delivery is not configured. Skipping "${subject}" email to ${to}. ` +
        "Set RESEND_API_KEY and EMAIL_FROM to enable it.",
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [to],
      subject,
      text: `Use this secure link: ${url}\n\nIf you did not request this, you can ignore this email.`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email delivery failed (${response.status}).`);
  }
}

const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          mapProfileToUser: (profile: {
            email?: string;
            email_verified?: boolean;
            name?: string;
            picture?: string;
          }) => ({
            email: profile.email || "",
            emailVerified: profile.email_verified === true,
            name: profile.name || "User",
            image: profile.picture || undefined,
          }),
        },
      }
    : undefined;

if (!prisma) {
  console.warn(
    "[better-auth] DATABASE_URL is not configured. Authentication routes will fail until the database is connected.",
  );
}

const prismaClientForAuth = (prisma ?? ({} as PrismaClient)) as PrismaClient;

export const auth = betterAuth({
  secret,
  baseURL,
  basePath: "/api/auth",
  trustedOrigins,
  database: prismaAdapter(prismaClientForAuth, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Only enforce verification when we can actually deliver the email.
    // Without this, dev sign-ups (no Resend configured) create accounts that
    // can never sign in.
    requireEmailVerification: emailDeliveryConfigured,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail(user.email, "Reset your THRIFTX password", url);
    },
  },
  emailVerification: {
    sendOnSignUp: emailDeliveryConfigured,
    sendOnSignIn: emailDeliveryConfigured,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail(user.email, "Verify your THRIFTX email", url);
    },
  },
  socialProviders,
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "customer",
        input: false,
        returned: true,
      },
    },
  },
  plugins: [nextCookies()],
});
