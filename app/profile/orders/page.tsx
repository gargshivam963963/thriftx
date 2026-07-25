"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Package,
    Search,
    ArrowRight,
    ShoppingBag,
    Sparkles,
    AlertCircle,
    RefreshCw,
    PackageOpen,
    Clock,
    Filter,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { getUserOrders } from "@/lib/services/orderService";
import type { Order } from "@/lib/types/order";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(dateStr));
}

function formatCurrency(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
}

function getStatusStyle(status: string) {
    const styles: Record<
        string,
        { label: string; bg: string; text: string; dot: string }
    > = {
        "Pending (COD)": {
            label: "Pending",
            bg: "bg-amber-50",
            text: "text-amber-700",
            dot: "bg-amber-400",
        },
        Pending: {
            label: "Pending",
            bg: "bg-amber-50",
            text: "text-amber-700",
            dot: "bg-amber-400",
        },
        Processing: {
            label: "Processing",
            bg: "bg-blue-50",
            text: "text-blue-700",
            dot: "bg-blue-400",
        },
        Shipped: {
            label: "Shipped",
            bg: "bg-violet-50",
            text: "text-violet-700",
            dot: "bg-violet-400",
        },
        Delivered: {
            label: "Delivered",
            bg: "bg-emerald-50",
            text: "text-emerald-700",
            dot: "bg-emerald-400",
        },
        Cancelled: {
            label: "Cancelled",
            bg: "bg-red-50",
            text: "text-red-700",
            dot: "bg-red-400",
        },
    };
    return styles[status] ?? {
        label: status,
        bg: "bg-zinc-50",
        text: "text-zinc-700",
        dot: "bg-zinc-400",
    };
}

function parseProducts(products: string) {
    try {
        return JSON.parse(products) as {
            id: string;
            title: string;
            price: number;
            quantity: number;
            image: string;
            size: string;
        }[];
    } catch {
        return [];
    }
}

// ─── Filters ─────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
    { label: "All", value: "" },
    { label: "Pending", value: "Pending" },
    { label: "Processing", value: "Processing" },
    { label: "Shipped", value: "Shipped" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
] as const;

// ─── State: Loading ──────────────────────────────────────────────────────────

function OrdersSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="h-36 animate-pulse rounded-2xl bg-zinc-100 sm:h-44 sm:rounded-3xl"
                />
            ))}
        </div>
    );
}

// ─── State: Empty ────────────────────────────────────────────────────────────

function OrdersEmpty() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 p-10 text-center sm:p-12"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 sm:h-16 sm:w-16">
                <PackageOpen size={24} className="text-zinc-400 sm:h-7 sm:w-7" />
            </div>
            <h2 className="mt-4 font-serif text-lg font-semibold text-zinc-900 sm:mt-5 sm:text-xl">
                No orders yet
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                Your order history will appear here once you make your first
                purchase.
            </p>
            <Link href="/shop">
                <Button
                    className="mt-6 rounded-xl"
                    leftIcon={<ShoppingBag size={16} />}
                    rightIcon={<ArrowRight size={16} />}
                >
                    Start Shopping
                </Button>
            </Link>
        </motion.div>
    );
}

// ─── State: Error ────────────────────────────────────────────────────────────

function OrdersError({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center rounded-3xl border border-red-200 bg-red-50/50 p-10 text-center sm:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 sm:h-16 sm:w-16">
                <AlertCircle size={24} className="text-red-400 sm:h-7 sm:w-7" />
            </div>
            <h2 className="mt-4 font-serif text-lg font-semibold text-red-900 sm:mt-5 sm:text-xl">
                Couldn&apos;t load orders
            </h2>
            <p className="mt-2 text-sm text-red-600">
                Something went wrong. Please try again.
            </p>
            <Button
                variant="outline"
                className="mt-6 rounded-xl"
                leftIcon={<RefreshCw size={16} />}
                onClick={onRetry}
            >
                Try Again
            </Button>
        </div>
    );
}

// ─── Main Profile Orders Page ────────────────────────────────────────────────

