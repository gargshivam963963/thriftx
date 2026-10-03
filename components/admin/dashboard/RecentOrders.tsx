"use client";

import { motion } from "framer-motion";
import { ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface RecentOrder {
    $id: string;
    $createdAt: string;
    orderId: string;
    status: string;
    total: number;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    products: string;
}

interface RecentOrdersProps {
    orders: RecentOrder[];
    loading?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
    "Pending (COD)": "status-badge-pending",
    Pending: "status-badge-pending",
    Processing: "status-badge-processing",
    Shipped: "status-badge-shipped",
    Delivered: "status-badge-delivered",
    Cancelled: "status-badge-cancelled",
};

export default function RecentOrders({ orders, loading = false }: RecentOrdersProps) {
    if (loading) {
        return (
            <div className="admin-card p-6">
                <div className="space-y-3">
                    <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                                <div className="h-2 w-1/3 animate-pulse rounded bg-muted" />
                            </div>
                            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="admin-card p-6">
                <div className="flex flex-col items-center gap-3 py-8">
                    <ShoppingCart size={32} className="text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No orders yet</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="admin-card p-6"
        >
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-caption font-semibold text-muted-foreground">
                        Recent Orders
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Latest {orders.length} orders
                    </p>
                </div>
                <Link
                    href="/admin/orders"
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                >
                    View All <ArrowRight size={14} />
                </Link>
            </div>

            <div className="space-y-2">
                {orders.slice(0, 6).map((order) => {
                    const productCount = (() => {
                        try {
                            const p = JSON.parse(order.products);
                            return Array.isArray(p) ? p.length : 0;
                        } catch {
                            return 0;
                        }
                    })();

                    return (
                        <Link
                            key={order.$id}
                            href={`/admin/orders`}
                            className="group flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-muted"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <ShoppingCart size={16} className="text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                        {order.firstName} {order.lastName}
                                    </p>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        #{order.orderId?.slice(0, 8).toUpperCase() || order.$id.slice(0, 8).toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {productCount} {productCount === 1 ? "item" : "items"} • {order.city}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <p className="text-sm font-bold text-foreground">
                                    ₹{order.total.toLocaleString("en-IN")}
                                </p>
                                <span
                                    className={cn(
                                        "status-badge",
                                        STATUS_STYLES[order.status] || "status-badge-pending",
                                    )}
                                >
                                    {order.status}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </motion.div>
    );
}

