export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!ADMIN_EMAIL) {
  throw new Error("Missing ADMIN_EMAIL environment variable.");
}
