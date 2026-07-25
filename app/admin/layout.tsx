"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import AdminSidebar from "@/components/admin/dashboard/Sidebar";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({
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

    const shouldRedirect = useMemo(() => {
        return mounted && !loading && !user;
    }, [mounted, loading, user]);

    useEffect(() => {
        if (shouldRedirect) {
            router.replace("/login?redirect=/admin/dashboard");
        }
    }, [shouldRedirect, router]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (!mounted || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-text-muted)] border-t-[var(--color-text)]" />
                    <p className="text-sm text-[var(--color-text-secondary)]">Loading admin...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[var(--color-bg)]">
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
            <div className="flex flex-1 flex-col lg:pl-[280px]">
                {/* Mobile header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black">
                            T
                        </div>
                        <span className="text-sm font-bold tracking-tight text-[var(--color-text)]">
                            Admin Panel
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

