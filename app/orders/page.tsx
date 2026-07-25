"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Package,
    Search,
    ArrowRight,
    ShoppingBag,
    Sparkles,
    AlertCircle,
    RefreshCw,
    PackageOpen,
    Clock,
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

// ─── State: Loading ──────────────────────────────────────────────────────────

function OrdersSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="h-44 animate-pulse rounded-3xl bg-zinc-100 sm:h-48"
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
            className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center"
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                <PackageOpen size={28} className="text-zinc-400" />
            </div>
            <h2 className="mt-5 font-serif text-xl font-semibold text-zinc-900">
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
        <div className="flex flex-col items-center rounded-3xl border border-red-200 bg-red-50/50 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle size={28} className="text-red-400" />
            </div>
            <h2 className="mt-5 font-serif text-xl font-semibold text-red-900">
                Failed to load orders
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

// ─── Main Orders Page ────────────────────────────────────────────────────────

export default function OrdersPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            router.replace("/login?redirect=/orders");
            return;
        }
        fetchOrders();
    }, [authLoading, user, router]);

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50">
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-900/20">
                            <Package size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                                Your Orders
                            </p>
                            <h1 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                                Order History
                            </h1>
                        </div>
                    </div>

                    {!loading && !error && orders.length > 0 && (
                        <p className="mt-2 text-sm text-zinc-500">
                            {orders.length}{" "}
                            {orders.length === 1 ? "order" : "orders"} placed
                        </p>
                    )}
                </motion.div>

                {/* States */}
                {loading && <OrdersSkeleton />}
                {error && !loading && <OrdersError onRetry={fetchOrders} />}

                {!loading && !error && orders.length === 0 && <OrdersEmpty />}

                {/* Orders List */}
                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order, index) => {
                            const status = getStatusStyle(order.status);
                            const products = parseProducts(order.products);
                            const firstProduct = products[0];

                            return (
                                <motion.article
                                    key={order.$id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: index * 0.06,
                                        duration: 0.3,
                                    }}
                                    className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                                                <Package
                                                    size={18}
                                                    className="text-zinc-500"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                                    Order Placed
                                                </p>
                                                <p className="text-sm font-medium text-zinc-900">
                                                    {formatDate(
                                                        order.$createdAt,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${status.bg} ${status.text}`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                            />
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="px-5 py-4 sm:px-6">
                                        <div className="flex items-start gap-4">
                                            {/* Product thumbnail */}
                                            {firstProduct && (
                                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-20 sm:w-20">
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
                                                    <p className="mt-0.5 text-xs text-zinc-500">
                                                        Size {firstProduct.size}{" "}
                                                        • Qty{" "}
                                                        {firstProduct.quantity}
                                                    </p>
                                                )}
                                                {products.length > 1 && (
                                                    <p className="mt-1 text-xs text-zinc-400">
                                                        +{products.length - 1}{" "}
                                                        more{" "}
                                                        {products.length - 1 === 1
                                                            ? "item"
                                                            : "items"}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-xs text-zinc-400">
                                                        {order.city}
                                                    </span>
                                                    <span className="text-zinc-300">
                                                        •
                                                    </span>
                                                    <span className="font-serif text-base font-bold text-zinc-900">
                                                        {formatCurrency(
                                                            order.total,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-3 sm:px-6">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <Clock size={12} />
                                                <span>
                                                    {order.paymentMethod ===
                                                        "cod"
                                                        ? "Pay on delivery"
                                                        : "Paid online"}
                                                </span>
                                            </div>

                                            <Link
                                                href={`/orders/${order.$id}`}
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    rightIcon={
                                                        <ArrowRight size={14} />
                                                    }
                                                    className="rounded-xl text-xs"
                                                >
                                                    Track Order
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

