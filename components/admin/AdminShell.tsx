"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import AdminSidebar from "@/components/admin/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Client shell for the admin panel.
 *
 * The parent server layout (`app/admin/layout.tsx`) already verifies the user
 * is an authenticated admin before this shell is rendered, so the admin UI is
 * never sent to unauthorized users. This component keeps the interactive
 * sidebar / mobile header and adds a defensive client-side re-check in case
 * the session or role changes mid-session.
 */
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Defense in depth: if the session is lost while inside the admin panel.
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.replace("/login?redirect=/admin/dashboard");
    }
  }, [mounted, loading, user, router]);

  // Defense in depth: if the current user is not an admin, send them away.
  useEffect(() => {
    if (mounted && !loading && user && user.role !== "admin") {
      router.replace("/");
    }
  }, [mounted, loading, user, router]);

  // Close the mobile sidebar on route change.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
          <p className="text-sm text-muted-foreground">Loading admin...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden lg:pl-[280px]">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:hidden">
          <Button
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground bg-card hover:bg-muted"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-2xs font-bold text-white dark:bg-white dark:text-black">
              T
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">
              Admin Panel
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
