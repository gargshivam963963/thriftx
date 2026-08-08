import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * THRIFTX — Prisma singleton client.
 *
 * Phase 1: Product/category/brand reads are served from PostgreSQL via Prisma.
 * Uses the Neon Postgres driver adapter (pg).
 *
 * The client is created lazily ONLY when a valid DATABASE_URL is configured,
 * so the app keeps working (with graceful empty states) even before the
 * connection string is pasted in.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient | null {
  const url = process.env.DATABASE_URL;

  const isPlaceholder =
    !url ||
    !url.startsWith("postgres") ||
    url.includes("USER:PASSWORD") ||
    url.includes("ep-example.neon.tech");

  if (isPlaceholder) {
    // No real DB configured yet — report it and return null so callers can
    // return graceful empty states instead of crashing.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[prisma] DATABASE_URL is not set to a real Neon connection string. Product reads will return empty data until it is configured.",
      );
    }
    return null;
  }

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: url });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}

/** Lazily-created Prisma client, or null if DATABASE_URL is not configured. */
export const prisma = createClient();

/** True when the Prisma client is available (DATABASE_URL configured). */
export const isDatabaseConfigured = prisma !== null;
