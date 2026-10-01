"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Package,
    ArrowRight,
    ShoppingBag,
    AlertCircle,
    RefreshCw,
    PackageOpen,
    Clock,
} from "lucide-react";
import { toast } from "sonner";

import PremiumImage from "@/components/ui/PremiumImage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { getUserOrders } from "@/lib/client/orders";
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
            bg: "bg-warning-bg",
            text: "text-warning-foreground",
            dot: "bg-warning",
        },
        Pending: {
            label: "Pending",
            bg: "bg-warning-bg",
            text: "text-warning-foreground",
            dot: "bg-warning",
        },
        Processing: {
            label: "Processing",
            bg: "bg-info-bg",
            text: "text-info-foreground",
            dot: "bg-info",
        },
        Shipped: {
            label: "Shipped",
            bg: "bg-info-bg",
            text: "text-info-foreground",
            dot: "bg-info",
        },
        Delivered: {
            label: "Delivered",
            bg: "bg-success-bg",
            text: "text-success-foreground",
            dot: "bg-success",
        },
        Cancelled: {
            label: "Cancelled",
            bg: "bg-error-bg",
            text: "text-error-foreground",
            dot: "bg-error",
        },
    };
    return styles[status] ?? {
        label: status,
        bg: "bg-muted",
        text: "text-muted-foreground",
        dot: "bg-muted-foreground",
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
                    className="h-36 animate-pulse rounded-2xl bg-muted sm:h-44 sm:rounded-3xl"
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
            className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-muted/50 p-10 text-center sm:p-12"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted sm:h-16 sm:w-16">
                <PackageOpen size={24} className="text-muted-foreground sm:h-7 sm:w-7" />
            </div>
            <h2 className="mt-4 font-display text-heading-4 font-semibold text-foreground sm:mt-5">
                No orders yet
            </h2>
            <p className="mt-2 max-w-sm text-body-sm leading-6 text-muted-foreground">
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
        <div className="flex flex-col items-center rounded-3xl border border-error-bg bg-error-bg/50 p-10 text-center sm:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-bg sm:h-16 sm:w-16">
                <AlertCircle size={24} className="text-error sm:h-7 sm:w-7" />
            </div>
            <h2 className="mt-4 font-sans text-heading-4 font-semibold text-error-foreground sm:mt-5">
                Couldn&apos;t load orders
            </h2>
            <p className="mt-2 text-body-sm text-error">
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

    const fetchOrders = useCallback(async () => {
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
    }, [user]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login?redirect=/profile/orders");
            return;
        }
        fetchOrders();
    }, [authLoading, user, router, fetchOrders]);

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
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
                {/* Back */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href="/profile"
                        className="group mb-5 inline-flex items-center gap-2 text-body-sm font-medium text-muted-foreground transition hover:text-foreground sm:mb-6"
                    >
                        <div className="rounded-full border border-border bg-card p-1.5 transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
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
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg shadow-foreground/20 sm:h-12 sm:w-12">
                            <Package size={20} className="sm:h-[22px] sm:w-[22px]" />
                        </div>
                        <div>
                            <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Profile
                            </p>
                            <h1 className="font-display text-heading-3 font-bold tracking-tight text-foreground sm:text-heading-2">
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
                            <div className="rounded-xl border border-border bg-card p-3 text-center shadow-card sm:p-4">
                                <p className="text-caption font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                    Total
                                </p>
                                <p className="mt-1 font-sans text-heading-4 font-bold text-foreground">
                                    {totalOrders}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-3 text-center shadow-card sm:p-4">
                                <p className="text-caption font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                    Delivered
                                </p>
                                <p className="mt-1 font-sans text-heading-4 font-bold text-success">
                                    {deliveredCount}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-3 text-center shadow-card sm:p-4">
                                <p className="text-caption font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                    Spent
                                </p>
                                <p className="mt-1 font-sans text-heading-4 font-bold text-foreground">
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
                                <Button
                                    key={f.value}
                                    type="button"
                                    size="sm"
                                    variant={statusFilter === f.value ? "primary" : "outline"}
                                    onClick={() => setStatusFilter(f.value)}
                                    className="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium"
                                >
                                    {f.label}
                                </Button>
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
                                        className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-md sm:rounded-3xl"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted sm:h-10 sm:w-10 sm:rounded-xl">
                                                    <Package
                                                        size={14}
                                                        className="text-muted-foreground sm:h-[18px] sm:w-[18px]"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-badge font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                                        Placed on
                                                    </p>
                                                    <p className="text-small font-medium text-foreground">
                                                        {formatDate(
                                                            order.$createdAt,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-badge font-medium sm:gap-1.5 sm:px-3 sm:py-1 sm:text-small ${status.bg} ${status.text}`}
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
                                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-20">
                                                        <PremiumImage
                                                            src={firstProduct.image || "/images/placeholder.jpg"}
                                                            alt={firstProduct.title}
                                                            fill
                                                            sizes="80px"
                                                            className="object-cover"
                                                            fallbackSrc="/images/placeholder.jpg"
                                                        />
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="line-clamp-1 font-sans text-body-sm font-semibold text-foreground sm:text-body">
                                                        {firstProduct?.title ||
                                                            "Order items"}
                                                    </h3>
                                                    {firstProduct && (
                                                        <p className="mt-0.5 text-small text-muted-foreground">
                                                            Size{" "}
                                                            {firstProduct.size} • Qty{" "}
                                                            {firstProduct.quantity}
                                                        </p>
                                                    )}
                                                    {products.length > 1 && (
                                                        <p className="mt-0.5 text-small text-muted-foreground">
                                                            +{products.length - 1}{" "}
                                                            more{" "}
                                                            {products.length - 1 === 1
                                                                ? "item"
                                                                : "items"}
                                                        </p>
                                                    )}
                                                    <div className="mt-1.5 flex items-center gap-2 sm:mt-2">
                                                        <span className="text-small text-muted-foreground">
                                                            {order.city}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            •
                                                        </span>
                                                        <span className="font-sans text-body-sm font-bold text-foreground sm:text-body">
                                                            {formatCurrency(
                                                                order.total,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between border-t border-border bg-muted px-4 py-2.5 sm:px-6 sm:py-3">
                                            <div className="flex items-center gap-1.5 text-small text-muted-foreground">
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
                                                    className="rounded-lg text-small sm:rounded-xl"
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
