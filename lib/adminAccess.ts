import { redirect } from "next/navigation";
import { AuthGuardError, requireAdmin } from "@/lib/auth-guard";

export type AdminUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  image?: string | null;
  role?: string;
};

/**
 * Server-side guard for the entire /admin area.
 *
 * Runs in the Node.js runtime (Server Components / Route Handlers) so that
 * unauthorized requests are rejected BEFORE any admin UI or data is rendered:
 *   - unauthenticated users   -> redirect to /login
 *   - authenticated non-admins -> redirect to /
 *
 * Combined with the per-route `adminAuthErrorResponse()` guard on every
 * /api/admin/* route, this gives the admin panel defense-in-depth.
 */
export async function getAdminUser(): Promise<AdminUser> {
  try {
    return await requireAdmin();
  } catch (error) {
    if (error instanceof AuthGuardError) {
      if (error.status === 401) {
        redirect("/login?redirect=/admin/dashboard");
      }
      redirect("/");
    }
    throw error;
  }
}
