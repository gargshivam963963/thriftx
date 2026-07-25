"use client";

import { motion } from "framer-motion";
import { Package, TrendingUp } from "lucide-react";
import type { TopProduct } from "@/lib/services/adminService";

interface TopProductsProps {
    products: TopProduct[];
    loading?: boolean;
}

export default function TopProducts({ products, loading = false }: TopProductsProps) {
    if (loading) {
        return (
            <div className="admin-card p-6">
                <div className="space-y-4">
                    <div className="h-5 w-32 animate-pulse rounded bg-[var(--color-bg-muted)]" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded-xl bg-[var(--color-bg-muted)]" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--color-bg-muted)]" />
                                <div className="h-2 w-1/2 animate-pulse rounded bg-[var(--color-bg-muted)]" />
                            </div>
                            <div className="h-4 w-16 animate-pulse rounded bg-[var(--color-bg-muted)]" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="admin-card p-6">
                <div className="flex flex-col items-center gap-3 py-8">
                    <Package size={32} className="text-[var(--color-text-muted)]" />
                    <p className="text-sm text-[var(--color-text-muted)]">No product data yet</p>
                </div>
            </div>
        );
    }

    const maxSold = Math.max(...products.map((p) => p.totalSold), 1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="admin-card p-6"
        >
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                        Top Products
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                        Best selling this month
                    </p>
                </div>
                <TrendingUp size={18} className="text-emerald-500" />
            </div>

            <div className="space-y-3">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="group flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-[var(--color-bg-muted)]"
                    >
                        {/* Rank */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-muted)] text-xs font-bold text-[var(--color-text-secondary)]">
                            {index + 1}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                                {product.title}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                {product.brand} • {product.category}
                            </p>
                        </div>

                        {/* Sales bar */}
                        <div className="hidden w-24 sm:block">
                            <div className="flex h-2 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-800 transition-all duration-500 dark:from-zinc-400 dark:to-zinc-100"
                                    style={{
                                        width: `${Math.max((product.totalSold / maxSold) * 100, 10)}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                            <p className="text-sm font-bold text-[var(--color-text)]">
                                {product.totalSold}
                            </p>
                            <p className="text-[10px] text-[var(--color-text-muted)]">sold</p>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

