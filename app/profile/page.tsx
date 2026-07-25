"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    User,
    Package,
    Heart,
    MapPin,
    LogOut,
    ChevronRight,
    ShoppingBag,
    CreditCard,
    Gift,
    Settings,
    Sparkles,
    Mail,
    Phone,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { getUserOrders } from "@/lib/services/orderService";
import type { Order } from "@/lib/types/order";

// ─── Quick Stats ─────────────────────────────────────────────────────────────

function StatsCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                    {label}
                </p>
                <p className="font-serif text-xl font-bold text-zinc-900">
                    {value}
                </p>
            </div>
        </div>
    );
}

// ─── Menu Row ────────────────────────────────────────────────────────────────

function MenuRow({
    icon,
    label,
    subtitle,
    href,
    onClick,
    danger,
}: {
    icon: React.ReactNode;
    label: string;
    subtitle?: string;
    href?: string;
    onClick?: () => void;
    danger?: boolean;
}) {
    const content = (
        <div
            className={`flex items-center justify-between rounded-2xl border border-zinc-100 bg-white p-4 transition hover:shadow-sm ${danger ? "hover:border-red-200 hover:bg-red-50/50" : "hover:border-zinc-200 hover:bg-zinc-50"
                }`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${danger ? "bg-red-100 text-red-500" : "bg-zinc-100 text-zinc-500"
                        }`}
                >
                    {icon}
                </div>
                <div>
                    <p className={`text-sm font-semibold ${danger ? "text-red-700" : "text-zinc-900"}`}>
                        {label}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-zinc-500">{subtitle}</p>
                    )}
                </div>
            </div>
            <ChevronRight
                size={18}
                className={`${danger ? "text-red-300" : "text-zinc-300"}`}
            />
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return <button type="button" onClick={onClick} className="w-full text-left">
        {content}
    </button>;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 animate-pulse rounded-full bg-zinc-200" />
                <div className="space-y-2">
                    <div className="h-5 w-36 animate-pulse rounded bg-zinc-200" />
                    <div className="h-4 w-48 animate-pulse rounded bg-zinc-200" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-200" />
                ))}
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-zinc-200" />
            ))}
        </div>
    );
}

// ─── Main Profile Page ───────────────────────────────────────────────────────

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading, logout, refreshUser } = useAuth();
    const { totalItems } = useCart();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login?redirect=/profile");
            return;
        }

        const loadOrders = async () => {
            try {
                setLoadingOrders(true);
                setOrdersError(false);
                const data = await getUserOrders();
                setOrders(data);
            } catch {
                setOrdersError(true);
            } finally {
                setLoadingOrders(false);
            }
        };

        loadOrders();
    }, [authLoading, user, router]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Signed out successfully.");
            router.push("/");
        } catch {
            toast.error("Failed to sign out.");
        }
    };

    if (authLoading) {
        return (
            <main className="min-h-screen bg-zinc-50">
                <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
                    <ProfileSkeleton />
                </div>
            </main>
        );
    }

    if (!user) return null;

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const recentOrders = orders.slice(0, 3);

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50">
            <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
                {/* ── Profile Header ────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 text-2xl font-bold text-white shadow-lg sm:h-20 sm:w-20 sm:text-3xl">
                            {(user.name || user.email || "U")
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                        <div>
                            <h1 className="font-serif text-2xl font-bold text-zinc-900 sm:text-3xl">
                                {user.name || "User"}
                            </h1>
                            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                                <Mail size={14} />
                                {user.email || "No email"}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ── Stats Grid ─────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                    <StatsCard
                        icon={<Package size={18} className="text-white" />}
                        label="Orders"
                        value={loadingOrders ? "..." : totalOrders}
                        color="bg-zinc-900 text-white"
                    />
                    <StatsCard
                        icon={<ShoppingBag size={18} className="text-white" />}
                        label="Cart Items"
                        value={totalItems}
                        color="bg-emerald-600 text-white"
                    />
                    <StatsCard
                        icon={<Heart size={18} className="text-white" />}
                        label="Wishlist"
                        value="—"
                        color="bg-rose-500 text-white"
                    />
                    <StatsCard
                        icon={<CreditCard size={18} className="text-white" />}
                        label="Spent"
                        value={`₹${totalSpent.toLocaleString("en-IN")}`}
                        color="bg-amber-600 text-white"
                    />
                </motion.div>

                {/* ── Menu ────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                >
                    <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        Account
                    </p>

                    <MenuRow
                        icon={<Package size={18} />}
                        label="My Orders"
                        subtitle={
                            loadingOrders
                                ? "Loading..."
                                : ordersError
                                    ? "Failed to load"
                                    : `${totalOrders} ${totalOrders === 1 ? "order" : "orders"} placed`
                        }
                        href="/profile/orders"
                    />

                    <MenuRow
                        icon={<MapPin size={18} />}
                        label="Saved Addresses"
                        subtitle="Manage your delivery addresses"
                        href="/profile/addresses"
                    />

                    <MenuRow
                        icon={<Heart size={18} />}
                        label="Wishlist"
                        subtitle="Items you've saved"
                        href="/profile/wishlist"
                    />

                    <MenuRow
                        icon={<Gift size={18} />}
                        label="Refer & Earn"
                        subtitle="Get ₹100 off for you & your friend"
                        href="/refer"
                    />

                    <div className="pt-4">
                        <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                            Settings
                        </p>

                        <MenuRow
                            icon={<Settings size={18} />}
                            label="Account Settings"
                            subtitle="Profile, email, password"
                            href="/profile/settings"
                        />

                        <MenuRow
                            icon={<LogOut size={18} />}
                            label="Sign Out"
                            subtitle="Log out of your account"
                            onClick={handleLogout}
                            danger
                        />
                    </div>
                </motion.div>

                {/* ── Recent Orders ───────────────────────────────────────── */}
                {!loadingOrders && !ordersError && recentOrders.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mt-8"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                                Recent Orders
                            </p>
                            <Link
                                href="/profile/orders"
                                className="text-xs font-medium text-zinc-900 transition hover:opacity-70"
                            >
                                View All
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {recentOrders.map((order) => (
                                <Link
                                    key={order.$id}
                                    href={`/orders/${order.$id}`}
                                    className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-4 py-3 transition hover:border-zinc-200 hover:shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                                            <Package
                                                size={14}
                                                className="text-zinc-500"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">
                                                Order #{order.$id.slice(0, 8).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {new Intl.DateTimeFormat("en-IN", {
                                                    dateStyle: "medium",
                                                }).format(new Date(order.$createdAt))}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-zinc-900">
                                            ₹{order.total.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Brand Footer ─────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-10 text-center text-xs text-zinc-400"
                >
                    <Sparkles size={12} className="mx-auto mb-1" />
                    <p>Premium Thrift Fashion &mdash; THRIFTX</p>
                </motion.div>
            </div>
        </main>
    );
}

