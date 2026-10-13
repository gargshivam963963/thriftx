"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    RefreshCw,
    Download,
    TrendingUp,
    Trash2,
    LayoutDashboard,
    FileText,
    ShoppingBag,
    Users,
} from "lucide-react";

import OverviewCards from "@/components/admin/analytics/OverviewCards";
import TrafficSourcesChart from "@/components/admin/analytics/TrafficSourcesChart";
import SearchAnalytics from "@/components/admin/analytics/SearchAnalytics";
import ProductFunnel from "@/components/admin/analytics/ProductFunnel";
import DeviceBreakdown from "@/components/admin/analytics/DeviceBreakdown";
import TimelineChart from "@/components/admin/analytics/TimelineChart";
import VisitorsTable from "@/components/admin/analytics/VisitorsTable";
import VisitorDrawer from "@/components/admin/analytics/VisitorDrawer";
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
    VisitorRow,
} from "@/lib/analytics/admin-types";

const RANGE_OPTIONS = [
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
];

type SectionTab = "overview" | "pages" | "products" | "visitors";

export default function AdminAnalyticsPage() {
    const [range, setRange] = useState("7d");
    const [tab, setTab] = useState<SectionTab>("overview");
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [sources, setSources] = useState<TrafficSourcePoint[] | null>(null);
    const [pages, setPages] = useState<TopPage[] | null>(null);
    const [searches, setSearches] = useState<SearchQueryPoint[] | null>(null);
    const [funnel, setFunnel] = useState<ProductFunnelPoint[] | null>(null);
    const [devices, setDevices] = useState<DevicePoint[] | null>(null);
    const [timeline, setTimeline] = useState<TimelinePoint[] | null>(null);
    const [visitors, setVisitors] = useState<VisitorRow[] | null>(null);
    const [purging, setPurging] = useState(false);
    const [selectedVisitor, setSelectedVisitor] = useState<VisitorRow | null>(null);

    // Each tab fetches only what it renders — keeps the page fast and the
    // payload small. Overview always loads so cards stay live.
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const wants = (t: SectionTab) => tab === t || t === "overview";
            const jobs: Promise<Response>[] = [
                fetch(`/api/analytics?action=overview&range=${range}`),
                fetch(`/api/analytics?action=timeline&range=${range}`),
                fetch(`/api/analytics?action=sources&range=${range}`),
                fetch(`/api/analytics?action=devices&range=${range}`),
            ];
            if (wants("pages")) {
                jobs.push(
                    fetch(`/api/analytics?action=pages&range=${range}`),
                    fetch(`/api/analytics?action=searches&range=${range}`),
                );
            }
            if (wants("products")) {
                jobs.push(fetch(`/api/analytics?action=funnel&range=${range}`));
            }
            if (wants("visitors")) {
                jobs.push(fetch(`/api/analytics?action=visitors&range=${range}`));
            }
            const responses = await Promise.all(jobs);
            const jsons = await Promise.all(
                responses.map((r) => r.json() as Promise<AnalyticsApiResponse<never>>),
            );

            let i = 0;
            const next = <T,>() => jsons[i++] as AnalyticsApiResponse<T>;
            const overviewData = next<AnalyticsOverview>();
            const timelineData = next<TimelinePoint[]>();
            const sourcesData = next<TrafficSourcePoint[]>();
            const devicesData = next<DevicePoint[]>();

            if (overviewData.success) setOverview(overviewData.data);
            if (timelineData.success) setTimeline(timelineData.data);
            if (sourcesData.success) setSources(sourcesData.data);
            if (devicesData.success) setDevices(devicesData.data);
            if (wants("pages")) {
                const pagesData = next<TopPage[]>();
                const searchesData = next<SearchQueryPoint[]>();
                if (pagesData.success) setPages(pagesData.data);
                if (searchesData.success) setSearches(searchesData.data);
            }
            if (wants("products")) {
                const funnelData = next<ProductFunnelPoint[]>();
                if (funnelData.success) setFunnel(funnelData.data);
            }
            if (wants("visitors")) {
                const visitorsData = next<VisitorRow[]>();
                if (visitorsData.success) setVisitors(visitorsData.data);
            }
        } catch (error) {
            console.error("Failed to load analytics:", error);
        } finally {
            setLoading(false);
        }
    }, [range, tab]);

    const handlePurge = useCallback(async () => {
        const confirmed = window.confirm(
            "Delete ALL analytics history (events and sessions)? This clears the legacy test pollution and cannot be undone.",
        );
        if (!confirmed) return;

        setPurging(true);
        try {
            const res = await fetch("/api/analytics", { method: "DELETE" });
            if (res.ok) {
                // Reload so the dashboard reflects the cleared data.
                await loadData();
            } else {
                console.error("Purge failed:", res.status);
            }
        } catch (error) {
            console.error("Purge failed:", error);
        } finally {
            setPurging(false);
        }
    }, [loadData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleExport = useCallback(() => {
        const csvData = [
            ["Metric", "Value"],
            ["Page Views", overview?.pageViews || 0],
            ["Product Views", overview?.productViews || 0],
            ["Searches", overview?.searches || 0],
            ["Add to Cart", overview?.addToCarts || 0],
            ["Purchases", overview?.purchases || 0],
            ["Sessions", overview?.totalSessions || 0],
            ["Total Users", overview?.totalUsers || 0],
            ["Online Now", overview?.activeUsers || 0],
            ["New Users", overview?.newUsers || 0],
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
    }, [overview]);

    const rangeLabel =
        range === "24h" ? "24 hours" : range === "7d" ? "7 days" : range === "30d" ? "30 days" : "90 days";

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

                        <Button
                            variant="outline"
                            size="md"
                            onClick={handlePurge}
                            disabled={loading || purging}
                            leftIcon={
                                <Trash2
                                    size={15}
                                    className={purging ? "animate-pulse" : ""}
                                />
                            }
                        >
                            {purging ? "Purging…" : "Purge Data"}
                        </Button>
                    </>
                }
            />

            {/* ── Overview Cards ────────────────────────────── */}
            <OverviewCards data={overview} loading={loading} />

            {/* ── Section tabs ──────────────────────────────── */}
            <SegmentedControl
                options={[
                    { value: "overview", label: "Overview", icon: <LayoutDashboard size={13} /> },
                    { value: "pages", label: "Page Views", icon: <FileText size={13} /> },
                    { value: "products", label: "Products", icon: <ShoppingBag size={13} /> },
                    { value: "visitors", label: "Visitors", icon: <Users size={13} /> },
                ]}
                value={tab}
                onChange={(v) => setTab(v as SectionTab)}
                ariaLabel="Analytics sections"
                idPrefix="admin-analytics-section"
            />

            {tab === "overview" && (
                <>
                    {/* ── Timeline Chart ────────────────────────────── */}
                    <TimelineChart data={timeline} loading={loading} />

                    {/* ── Traffic Sources + Devices ──────────────────── */}
                    <div className="grid gap-5 lg:grid-cols-2">
                        <TrafficSourcesChart data={sources} loading={loading} />
                        <DeviceBreakdown data={devices} loading={loading} />
                    </div>
                </>
            )}

            {tab === "pages" && (
                <>
                    {/* ── Search + Top Pages ─────────────────────────── */}
                    <SearchAnalytics data={searches} loading={loading} />

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
                </>
            )}

            {tab === "products" && (
                <ProductFunnel data={funnel} loading={loading} />
            )}

            {tab === "visitors" && (
                <>
                    <VisitorsTable
                        data={visitors}
                        loading={loading}
                        onSelect={setSelectedVisitor}
                    />
                    <VisitorDrawer
                        visitor={selectedVisitor}
                        range={range}
                        onClose={() => setSelectedVisitor(null)}
                    />
                </>
            )}

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
                            {rangeLabel}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            leftIcon={<Download size={13} />}
                        >
                            Export CSV
                        </Button>
                    </div>
                )
            }
        </AdminPage>
    );
}
