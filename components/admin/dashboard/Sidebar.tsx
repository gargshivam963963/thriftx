"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    LogOut,
    ArrowLeft,
    CloudUpload,
    Ticket,
    Gift,
    Megaphone,
    Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const NAV_ITEMS = [
    {
        section: "Main",
        items: [
            {
                label: "Dashboard",
                href: "/admin/dashboard",
                icon: LayoutDashboard,
            },
            {
                label: "Orders",
                href: "/admin/orders",
                icon: ShoppingCart,
            },
            {
                label: "Products",
                href: "/admin/products",
                icon: Package,
            },
            {
                label: "Bulk Upload",
                href: "/admin/bulk-upload",
                icon: CloudUpload,
            },
            {
                label: "Customers",
                href: "/admin/customers",
                icon: Users,
            },
            {
                label: "Analytics",
                href: "/admin/analytics",
                icon: BarChart3,
            },
        ],
    },
    {
        section: "Marketing",
        items: [
            {
                label: "Coupons",
                href: "/admin/coupons",
                icon: Ticket,
            },
            {
                label: "Offers",
                href: "/admin/offers",
                icon: Gift,
            },
            {
                label: "Announcements",
                href: "/admin/announcements",
                icon: Megaphone,
            },
            {
                label: "Sales",
                href: "/admin/sales",
                icon: Clock,
            },
        ],
    },
];

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const sidebarContent = (
        <div className="flex h-dvh min-h-0 flex-col bg-card font-sans text-card-foreground">
            {/* Logo */}
            <Link
                href="/admin/dashboard"
                onClick={onClose}
                aria-label="THRIFTX Admin dashboard"
                className="flex h-[76px] shrink-0 items-center gap-3.5 border-b border-border px-5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-foreground text-sm font-bold leading-none tracking-tight text-background">
                    T
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-lg font-bold leading-none tracking-tight text-foreground">
                        THRIFTX
                    </span>
                    <span className="text-caption text-muted-foreground">
                        Admin Panel
                    </span>
                </span>
            </Link>

            {/* Navigation */}
            <nav
                aria-label="Admin navigation"
                className="min-h-0 flex-1 overflow-y-auto px-4 py-6"
            >
                {NAV_ITEMS.map((section) => (
                    <div key={section.section} className="mb-7 last:mb-0">
                        <p className="mb-3 px-3 text-caption text-muted-foreground">
                            {section.section}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    pathname.startsWith(`${item.href}/`);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        aria-current={isActive ? "page" : undefined}
                                        className={cn(
                                            "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                                            isActive
                                                ? "bg-accent text-accent-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        )}
                                    >
                                        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                aria-hidden="true"
                                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom */}
            <div className="shrink-0 space-y-1 border-t border-border p-4">
                <div className="mb-2 flex min-h-10 items-center justify-between rounded-xl px-3">
                    <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                    <ThemeToggle size="sm" />
                </div>

                <Link
                    href="/"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                >
                    <ArrowLeft size={18} strokeWidth={1.8} aria-hidden="true" />
                    <span>Back to Store</span>
                </Link>

                <Button
                    variant="ghost"
                    onClick={async () => {
                        await logout();
                        window.location.href = "/";
                    }}
                    className="flex min-h-11 w-full items-center justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                    <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
                    <span>Sign Out</span>
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                aria-label="Admin sidebar"
                className="fixed left-0 top-0 z-50 hidden h-dvh w-[280px] border-r border-border bg-card lg:block"
            >
                {sidebarContent}
            </aside>

            {/* Mobile sidebar */}
            <aside
                aria-label="Admin sidebar"
                aria-hidden={!isOpen}
                inert={!isOpen}
                className={cn(
                    "fixed left-0 top-0 z-50 h-dvh w-[280px] border-r border-border bg-card shadow-2xl transition-transform duration-300 lg:hidden",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
