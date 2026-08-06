"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
        <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-border px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-bold text-white shadow-lg dark:from-white dark:to-zinc-300 dark:text-black">
                    T
                </div>
                <div>
                    <h1 className="text-base font-bold tracking-tight text-foreground">
                        THRIFTX
                    </h1>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Admin Panel
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
                {NAV_ITEMS.map((section) => (
                    <div key={section.section} className="mb-6">
                        <p className="mb-2 px-2 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                            {section.section}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-accent text-white shadow-md dark:bg-white dark:text-black"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        )}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="ml-auto h-2 w-2 rounded-full bg-current opacity-60"
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
            <div className="border-t border-border p-4 space-y-2">
                <div className="flex items-center justify-between px-2">
                    <ThemeToggle size="sm" />
                </div>

                <Link
                    href="/"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Store</span>
                </Link>

                <button
                    onClick={async () => {
                        await logout();
                        window.location.href = "/";
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="fixed left-0 top-0 z-50 hidden h-full w-[280px] border-r border-border bg-card shadow-xl lg:block">
                {sidebarContent}
            </aside>

            {/* Mobile sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-full w-[280px] border-r border-border bg-card shadow-2xl transition-transform duration-300 lg:hidden",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                {sidebarContent}
            </aside>
        </>
    );
}

