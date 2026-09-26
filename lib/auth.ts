import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";

import { PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          mapProfileToUser: (profile: {
            email?: string;
            name?: string;
            picture?: string;
          }) => ({
            email: profile.email || "",
            emailVerified: true,
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
  secret: secret || "development-secret-change-me",
  baseURL,
  basePath: "/api/auth",
  database: prismaAdapter(prismaClientForAuth, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      console.info("[better-auth] Password reset requested for:", user.email);
      console.info("[better-auth] Reset URL:", url);
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
      appwriteId: {
        type: "string",
        required: false,
        input: false,
        returned: true,
      },
    },
  },
  plugins: [nextCookies()],
});
