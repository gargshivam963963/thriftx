"use client";

import { Button } from '@/components/ui/button';
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

    const shouldRedirect = useMemo(
        () => mounted && !loading && !user,
        [mounted, loading, user],
    );

    useEffect(() => {
        if (shouldRedirect) {
            router.replace("/login?redirect=/admin/dashboard");
        }
    }, [shouldRedirect, router]);

    useEffect(() => {
        if (mounted && !loading && user && user.role !== "admin") {
            router.replace("/");
        }
    }, [mounted, loading, router, user]);

    // Close sidebar on route change (mobile)
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
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground hover:bg-muted"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black">
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