export default function ProfileOrdersPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("");

    const fetchOrders = async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getUserOrders();
            setOrders(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load orders.");
            toast.error("Could not load your orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login?redirect=/profile/orders");
            return;
        }
        fetchOrders();
    }, [authLoading, user, router]);

    // ── Filtered orders ──
    const filteredOrders = statusFilter
        ? orders.filter((o) => o.status === statusFilter || o.status.includes(statusFilter))
        : orders;

    // ── Stats ──
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const deliveredCount = orders.filter(
        (o) => o.status === "Delivered",
    ).length;

    if (authLoading || !user) return null;

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50">
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
                {/* Back */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href="/profile"
                        className="group mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-900 sm:mb-6"
                    >
                        <div className="rounded-full border border-zinc-200 bg-white p-1.5 transition group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
                            <ArrowLeft size={14} />
                        </div>
                        Profile
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 sm:h-12 sm:w-12">
                            <Package size={20} className="sm:h-[22px] sm:w-[22px]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                                Profile
                            </p>
                            <h1 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                                My Orders
                            </h1>
                        </div>
                    </div>
                </motion.div>

                {/* Loading */}
                {loading && <OrdersSkeleton />}

                {/* Error */}
                {error && !loading && <OrdersError onRetry={fetchOrders} />}

                {/* Empty */}
                {!loading && !error && filteredOrders.length === 0 && (
                    <OrdersEmpty />
                )}

                {/* Orders List */}
                {!loading && !error && filteredOrders.length > 0 && (
                    <>
                        {/* Stats Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-5 grid grid-cols-3 gap-3"
                        >
                            <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center shadow-sm sm:p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                    Total
                                </p>
                                <p className="mt-1 font-serif text-lg font-bold text-zinc-900 sm:text-xl">
                                    {totalOrders}
                                </p>
                            </div>
                            <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center shadow-sm sm:p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                    Delivered
                                </p>
                                <p className="mt-1 font-serif text-lg font-bold text-emerald-600 sm:text-xl">
                                    {deliveredCount}
                                </p>
                            </div>
                            <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center shadow-sm sm:p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                    Spent
                                </p>
                                <p className="mt-1 font-serif text-lg font-bold text-zinc-900 sm:text-xl">
                                    ₹{totalSpent.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </motion.div>

                        {/* Status Filter */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide"
                        >
                            {STATUS_FILTERS.map((f) => (
                                <button
                                    key={f.value}
                                    type="button"
                                    onClick={() => setStatusFilter(f.value)}
                                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${statusFilter === f.value
                                            ? "bg-zinc-900 text-white shadow"
                                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </motion.div>

                        {/* Orders */}
                        <div className="space-y-3 sm:space-y-4">
                            {filteredOrders.map((order, index) => {
                                const status = getStatusStyle(order.status);
                                const products = parseProducts(order.products);
                                const firstProduct = products[0];

                                return (
                                    <motion.article
                                        key={order.$id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: index * 0.05,
                                            duration: 0.25,
                                        }}
                                        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md sm:rounded-3xl"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 sm:px-6 sm:py-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 sm:h-10 sm:w-10 sm:rounded-xl">
                                                    <Package
                                                        size={14}
                                                        className="text-zinc-500 sm:h-[18px] sm:w-[18px]"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400 sm:text-[10px]">
                                                        Placed on
                                                    </p>
                                                    <p className="text-xs font-medium text-zinc-900 sm:text-sm">
                                                        {formatDate(
                                                            order.$createdAt,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs ${status.bg} ${status.text}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                                />
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Body */}
                                        <div className="px-4 py-3 sm:px-6 sm:py-4">
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                {firstProduct && (
                                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-20 sm:w-20">
                                                        <img
                                                            src={firstProduct.image}
                                                            alt={firstProduct.title}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                (
                                                                    e.target as HTMLImageElement
                                                                ).style.display =
                                                                    "none";
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 sm:text-base">
                                                        {firstProduct?.title ||
                                                            "Order items"}
                                                    </h3>
                                                    {firstProduct && (
                                                        <p className="mt-0.5 text-[11px] text-zinc-500 sm:text-xs">
                                                            Size{" "}
                                                            {firstProduct.size} • Qty{" "}
                                                            {firstProduct.quantity}
                                                        </p>
                                                    )}
                                                    {products.length > 1 && (
                                                        <p className="mt-0.5 text-[11px] text-zinc-400 sm:text-xs">
                                                            +{products.length - 1}{" "}
                                                            more{" "}
                                                            {products.length - 1 === 1
                                                                ? "item"
                                                                : "items"}
                                                        </p>
                                                    )}
                                                    <div className="mt-1.5 flex items-center gap-2 sm:mt-2">
                                                        <span className="text-[11px] text-zinc-400 sm:text-xs">
                                                            {order.city}
                                                        </span>
                                                        <span className="text-zinc-300">
                                                            •
                                                        </span>
                                                        <span className="font-serif text-sm font-bold text-zinc-900 sm:text-base">
                                                            {formatCurrency(
                                                                order.total,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-4 py-2.5 sm:px-6 sm:py-3">
                                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 sm:text-xs">
                                                <Clock size={12} className="sm:h-[14px] sm:w-[14px]" />
                                                <span>
                                                    {order.paymentMethod === "cod"
                                                        ? "Pay on delivery"
                                                        : "Paid online"}
                                                </span>
                                            </div>

                                            <Link
                                                href={`/orders/${order.$id}`}
                                            >
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    rightIcon={
                                                        <ArrowRight size={12} className="sm:hidden" />
                                                    }
                                                    className="rounded-lg text-[11px] sm:rounded-xl sm:text-xs"
                                                >
                                                    <span className="hidden sm:inline">Track</span>
                                                    Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

