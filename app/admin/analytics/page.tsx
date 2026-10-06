"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    RefreshCw,
    Calendar,
    Download,
    TrendingUp,
} from "lucide-react";

import OverviewCards from "@/components/admin/analytics/OverviewCards";
import TrafficSourcesChart from "@/components/admin/analytics/TrafficSourcesChart";
import SearchAnalytics from "@/components/admin/analytics/SearchAnalytics";
import ProductFunnel from "@/components/admin/analytics/ProductFunnel";
import DeviceBreakdown from "@/components/admin/analytics/DeviceBreakdown";
import TimelineChart from "@/components/admin/analytics/TimelineChart";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import PageHeader from "@/components/ui/PageHeader";
import AdminPage from "@/components/admin/AdminPage";
import type {
    AnalyticsOverview,
    AnalyticsApiResponse,
    TrafficSourcePoint,
    TopPage,
    SearchQueryPoint,
    ProductFunnelPoint,
    DevicePoint,
    TimelinePoint,
} from "@/lib/analytics/admin-types";

const RANGE_OPTIONS = [
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
];

export default function AdminAnalyticsPage() {
    const [range, setRange] = useState("7d");
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [sources, setSources] = useState<TrafficSourcePoint[] | null>(null);
    const [pages, setPages] = useState<TopPage[] | null>(null);
    const [searches, setSearches] = useState<SearchQueryPoint[] | null>(null);
    const [funnel, setFunnel] = useState<ProductFunnelPoint[] | null>(null);
    const [devices, setDevices] = useState<DevicePoint[] | null>(null);
    const [timeline, setTimeline] = useState<TimelinePoint[] | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [overviewRes, sourcesRes, pagesRes, searchesRes, funnelRes, devicesRes, timelineRes] =
                await Promise.all([
                    fetch(`/api/analytics?action=overview&range=${range}`),
                    fetch(`/api/analytics?action=sources&range=${range}`),
                    fetch(`/api/analytics?action=pages&range=${range}`),
                    fetch(`/api/analytics?action=searches&range=${range}`),
                    fetch(`/api/analytics?action=funnel&range=${range}`),
                    fetch(`/api/analytics?action=devices&range=${range}`),
                    fetch(`/api/analytics?action=timeline&range=${range}`),
                ]);

            const [overviewData, sourcesData, pagesData, searchesData, funnelData, devicesData, timelineData] =
                await Promise.all([
                    overviewRes.json() as Promise<AnalyticsApiResponse<AnalyticsOverview>>,
                    sourcesRes.json() as Promise<AnalyticsApiResponse<TrafficSourcePoint[]>>,
                    pagesRes.json() as Promise<AnalyticsApiResponse<TopPage[]>>,
                    searchesRes.json() as Promise<AnalyticsApiResponse<SearchQueryPoint[]>>,
                    funnelRes.json() as Promise<AnalyticsApiResponse<ProductFunnelPoint[]>>,
                    devicesRes.json() as Promise<AnalyticsApiResponse<DevicePoint[]>>,
                    timelineRes.json() as Promise<AnalyticsApiResponse<TimelinePoint[]>>,
                ]);

            if (overviewData.success) setOverview(overviewData.data);
            if (sourcesData.success) setSources(sourcesData.data);
            if (pagesData.success) setPages(pagesData.data);
            if (searchesData.success) setSearches(searchesData.data);
            if (funnelData.success) setFunnel(funnelData.data);
            if (devicesData.success) setDevices(devicesData.data);
            if (timelineData.success) setTimeline(timelineData.data);
        } catch (error) {
            console.error("Failed to load analytics:", error);
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <AdminPage width="wide">
            {/* ── Header ─────────────────────────────────────── */}
            <PageHeader
                title="Customer Analytics"
                icon={<BarChart3 className="text-violet-500" />}
                description="Track user behavior, clicks, searches, and conversion patterns"
                actions={
                    <>
                        <SegmentedControl
                            value={range}
                            onChange={setRange}
                            ariaLabel="Analytics date range"
                            idPrefix="admin-analytics-range"
                            options={RANGE_OPTIONS.map((opt) => ({
                                value: opt.value,
                                label: opt.label,
                            }))}
                        />

                        <Button
                            variant="outline"
                            size="md"
                            onClick={loadData}
                            disabled={loading}
                            leftIcon={
                                <RefreshCw
                                    size={15}
                                    className={loading ? "animate-spin" : ""}
                                />
                            }
                        >
                            Refresh
                        </Button>
                    </>
                }
            />

            {/* ── Overview Cards ────────────────────────────── */}
            <OverviewCards data={overview} loading={loading} />

            {/* ── Timeline Chart ────────────────────────────── */}
            <TimelineChart data={timeline} loading={loading} />

            {/* ── Traffic Sources + Devices ──────────────────── */}
            <div className="grid gap-5 lg:grid-cols-2">
                <TrafficSourcesChart data={sources} loading={loading} />
                <DeviceBreakdown data={devices} loading={loading} />
            </div>

            {/* ── Search Analytics + Product Funnel ──────────── */}
            <div className="grid gap-5 lg:grid-cols-2">
                <SearchAnalytics data={searches} loading={loading} />
                <ProductFunnel data={funnel} loading={loading} />
            </div>

            {/* ── Top Pages ──────────────────────────────────── */}
            {
                pages && pages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-border bg-card p-5 dark:border-border"
                    >
                        <h3 className="text-caption text-muted-foreground">
                            Top Pages
                        </h3>

                        <div className="mt-3 space-y-1">
                            <div className="grid grid-cols-[1fr_80px_100px] gap-2 px-2 text-caption text-muted-foreground">
                                <div>Page</div>
                                <div className="text-right">Views</div>
                                <div className="text-right">Unique Sessions</div>
                            </div>
                            {pages.map((page: TopPage, i: number) => (
                                <div
                                    key={page.page}
                                    className="grid grid-cols-[1fr_80px_100px] items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-subtle dark:hover:bg-card/50"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-badge font-bold text-muted-foreground">
                                            {i + 1}
                                        </span>
                                        <span className="truncate text-sm font-mono text-muted-foreground">
                                            {page.page}
                                        </span>
                                    </div>
                                    <div className="text-right text-sm font-semibold text-foreground dark:text-white">
                                        {page.views.toLocaleString()}
                                    </div>
                                    <div className="text-right text-sm text-muted-foreground">
                                        {page.uniqueSessions}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )
            }

            {/* ── Empty State ────────────────────────────────── */}
            {
                !loading &&
                !overview &&
                !sources &&
                !searches &&
                !funnel &&
                !devices &&
                !timeline && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-24 dark:border-border"
                    >
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                            <TrendingUp size={28} className="text-white" />
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            No analytics data yet
                        </h2>
                        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
                            Start browsing your store to collect user behavior data. Events
                            like page views, searches, add-to-cart, and purchases will appear
                            here.
                        </p>
                    </motion.div>
                )
            }

            {/* ── Footer ─────────────────────────────────────── */}
            {
                !loading && (overview || timeline) && (
                    <div className="flex items-center justify-between rounded-xl border border-border bg-card/80 px-5 py-3 text-xs text-muted-foreground dark:border-border">
                        <span>
                            Showing data for the last{" "}
                            {range === "24h" ? "24 hours" : range === "7d" ? "7 days" : range === "30d" ? "30 days" : "90 days"}
                        </span>
                        <Button
                            onClick={() => {
                                const csvData = [
                                    ["Metric", "Value"],
                                    ["Page Views", overview?.pageViews || 0],
                                    ["Product Views", overview?.productViews || 0],
                                    ["Searches", overview?.searches || 0],
                                    ["Add to Cart", overview?.addToCarts || 0],
                                    ["Purchases", overview?.purchases || 0],
                                    ["Sessions", overview?.totalSessions || 0],
                                    ["Conversion Rate", `${overview?.conversionRate || 0}%`],
                                ]
                                    .map((r) => r.join(","))
                                    .join("\n");

                                const blob = new Blob([csvData], { type: "text/csv" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `thriftx-analytics-${new Date().toISOString().split("T")[0]}.csv`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            className="flex items-center gap-1.5 font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                        >
                            <Download size={13} />
                            Export CSV
                        </Button>
                    </div>
                )
            }
        </AdminPage>
    );
}
