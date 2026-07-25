"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    TrendingUp,
    Activity,
    Sparkles,
} from "lucide-react";

import StatsCard from "@/components/admin/dashboard/StatsCard";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import TopProducts from "@/components/admin/dashboard/TopProducts";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import CategoryChart from "@/components/admin/dashboard/CategoryChart";
import OrderStatusChart from "@/components/admin/dashboard/OrderStatusChart";
import CustomerInsights from "@/components/admin/dashboard/CustomerInsights";
import {
    getDashboardStats,
    getSalesAnalytics,
    getAllOrders,
    DashboardStats,
    OrderAnalytics,
} from "@/lib/services/adminService";
import type { Order } from "@/lib/types/order";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const greeting = getGreeting();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsData, analyticsData, ordersData] = await Promise.all([
                getDashboardStats(),
                getSalesAnalytics(),
                getAllOrders(),
            ]);
            setStats(statsData);
            setAnalytics(analyticsData);
            setOrders(ordersData);
        } catch (error) {
            console.error("Dashboard load error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [loadData]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-serif text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
                            {greeting}, Admin
                        </h1>
                        <Sparkles size={20} className="text-amber-400" />
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        Here&apos;s what&apos;s happening with your store today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        All systems operational
                    </span>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatsCard
                    title="Total Revenue"
                    value={stats ? `₹${stats.totalRevenue.toLocaleString("en-IN")}` : "—"}
                    subtitle="All time"
                    icon={<DollarSign size={18} />}
                    trend={12.5}
                    trendLabel="vs last month"
                    delay={0}
                    loading={loading}
                />
                <StatsCard
                    title="Total Orders"
                    value={stats?.totalOrders ?? "—"}
                    subtitle="All orders placed"
                    icon={<ShoppingCart size={18} />}
                    trend={8.2}
                    trendLabel="vs last month"
                    delay={1}
                    loading={loading}
                />
                <StatsCard
                    title="Active Products"
                    value={stats?.activeProducts ?? "—"}
                    subtitle={`${stats?.totalProducts ?? 0} total products`}
                    icon={<Package size={18} />}
                    trend={-2.1}
                    trendLabel="vs last month"
                    delay={2}
                    loading={loading}
                />
                <StatsCard
                    title="Avg Order Value"
                    value={stats ? `₹${stats.averageOrderValue.toLocaleString("en-IN")}` : "—"}
                    subtitle="Per order"
                    icon={<TrendingUp size={18} />}
                    trend={5.3}
                    trendLabel="vs last month"
                    delay={3}
                    loading={loading}
                />
                <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers ?? "—"}
                    subtitle={`${stats?.newUsersThisMonth ?? 0} new this month`}
                    icon={<Users size={18} />}
                    trend={15.8}
                    trendLabel="vs last month"
                    delay={4}
                    loading={loading}
                />
                <StatsCard
                    title="Conversion Rate"
                    value={stats ? `${stats.conversionRate}%` : "—"}
                    subtitle="Visit to purchase"
                    icon={<Activity size={18} />}
                    trend={0.8}
                    trendLabel="vs last month"
                    delay={5}
                    loading={loading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                <RevenueChart
                    data={analytics?.dailySales ?? []}
                    loading={loading}
                />
                <CategoryChart
                    data={analytics?.categoryDistribution ?? []}
                    loading={loading}
                />
            </div>

            {/* Products + Orders */}
            <div className="grid gap-6 lg:grid-cols-2">
                <TopProducts
                    products={analytics?.topProducts ?? []}
                    loading={loading}
                />
                <RecentOrders
                    orders={orders as any}
                    loading={loading}
                />
            </div>

            {/* Status + Insights */}
            <div className="grid gap-6 lg:grid-cols-2">
                <OrderStatusChart
                    data={analytics?.statusDistribution ?? []}
                    loading={loading}
                />
                <CustomerInsights
                    stats={{
                        totalCustomers: stats?.totalUsers ?? 0,
                        newThisMonth: stats?.newUsersThisMonth ?? 0,
                        topCities: [],
                        averageOrdersPerCustomer: stats?.totalUsers
                            ? (stats?.totalOrders ?? 0) / stats.totalUsers
                            : 0,
                    }}
                    loading={loading}
                />
            </div>
        </div>
    );
}

