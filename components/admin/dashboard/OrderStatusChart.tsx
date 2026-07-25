"use client";

import { motion } from "framer-motion";

interface OrderStatusChartProps {
    data: { status: string; count: number }[];
    loading?: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
    "Pending (COD)": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", bar: "bg-amber-500" },
    "Pending": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", bar: "bg-amber-500" },
    "Processing": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", bar: "bg-blue-500" },
    "Shipped": { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400", bar: "bg-indigo-500" },
    "Delivered": { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", bar: "bg-emerald-500" },
    "Cancelled": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", bar: "bg-red-500" },
};

export default function OrderStatusChart({ data, loading = false }: OrderStatusChartProps) {
    if (loading) {
        return (
            <div className="admin-card p-6">
                <div className="space-y-4">
                    <div className="h-5 w-32 animate-pulse rounded bg-[var(--color-bg-muted)]" />
                    <div className="flex justify-center">
                        <div className="h-36 w-36 animate-pulse rounded-full bg-[var(--color-bg-muted)]" />
                    </div>
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="admin-card p-6">
                <p className="text-center text-sm text-[var(--color-text-muted)]">
                    No order status data
                </p>
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + d.count, 0);

    // Calculate bar segments
    const segments = data.map((d) => {
        const percentage = (d.count / total) * 100;

        return {
            ...d,
            percentage,
            color: STATUS_COLORS[d.status]?.bar || "bg-zinc-500",
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="admin-card p-6"
        >
            <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                    Order Status
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                    {total} total orders
                </p>
            </div>

            {/* Simple bar chart instead of donut for clarity */}
            <div className="space-y-2">
                {segments.map((item) => {
                    const colors = STATUS_COLORS[item.status] || STATUS_COLORS["Pending"];

                    return (
                        <div key={item.status} className="flex items-center gap-3">
                            <div className="w-full flex-1">
                                <div className="mb-0.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${colors.bar}`} />
                                        <span className="text-xs font-medium text-[var(--color-text)]">
                                            {item.status}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                        {item.count} ({item.percentage.toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="flex h-2 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percentage}%` }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className={`h-full rounded-full ${colors.bar}`}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

