"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: number;
    trendLabel?: string;
    delay?: number;
    loading?: boolean;
}

export default function StatsCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendLabel,
    delay = 0,
    loading = false,
}: StatsCardProps) {
    if (loading) {
        return (
            <div className="admin-card p-5">
                <div className="space-y-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: delay * 0.05, ease: "easeOut" }}
            className="admin-card flex flex-col gap-4 p-5"
        >
            <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium text-muted-foreground">
                    {title}
                </p>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                    {icon}
                </div>
            </div>

            <div>
                <p className="font-display text-3xl font-bold leading-none tracking-tight text-foreground tabular-nums">
                    {value}
                </p>
                {subtitle && (
                    <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
                )}
            </div>

            {trend !== undefined && (
                <div className="flex items-center gap-1.5 border-t border-border pt-3">
                    {trend >= 0 ? (
                        <TrendingUp size={14} className="text-emerald-500" />
                    ) : (
                        <TrendingDown size={14} className="text-red-500" />
                    )}
                    <span
                        className={cn(
                            "text-xs font-semibold",
                            trend >= 0 ? "text-emerald-500" : "text-red-500",
                        )}
                    >
                        {trend >= 0 ? "+" : ""}
                        {trend}%
                    </span>
                    {trendLabel && (
                        <span className="text-xs text-muted-foreground">{trendLabel}</span>
                    )}
                </div>
            )}
        </motion.div>
    );
}
