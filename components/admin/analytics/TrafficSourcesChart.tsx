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
    direct: "bg-neutral-500",
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
            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="mt-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-8 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <Globe size={24} className="mx-auto text-neutral-300 dark:text-neutral-600" />
                <p className="mt-2 text-sm text-neutral-500">No traffic data yet</p>
            </div>
        );
    }

    const maxVisits = Math.max(...data.map((s) => s.visits));

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
        >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Traffic Sources
            </h3>

            <div className="mt-4 space-y-2.5">
                {data.map((source) => (
                    <div key={source.source} className="group">
                        <div className="mb-1 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-400">
                                    {SOURCE_ICONS[source.source] || <Link2 size={14} />}
                                </span>
                                <span className="font-medium capitalize text-neutral-700 dark:text-neutral-300">
                                    {source.source}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-neutral-900 dark:text-white">
                                    {source.visits.toLocaleString()}
                                </span>
                                <span className="w-8 text-right text-neutral-400">
                                    {source.percentage}%
                                </span>
                            </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(source.visits / maxVisits) * 100}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className={`h-full rounded-full ${SOURCE_COLORS[source.source] || "bg-neutral-400"}`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

