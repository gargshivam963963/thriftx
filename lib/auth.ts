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

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

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

async function sendAuthEmail(to: string, subject: string, url: string) {
  if (!resendApiKey || !emailFrom) {
    throw new Error(
      "Email delivery is unavailable. Configure RESEND_API_KEY and EMAIL_FROM.",
    );
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
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail(user.email, "Reset your THRIFTX password", url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
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
