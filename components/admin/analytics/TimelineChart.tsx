"use client";


import { Button } from '@/components/ui/button';import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, ShoppingCart, CreditCard, TrendingUp } from "lucide-react";

interface TimelinePoint {
    date: string;
    pageViews: number;
    productViews: number;
    addToCarts: number;
    purchases: number;
}

type MetricKey = "pageViews" | "productViews" | "addToCarts" | "purchases";

const METRICS: { key: MetricKey; label: string; color: string }[] = [
    { key: "pageViews", label: "Page Views", color: "bg-blue-500" },
    { key: "productViews", label: "Product Views", color: "bg-violet-500" },
    { key: "addToCarts", label: "Add to Cart", color: "bg-rose-500" },
    { key: "purchases", label: "Purchases", color: "bg-emerald-500" },
];

export default function TimelineChart({
    data,
    loading,
}: {
    data: TimelinePoint[] | null;
    loading: boolean;
}) {
    const [selectedMetric, setSelectedMetric] = useState<MetricKey>("pageViews");

    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-card p-5 dark:border-border">
                <div className="h-5 w-28 animate-pulse rounded bg-muted" />
                <div className="mt-4 h-48 animate-pulse rounded-lg bg-muted" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-5 text-center dark:border-border">
                <TrendingUp size={24} className="mx-auto text-muted-foreground dark:text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No timeline data yet</p>
            </div>
        );
    }

    const metric = METRICS.find((m) => m.key === selectedMetric)!;
    const values = data.map((d) => d[selectedMetric]);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    // Format date for display
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-5 dark:border-border"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Events Timeline
                </h3>

                {/* Metric selector */}
                <div className="flex gap-1 rounded-lg bg-muted p-0.5 dark:bg-card">
                    {METRICS.map((m) => (
                        <Button
                            key={m.key}
                            onClick={() => setSelectedMetric(m.key)}
                            className={`rounded-md px-2.5 py-1 text-2xs font-semibold transition ${selectedMetric === m.key
                                    ? "bg-white text-foreground shadow-sm dark:bg-muted dark:text-white"
                                    : "text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-muted-foreground"
                                }`}
                        >
                            {m.label === "Page Views" ? "Views" : m.label === "Product Views" ? "Products" : m.label === "Add to Cart" ? "Cart" : "Buy"}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="mt-4">
                <div className="flex items-end gap-[2px] sm:gap-[3px]" style={{ height: 180 }}>
                    {data.map((point, i) => {
                        const value = point[selectedMetric];
                        const heightPercent = ((value - minValue) / range) * 100;
                        const isToday =
                            new Date(point.date).toDateString() === new Date().toDateString();

                        return (
                            <div
                                key={point.date}
                                className="relative flex flex-1 flex-col items-center justify-end h-full"
                            >
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(heightPercent, 2)}%` }}
                                    transition={{ duration: 0.3, delay: i * 0.02 }}
                                    className={`w-full rounded-t-sm transition-all hover:opacity-80 ${metric.color
                                        } ${isToday ? "opacity-100" : "opacity-70"}`}
                                    title={`${formatDate(point.date)}: ${value}`}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* X-axis labels */}
                <div className="mt-2 flex justify-between text-badge text-muted-foreground">
                    {data.length > 0 && (
                        <>
                            <span>{formatDate(data[0].date)}</span>
                            {data.length > 3 && (
                                <span>
                                    {formatDate(data[Math.floor(data.length / 2)].date)}
                                </span>
                            )}
                            <span>{formatDate(data[data.length - 1].date)}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Summary stats */}
            <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3 dark:border-border">
                {METRICS.map((m) => {
                    const total = data.reduce((sum, d) => sum + d[m.key], 0);
                    return (
                        <div key={m.key} className="text-center">
                            <p className="text-xs font-semibold text-foreground dark:text-white">
                                {total.toLocaleString()}
                            </p>
                            <p className="text-badge text-muted-foreground">{m.label}</p>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

