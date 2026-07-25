"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Package,
    MapPin,
    BarChart3,
    DollarSign,
    ShoppingCart,
    Calendar,
} from "lucide-react";

import StatsCard from "@/components/admin/dashboard/StatsCard";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import TopProducts from "@/components/admin/dashboard/TopProducts";
import CategoryChart from "@/components/admin/dashboard/CategoryChart";
import {
    getSalesAnalytics,
    OrderAnalytics,
} from "@/lib/services/adminService";

export default function AdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSalesAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error("Error loading analytics:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAnalytics();
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [loadAnalytics]);

    const totalRevenue = useMemo(
        () => analytics?.dailySales.reduce((sum, d) => sum + d.revenue, 0) ?? 0,
        [analytics],
    );

    const totalOrders = useMemo(
        () => analytics?.dailySales.reduce((sum, d) => sum + d.orders, 0) ?? 0,
        [analytics],
    );

    const avgDailyRevenue = useMemo(
        () =>
            analytics?.dailySales.length
                ? Math.round(totalRevenue / analytics.dailySales.length)
                : 0,
        [analytics, totalRevenue],
    );

    const topCategory = useMemo(() => {
        if (!analytics?.categoryDistribution.length) return "N/A";
        return analytics.categoryDistribution.sort((a, b) => b.count - a.count)[0]
            .category;
    }, [analytics]);

    const bestDay = useMemo(() => {
        if (!analytics?.dailySales.length) return null;
        return analytics.dailySales.sort((a, b) => b.revenue - a.revenue)[0];
    }, [analytics]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="font-serif text-2xl font-bold text-[var(--color-text)]">
                    Marketing Analytics
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)]">
                    Deep insights into your store performance
                </p>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue (30d)"
                    value={`₹${totalRevenue.toLocaleString("en-IN")}`}
                    subtitle="Last 30 days"
                    icon={<DollarSign size={18} />}
                    delay={0}
                    loading={loading}
                />
                <StatsCard
                    title="Total Orders (30d)"
                    value={totalOrders}
                    subtitle="Last 30 days"
                    icon={<ShoppingCart size={18} />}
                    delay={1}
                    loading={loading}
                />
                <StatsCard
                    title="Avg. Daily Revenue"
                    value={`₹${avgDailyRevenue.toLocaleString("en-IN")}`}
                    subtitle="Per day"
                    icon={<BarChart3 size={18} />}
                    delay={2}
                    loading={loading}
                />
                <StatsCard
                    title="Top Category"
                    value={topCategory}
                    subtitle="Best performing"
                    icon={<Package size={18} />}
                    delay={3}
                    loading={loading}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                <RevenueChart data={analytics?.dailySales ?? []} loading={loading} />
                <CategoryChart data={analytics?.categoryDistribution ?? []} loading={loading} />
            </div>

            {/* Top Products */}
            <TopProducts products={analytics?.topProducts ?? []} loading={loading} />

            {/* Best Day */}
            {bestDay && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-card p-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                            <Calendar size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                                Best Performing Day
                            </p>
                            <p className="font-serif text-xl font-bold text-[var(--color-text)]">
                                {new Date(bestDay.date).toLocaleDateString("en-IN", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                })}
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                ₹{bestDay.revenue.toLocaleString("en-IN")} revenue • {bestDay.orders} orders
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Status Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="admin-card p-6"
            >
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                    Order Status Distribution
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(analytics?.statusDistribution ?? []).map((item) => (
                        <div
                            key={item.status}
                            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-3"
                        >
                            <span className="text-sm font-medium text-[var(--color-text)]">
                                {item.status}
                            </span>
                            <span className="text-sm font-bold text-[var(--color-text)]">
                                {item.count}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

