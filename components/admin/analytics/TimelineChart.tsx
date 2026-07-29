"use client";

import { useState } from "react";
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
            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="h-5 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="mt-4 h-48 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <TrendingUp size={24} className="mx-auto text-neutral-300 dark:text-neutral-600" />
                <p className="mt-2 text-sm text-neutral-500">No timeline data yet</p>
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
            className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Events Timeline
                </h3>

                {/* Metric selector */}
                <div className="flex gap-1 rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-800">
                    {METRICS.map((m) => (
                        <button
                            key={m.key}
                            onClick={() => setSelectedMetric(m.key)}
                            className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${selectedMetric === m.key
                                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                                }`}
                        >
                            {m.label === "Page Views" ? "Views" : m.label === "Product Views" ? "Products" : m.label === "Add to Cart" ? "Cart" : "Buy"}
                        </button>
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
                <div className="mt-2 flex justify-between text-[9px] text-neutral-400 dark:text-neutral-500">
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
            <div className="mt-3 grid grid-cols-4 gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                {METRICS.map((m) => {
                    const total = data.reduce((sum, d) => sum + d[m.key], 0);
                    return (
                        <div key={m.key} className="text-center">
                            <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                                {total.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-neutral-400">{m.label}</p>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

