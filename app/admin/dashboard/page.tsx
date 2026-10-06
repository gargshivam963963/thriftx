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
import AdminPage from "@/components/admin/AdminPage";
import OrderStatusChart from "@/components/admin/dashboard/OrderStatusChart";
import CustomerInsights from "@/components/admin/dashboard/CustomerInsights";
import type {
    DashboardStats,
    OrderAnalytics,
} from "@/lib/services/adminService";

// API helpers
async function apiGetDashboardStats(): Promise<DashboardStats | null> {
    const res = await fetch('/api/admin/dashboard/stats');
    if (!res.ok) return null;
    const json = await res.json();
    return json?.stats ?? null;
}

async function apiGetSalesAnalytics(): Promise<OrderAnalytics | null> {
    const res = await fetch('/api/admin/dashboard/analytics');
    if (!res.ok) return null;
    const json = await res.json();
    return json?.analytics ?? null;
}

async function apiGetAllOrders(): Promise<Order[]> {
    const res = await fetch('/api/admin/orders');
    if (!res.ok) return [];
    const json = await res.json();
    return json?.orders ?? [];
}
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
                apiGetDashboardStats(),
                apiGetSalesAnalytics(),
                apiGetAllOrders(),
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
    }, [loadData]);

    return (
        <AdminPage width="wide" className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                            {greeting}, Admin
                        </h1>
                        <Sparkles size={20} className="text-amber-400" aria-hidden="true" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Here&apos;s what&apos;s happening with your store today.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-foreground">
                        All systems operational
                    </span>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <StatsCard
                    title="Total Revenue"
                    value={stats ? `₹${stats.totalRevenue.toLocaleString("en-IN")}` : "—"}
                    subtitle="All time"
                    icon={<DollarSign size={18} />}
                    delay={0}
                    loading={loading}
                />
                <StatsCard
                    title="Total Orders"
                    value={stats?.totalOrders ?? "—"}
                    subtitle="All orders placed"
                    icon={<ShoppingCart size={18} />}
                    delay={1}
                    loading={loading}
                />
                <StatsCard
                    title="Active Products"
                    value={stats?.activeProducts ?? "—"}
                    subtitle={`${stats?.totalProducts ?? 0} total products`}
                    icon={<Package size={18} />}
                    delay={2}
                    loading={loading}
                />
                <StatsCard
                    title="Avg Order Value"
                    value={stats ? `₹${stats.averageOrderValue.toLocaleString("en-IN")}` : "—"}
                    subtitle="Per order"
                    icon={<TrendingUp size={18} />}
                    delay={3}
                    loading={loading}
                />
                <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers ?? "—"}
                    subtitle={`${stats?.newUsersThisMonth ?? 0} new this month`}
                    icon={<Users size={18} />}
                    delay={4}
                    loading={loading}
                />
                <StatsCard
                    title="Conversion Rate"
                    value={stats ? `${stats.conversionRate}%` : "—"}
                    subtitle="Visit to purchase"
                    icon={<Activity size={18} />}
                    delay={5}
                    loading={loading}
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 xl:grid-cols-2">
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
            <div className="grid gap-6 xl:grid-cols-2">
                <TopProducts
                    products={analytics?.topProducts ?? []}
                    loading={loading}
                />
                <RecentOrders
                    orders={orders}
                    loading={loading}
                />
            </div>

            {/* Status + Insights */}
            <div className="grid gap-6 xl:grid-cols-2">
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
        </AdminPage>
    );
}
