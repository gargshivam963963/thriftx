"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Package,
    ArrowRight,
    ShoppingBag,
    AlertCircle,
    PackageOpen,
    Clock,
} from "lucide-react";
import { toast } from "sonner";

import PremiumImage from "@/components/ui/PremiumImage";
import EmptyState from "@/components/ui/EmptyState";
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

// ─── State: Loading ──────────────────────────────────────────────────────────

function OrdersSkeleton() {
    return (
        <div className="space-y-4" role="status" aria-label="Loading orders">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="skeleton-glass h-44 rounded-3xl sm:h-48"
                />
            ))}
            <span className="sr-only">Loading your orders…</span>
        </div>
    );
}

// ─── State: Empty ────────────────────────────────────────────────────────────

function OrdersEmpty() {
    return (
        <EmptyState
            icon={<PackageOpen size={28} className="text-muted-foreground" />}
            title="No orders yet"
            description="Your order history will appear here once you make your first purchase."
        >
            <Link href="/shop">
                <Button
                    className="mt-6 rounded-xl"
                    leftIcon={<ShoppingBag size={16} />}
                    rightIcon={<ArrowRight size={16} />}
                >
                    Start Shopping
                </Button>
            </Link>
        </EmptyState>
    );
}

// ─── State: Error ────────────────────────────────────────────────────────────

function OrdersError({ onRetry }: { onRetry: () => void }) {
    return (
        <EmptyState
            className="border-error-bg bg-error-bg"
            icon={<AlertCircle size={28} className="text-error" />}
            title="Failed to load orders"
            description="Something went wrong. Please try again."
            actionLabel="Try Again"
            onAction={onRetry}
        />
    );
}

// ─── Main Orders Page ────────────────────────────────────────────────────────

export default function OrdersPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            router.replace("/login?redirect=/orders");
            return;
        }
        fetchOrders();
    }, [authLoading, user, router, fetchOrders]);

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg">
                            <Package size={22} />
                        </div>
                        <div>
                            <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Your Orders
                            </p>
                            <h1 className="font-display text-heading-2 font-bold tracking-tight text-foreground">
                                Order History
                            </h1>
                        </div>
                    </div>

                    {!loading && !error && orders.length > 0 && (
                        <p className="mt-2 text-body-sm text-muted-foreground">
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
                                    className="overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all hover:shadow-modal"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                                                <Package
                                                    size={18}
                                                    className="text-muted-foreground"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-caption font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                                    Order Placed
                                                </p>
                                                <p className="text-body-sm font-medium text-foreground">
                                                    {formatDate(
                                                        order.$createdAt,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {order.returnStatus && order.returnStatus !== "none" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2.5 py-1 text-small font-semibold text-warning-foreground">
                                                    Return: {order.returnStatus}
                                                </span>
                                            )}
                                            {order.refundStatus && order.refundStatus !== "none" && order.returnStatus !== "refunded" && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-info-bg px-2.5 py-1 text-small font-semibold text-info-foreground">
                                                    Refund: {order.refundStatus}
                                                </span>
                                            )}
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-small font-medium ${status.bg} ${status.text}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                                />
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="px-5 py-4 sm:px-6">
                                        <div className="flex items-start gap-4">
                                            {/* Product thumbnail */}
                                            {firstProduct && (
                                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-20">
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
                                                <h3 className="line-clamp-1 text-body-sm font-semibold text-foreground sm:text-body">
                                                    {firstProduct?.title ||
                                                        "Order items"}
                                                </h3>
                                                {firstProduct && (
                                                    <p className="mt-0.5 text-small text-muted-foreground">
                                                        Size {firstProduct.size}{" "}
                                                        • Qty{" "}
                                                        {firstProduct.quantity}
                                                    </p>
                                                )}
                                                {products.length > 1 && (
                                                    <p className="mt-1 text-small text-muted-foreground">
                                                        +{products.length - 1}{" "}
                                                        more{" "}
                                                        {products.length - 1 === 1
                                                            ? "item"
                                                            : "items"}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-small text-muted-foreground">
                                                        {order.city}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        •
                                                    </span>
                                                    <span className="font-display text-body font-bold text-foreground">
                                                        {formatCurrency(
                                                            order.total,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="border-t border-border bg-muted px-5 py-3 sm:px-6">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-small text-muted-foreground">
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
                                                    className="rounded-xl text-small"
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
