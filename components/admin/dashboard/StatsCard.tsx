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
    color?: string;
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
    color = "from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300",
    delay = 0,
    loading = false,
}: StatsCardProps) {
    if (loading) {
        return (
            <div className="admin-card p-5">
                <div className="space-y-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.1, ease: "easeOut" }}
            className="admin-card group relative overflow-hidden p-5"
        >
            {/* Background gradient decoration */}
            <div
                className={cn(
                    "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-5 blur-2xl transition-all duration-500 group-hover:opacity-10 group-hover:scale-150",
                    color,
                )}
            />

            <div className="relative">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-caption font-semibold text-muted-foreground">
                            {title}
                        </p>
                        <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-foreground">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div
                        className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
                            color,
                        )}
                    >
                        <div className="text-white dark:text-black">{icon}</div>
                    </div>
                </div>

                {trend !== undefined && (
                    <div className="mt-3 flex items-center gap-1.5">
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
                            <span className="text-xs text-muted-foreground">
                                {trendLabel}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

