"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";

interface CategoryChartProps {
    data: { category: string; count: number; revenue: number }[];
    loading?: boolean;
}

export default function CategoryChart({ data, loading = false }: CategoryChartProps) {
    if (loading) {
        return (
            <div className="admin-card p-6">
                <div className="space-y-4">
                    <div className="h-5 w-28 animate-pulse rounded bg-[var(--color-bg-muted)]" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="h-3 w-20 animate-pulse rounded bg-[var(--color-bg-muted)]" />
                                <div className="h-3 w-12 animate-pulse rounded bg-[var(--color-bg-muted)]" />
                            </div>
                            <div className="h-2 w-full animate-pulse rounded bg-[var(--color-bg-muted)]" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="admin-card p-6">
                <div className="flex flex-col items-center gap-3 py-8">
                    <Package size={32} className="text-[var(--color-text-muted)]" />
                    <p className="text-sm text-[var(--color-text-muted)]">No category data</p>
                </div>
            </div>
        );
    }

    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const totalCount = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="admin-card p-6"
        >
            <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                    Category Distribution
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                    {totalCount} total products across {data.length} categories
                </p>
            </div>

            <div className="space-y-3">
                {data.map((item, i) => {
                    const percentage = (item.count / maxCount) * 100;
                    const totalPercentage = ((item.count / totalCount) * 100).toFixed(1);

                    return (
                        <div key={item.category} className="group">
                            <div className="mb-1 flex items-center justify-between">
                                <p className="text-sm font-medium text-[var(--color-text)]">
                                    {item.category}
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                        {item.count} items
                                    </span>
                                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                        {totalPercentage}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex h-2.5 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-800 dark:from-zinc-400 dark:to-zinc-100"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

