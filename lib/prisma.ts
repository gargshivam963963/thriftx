import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * THRIFTX — Prisma singleton client (Neon PostgreSQL via pg driver adapter).
 *
 * Production architecture:
 *   Pages → Services → Repositories → Prisma → Neon PostgreSQL
 *
 * The client is created lazily ONLY when a valid DATABASE_URL is configured.
 * When the DB is not configured, `prisma` is null and `isDatabaseConfigured`
 * is false so callers can return graceful empty states instead of crashing.
 *
 * This is the ONLY Prisma client in the app. Do not create another one.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined;
};

const rawConnectionString = process.env.DATABASE_URL;

/**
 * Normalize the SSL mode on the connection string.
 *
 * The `pg` driver deprecates `sslmode=prefer|require|verify-ca` (they are
 * treated as aliases for `verify-full` today, but will adopt stricter libpq
 * semantics in a future major version, with a security warning in the
 * meantime). We explicitly pin `verify-full` to preserve the current behavior
 * and silence the warning.
 */
function normalizeSsl(url: string): string {
  try {
    const parsed = new URL(url);
    const ssl = parsed.searchParams.get("sslmode");
    if (ssl && ssl !== "verify-full") {
      parsed.searchParams.set("sslmode", "verify-full");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const connectionString = rawConnectionString
  ? normalizeSsl(rawConnectionString)
  : undefined;

const isPlaceholder =
  !connectionString ||
  !connectionString.startsWith("postgres") ||
  connectionString.includes("USER:PASSWORD") ||
  connectionString.includes("ep-example.neon.tech") ||
  connectionString.includes("johndoe:randompassword@localhost");

function createClient(): PrismaClient | null {
  if (isPlaceholder) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[prisma] DATABASE_URL is not set to a real Neon connection string. Product reads will return empty data until it is configured.",
      );
    }
    return null;
  }

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}

/** Lazily-created Prisma client, or null when DATABASE_URL is not configured. */
export const prisma = createClient();

/** True when the Prisma client is available (DATABASE_URL configured). */
export const isDatabaseConfigured = prisma !== null;