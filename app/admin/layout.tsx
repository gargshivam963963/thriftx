import type { Metadata } from "next";
import { getAdminUser } from "@/lib/adminAccess";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Server-side admin layout.
 *
 * Every request to /admin/* is verified here BEFORE the UI renders:
 * the guard either returns the authenticated admin user (and the shell below
 * renders) or redirects the request away. This ensures the admin panel is
 * never rendered, nor its data leaked, to unauthorized users.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin | THRIFTX",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getAdminUser();

  return <AdminShell>{children}</AdminShell>;
}

