/**
 * Analytics self-exclusion.
 *
 * The store owner's own browsing must NEVER pollute the customer dashboard.
 * Role-based client checks are not enough: `useAuth()` returns `user: null` on
 * the first render, so the very first pageviews fire BEFORE the admin role is
 * known (the login race), and browsing while logged out / on another device has
 * no role at all. So we exclude by EMAIL, and we enforce it SERVER-SIDE in the
 * batch route where the session cookie is authoritative.
 *
 * Configure extra emails via `NEXT_PUBLIC_ANALYTICS_EXCLUDE_EMAILS`
 * (comma-separated). The primary admin/owner email is always included.
 */

/** The store owner / admin accounts whose traffic is always excluded. */
export const OWNER_EMAILS: readonly string[] = [
  "gargshivam963963@gmail.com",
];

function parseEnvList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** All excluded emails, lower-cased, de-duplicated. */
export const EXCLUDED_EMAILS: ReadonlySet<string> = new Set<string>([
  ...OWNER_EMAILS.map((e) => e.toLowerCase()),
  ...parseEnvList(process.env.NEXT_PUBLIC_ANALYTICS_EXCLUDE_EMAILS),
]);

/** True when the given email belongs to the owner / an excluded account. */
export function isExcludedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return EXCLUDED_EMAILS.has(email.trim().toLowerCase());
}
