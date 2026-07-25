"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

interface RevenueChartProps {
    data: { date: string; revenue: number; orders: number }[];
    loading?: boolean;
}

type Period = "7d" | "30d";

export default function RevenueChart({ data, loading = false }: RevenueChartProps) {
    const [period, setPeriod] = useState<Period>("30d");

    const filteredData = useMemo(() => {
        if (!data.length) return [];
        const days = period === "7d" ? 7 : 30;
        return data.slice(-days);
    }, [data, period]);

    const chartData = useMemo(() => {
        if (!filteredData.length) return null as any;

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

    if (loading) {
        return (
            <div className="admin-card p-6">
                <div className="space-y-4">
                    <div className="h-5 w-36 animate-pulse rounded bg-[var(--color-bg-muted)]" />
                    <div className="h-[220px] animate-pulse rounded-xl bg-[var(--color-bg-muted)]" />
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="admin-card p-6">
                <p className="text-center text-sm text-[var(--color-text-muted)]">
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
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                        Revenue Overview
                    </p>
                    <p className="mt-1 font-serif text-2xl font-bold text-[var(--color-text)]">
                        ₹{totalRevenue.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                        Avg. ₹{avgRevenue.toLocaleString("en-IN")}/day • {filteredData.length} days
                    </p>
                </div>
                <div className="flex gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-1">
                    {(["7d", "30d"] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${period === p
                                ? "bg-[var(--color-accent)] text-white dark:bg-white dark:text-black"
                                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="relative">
                <svg
                    viewBox="0 0 100 180"
                    className="w-full"
                    preserveAspectRatio="none"
                    style={{ height: "180px" }}
                >
                    {/* Gradient */}
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.02" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((pct) => {
                        const y = (pct / 100) * 180;
                        return (
                            <line
                                key={pct}
                                x1="0"
                                y1={y}
                                x2="100"
                                y2={y}
                                stroke="var(--color-border)"
                                strokeWidth="0.3"
                            />
                        );
                    })}

                    {/* Area */}
                    <path d={chartData.areaPath} fill="url(#revenueGradient)" />

                    {/* Line */}
                    <path
                        d={chartData.pathD}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Dots */}
                    {(chartData.points as { x: number; y: number; revenue: number; orders: number; date: string; label: string }[]).map((p, i) => (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="1.2"
                            fill="var(--color-accent)"
                            className="transition-all duration-200"
                        />
                    ))}
                </svg>

                {/* Hover tooltip area - CSS only */}
                <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-0">
                    {(chartData.points as { x: number; y: number; revenue: number; orders: number; date: string; label: string }[]).slice(0, 7).map((p, i) => {
                        const idx = Math.floor((i / 7) * chartData.points.length);
                        const dp = chartData.points[idx];
                        if (!dp) return null;
                        return (
                            <div
                                key={i}
                                className="group relative cursor-pointer pt-1"
                            >
                                <div className="mx-auto h-1 w-1 rounded-full bg-[var(--color-accent)] opacity-30" />
                                <div className="absolute -top-28 left-1/2 hidden -translate-x-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2 py-1.5 shadow-lg group-hover:block">
                                    <p className="whitespace-nowrap text-[10px] font-semibold text-[var(--color-text)]">
                                        ₹{dp.revenue.toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-[9px] text-[var(--color-text-muted)]">
                                        {dp.label} • {dp.orders} orders
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

