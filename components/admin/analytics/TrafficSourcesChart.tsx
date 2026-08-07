"use client";

import { motion } from "framer-motion";
import {
    Globe,
    Instagram,
    Search,
    MessageCircle,
    Twitter,
    Youtube,
    Link2,
} from "lucide-react";

const SOURCE_ICONS: Record<string, React.ReactNode> = {
    direct: <Globe size={14} />,
    instagram: <Instagram size={14} />,
    google: <Search size={14} />,
    facebook: <MessageCircle size={14} />,
    whatsapp: <MessageCircle size={14} />,
    twitter: <Twitter size={14} />,
    youtube: <Youtube size={14} />,
    referral: <Link2 size={14} />,
};

const SOURCE_COLORS: Record<string, string> = {
    direct: "bg-muted",
    instagram: "bg-pink-500",
    google: "bg-blue-500",
    facebook: "bg-blue-600",
    whatsapp: "bg-green-500",
    twitter: "bg-sky-500",
    youtube: "bg-red-500",
    referral: "bg-purple-500",
};

interface TrafficSource {
    source: string;
    visits: number;
    percentage: number;
}

export default function TrafficSourcesChart({
    data,
    loading,
}: {
    data: TrafficSource[] | null;
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-card p-5 dark:border-border">
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-8 animate-pulse rounded bg-muted" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-5 text-center dark:border-border">
                <Globe size={24} className="mx-auto text-muted-foreground dark:text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No traffic data yet</p>
            </div>
        );
    }

    const maxVisits = Math.max(...data.map((s) => s.visits));

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-5 dark:border-border"
        >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Traffic Sources
            </h3>

            <div className="mt-4 space-y-2.5">
                {data.map((source) => (
                    <div key={source.source} className="group">
                        <div className="mb-1 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                    {SOURCE_ICONS[source.source] || <Link2 size={14} />}
                                </span>
                                <span className="font-medium capitalize text-muted-foreground">
                                    {source.source}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground dark:text-white">
                                    {source.visits.toLocaleString()}
                                </span>
                                <span className="w-8 text-right text-muted-foreground">
                                    {source.percentage}%
                                </span>
                            </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(source.visits / maxVisits) * 100}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className={`h-full rounded-full ${SOURCE_COLORS[source.source] || "bg-muted-foreground"}`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

