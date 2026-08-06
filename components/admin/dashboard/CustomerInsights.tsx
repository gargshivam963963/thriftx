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
                    <div className="h-5 w-36 animate-pulse rounded bg-muted" />
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
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
                <p className="text-caption font-semibold text-muted-foreground">
                    Customer Insights
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-muted p-3">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                    <p className="mt-1 font-display text-xl font-bold text-foreground">
                        {stats.totalCustomers}
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-muted p-3">
                    <div className="flex items-center gap-2">
                        <UserPlus size={16} className="text-emerald-500" />
                        <span className="text-xs text-muted-foreground">New (Month)</span>
                    </div>
                    <p className="mt-1 font-display text-xl font-bold text-foreground">
                        {stats.newThisMonth}
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-muted p-3">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={16} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Avg Orders</span>
                    </div>
                    <p className="mt-1 font-display text-xl font-bold text-foreground">
                        {stats.averageOrdersPerCustomer.toFixed(1)}
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-muted p-3">
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Cities</span>
                    </div>
                    <p className="mt-1 font-display text-xl font-bold text-foreground">
                        {stats.topCities.length}
                    </p>
                </div>
            </div>

            {stats.topCities.length > 0 && (
                <div className="mt-3">
                    <p className="mb-2 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                        Top Cities
                    </p>
                    <div className="space-y-1">
                        {stats.topCities.slice(0, 4).map((city) => (
                            <div key={city.city} className="flex items-center justify-between rounded-lg px-2 py-1">
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-muted-foreground" />
                                    <span className="text-xs text-foreground">{city.city}</span>
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground">
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

