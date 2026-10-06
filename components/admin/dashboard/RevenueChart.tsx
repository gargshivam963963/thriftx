"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { SegmentedControl } from "@/components/ui/SegmentedControl";

interface RevenueChartProps {
    data: { date: string; revenue: number; orders: number }[];
    loading?: boolean;
}

type Period = "7d" | "30d";

/** Human labels for the range switcher — shared with the SegmentedControl. */
const PERIOD_LABELS: Record<Period, string> = {
    "7d": "7 days",
    "30d": "30 days",
};

interface ChartPoint {
    x: number;
    y: number;
    revenue: number;
    orders: number;
    date: string;
    label: string;
}

interface ChartData {
    points: ChartPoint[];
    pathD: string;
    areaPath: string;
    maxRevenue: number;
}

export default function RevenueChart({ data, loading = false }: RevenueChartProps) {
    const [period, setPeriod] = useState<Period>("30d");

    const filteredData = useMemo(() => {
        if (!data.length) return [];
        const days = period === "7d" ? 7 : 30;
        return data.slice(-days);
    }, [data, period]);

    const chartData = useMemo<ChartData | null>(() => {
        if (!filteredData.length) return null;

        const maxRevenue = Math.max(...filteredData.map((d) => d.revenue), 1);
        const padding = 0.1;
        const chartHeight = 180;
        const chartWidth = 100;

        const points = filteredData.map((d, i) => ({
            x: (i / Math.max(filteredData.length - 1, 1)) * chartWidth,
            y: chartHeight - (d.revenue / (maxRevenue * (1 + padding))) * chartHeight,
            revenue: d.revenue,
            orders: d.orders,
            date: d.date,
            label: new Date(d.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
            }),
        }));

        const pathD = points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
            .join(" ");

        const areaPath = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

        return { points, pathD, areaPath, maxRevenue: maxRevenue * (1 + padding) };
    }, [filteredData]);

    const totalRevenue = useMemo(
        () => filteredData.reduce((sum, d) => sum + d.revenue, 0),
        [filteredData],
    );

    const avgRevenue = useMemo(
        () => (filteredData.length ? Math.round(totalRevenue / filteredData.length) : 0),
        [filteredData, totalRevenue],
    );

    const tickLabels = useMemo(() => {
        const pts = chartData?.points ?? [];
        if (!pts.length) return [] as string[];
        const count = Math.min(5, pts.length);
        return Array.from({ length: count }, (_, i) =>
            pts[Math.round((i / Math.max(count - 1, 1)) * (pts.length - 1))].label,
        );
    }, [chartData]);

    if (loading) {
        return (
            <div className="admin-card p-6">
                <div className="space-y-4">
                    <div className="h-5 w-36 animate-pulse rounded bg-muted" />
                    <div className="h-[220px] animate-pulse rounded-xl bg-muted" />
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="admin-card p-6">
                <p className="text-center text-sm text-muted-foreground">
                    No revenue data available yet
                </p>
            </div>
        );
    }

    if (!chartData) {
        return (
            <div className="admin-card p-6">
                <p className="text-center text-sm text-muted-foreground">
                    No revenue data available yet
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card p-6"
        >
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-caption text-muted-foreground">
                        Revenue Overview
                    </p>
                    <p className="mt-1.5 text-price text-foreground">
                        ₹{totalRevenue.toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 text-body-sm text-muted-foreground">
                        Avg. ₹{avgRevenue.toLocaleString("en-IN")}/day •{" "}
                        {filteredData.length} days
                    </p>
                </div>
                <SegmentedControl
                    value={period}
                    onChange={setPeriod}
                    ariaLabel="Revenue period"
                    idPrefix="dashboard-revenue-period"
                    options={(Object.keys(PERIOD_LABELS) as Period[]).map((p) => ({
                        value: p,
                        label: PERIOD_LABELS[p],
                    }))}
                />
            </div>

            {/* Chart */}
            <div className="relative">
                <svg
                    viewBox="0 0 100 180"
                    className="h-[220px] w-full"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Revenue trend"
                >
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-foreground)" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {[0, 25, 50, 75, 100].map((pct) => (
                        <line
                            key={pct}
                            x1="0"
                            x2="100"
                            y1={(pct / 100) * 180}
                            y2={(pct / 100) * 180}
                            stroke="var(--color-border)"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            vectorEffect="non-scaling-stroke"
                        />
                    ))}

                    <path d={chartData.areaPath} fill="url(#revenueGradient)" />
                    <path
                        d={chartData.pathD}
                        fill="none"
                        stroke="var(--color-foreground)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>

                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                    {tickLabels.map((label, i) => (
                        <span key={i}>{label}</span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}