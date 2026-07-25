"use client";

import { motion } from "framer-motion";
import { Users, UserPlus, MapPin, ShoppingBag } from "lucide-react";

interface CustomerInsightsProps {
    stats: {
        totalCustomers: number;
        newThisMonth: number;
        topCities: { city: string; count: number }[];
        averageOrdersPerCustomer: number;
    };
    loading?: boolean;
}

export default function CustomerInsights({ stats, loading = false }: CustomerInsightsProps) {
    if (loading) {
        return (
            <div className="admin-card p-6">
                <div className="space-y-4">
                    <div className="h-5 w-36 animate-pulse rounded bg-[var(--color-bg-muted)]" />
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--color-bg-muted)]" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="admin-card p-6"
        >
            <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                    Customer Insights
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-3">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-[var(--color-text-secondary)]" />
                        <span className="text-xs text-[var(--color-text-muted)]">Total</span>
                    </div>
                    <p className="mt-1 font-serif text-xl font-bold text-[var(--color-text)]">
                        {stats.totalCustomers}
                    </p>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-3">
                    <div className="flex items-center gap-2">
                        <UserPlus size={16} className="text-emerald-500" />
                        <span className="text-xs text-[var(--color-text-muted)]">New (Month)</span>
                    </div>
                    <p className="mt-1 font-serif text-xl font-bold text-[var(--color-text)]">
                        {stats.newThisMonth}
                    </p>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-3">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={16} className="text-[var(--color-text-secondary)]" />
                        <span className="text-xs text-[var(--color-text-muted)]">Avg Orders</span>
                    </div>
                    <p className="mt-1 font-serif text-xl font-bold text-[var(--color-text)]">
                        {stats.averageOrdersPerCustomer.toFixed(1)}
                    </p>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-3">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[var(--color-text-secondary)]" />
                        <span className="text-xs text-[var(--color-text-muted)]">Cities</span>
                    </div>
                    <p className="mt-1 font-serif text-xl font-bold text-[var(--color-text)]">
                        {stats.topCities.length}
                    </p>
                </div>
            </div>

            {stats.topCities.length > 0 && (
                <div className="mt-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                        Top Cities
                    </p>
                    <div className="space-y-1">
                        {stats.topCities.slice(0, 4).map((city) => (
                            <div key={city.city} className="flex items-center justify-between rounded-lg px-2 py-1">
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-[var(--color-text-muted)]" />
                                    <span className="text-xs text-[var(--color-text)]">{city.city}</span>
                                </div>
                                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                    {city.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

