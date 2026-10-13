"use client";

import { motion } from "framer-motion";
import {
    Eye,
    MousePointerClick,
    ShoppingCart,
    TrendingUp,
    Users,
    UserCheck,
    UserPlus,
    Search,
    ArrowUp,
    ArrowDown,
    Activity,
    Clock,
} from "lucide-react";
import { formatDuration } from "@/lib/analytics/utils";

interface OverviewData {
    pageViews: number;
    productViews: number;
    searches: number;
    addToCarts: number;
    purchases: number;
    clicks: number;
    totalSessions: number;
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    conversionRate: number;
    cartToPurchase: number;
    bounceRate: number;
    /** Mean session duration across the range, in seconds. */
    avgSessionDuration: number;
    /** Sum of all session durations in the range, in seconds. */
    totalTimeOnSite: number;
}

const cards = [
    {
        key: "pageViews",
        label: "Page Views",
        icon: Eye,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/30",
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: "productViews",
        label: "Product Views",
        icon: TrendingUp,
        color: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-50 dark:bg-violet-950/30",
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: "totalSessions",
        label: "Sessions",
        icon: Users,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: "searches",
        label: "Searches",
        icon: Search,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/30",
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: "addToCarts",
        label: "Add to Cart",
        icon: ShoppingCart,
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-950/30",
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: "purchases",
        label: "Purchases",
        icon: Activity,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-950/30",
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: "totalUsers",
        label: "Total Users",
        icon: Users,
        color: "text-sky-600 dark:text-sky-400",
        bg: "bg-sky-50 dark:bg-sky-950/30",
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: "activeUsers",
        label: "Online Now",
        icon: UserCheck,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: "newUsers",
        label: "New Users",
        icon: UserPlus,
        color: "text-fuchsia-600 dark:text-fuchsia-400",
        bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
        format: (v: number) => v.toLocaleString(),
    },
    {
        key: "conversionRate",
        label: "Conversion Rate",
        icon: TrendingUp,
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-950/30",
        format: (v: number) => `${v}%`,
        suffix: "%",
    },
    {
        key: "cartToPurchase",
        label: "Cart→Purchase",
        icon: ArrowUp,
        color: "text-teal-600 dark:text-teal-400",
        bg: "bg-teal-50 dark:bg-teal-950/30",
        format: (v: number) => `${v}%`,
        suffix: "%",
    },
    {
        key: "avgSessionDuration",
        label: "Avg Session",
        icon: Activity,
        color: "text-cyan-600 dark:text-cyan-400",
        bg: "bg-cyan-50 dark:bg-cyan-950/30",
        format: (v: number) => formatDuration(v),
    },
    {
        key: "totalTimeOnSite",
        label: "Time on Site",
        icon: Clock,
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-950/30",
        format: (v: number) => formatDuration(v),
    },
];

export default function OverviewCards({
    data,
    loading,
}: {
    data: OverviewData | null;
    loading: boolean;
}) {
    if (!data) return null;

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, i) => {
                const value = data[card.key as keyof OverviewData] as number;
                const Icon = card.icon;

                return (
                    <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md dark:border-border"
                    >
                        <div className="flex items-start justify-between">
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}
                            >
                                <Icon size={16} className={card.color} />
                            </div>
                        </div>
                        <div className="mt-3">
                            {loading ? (
                                <div className="h-7 w-20 animate-pulse rounded bg-muted" />
                            ) : (
                                <p className="text-xl font-bold tracking-tight text-foreground dark:text-white">
                                    {card.format(value)}
                                </p>
                            )}
                            <p className="mt-0.5 text-2xs font-medium text-muted-foreground">
                                {card.label}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

