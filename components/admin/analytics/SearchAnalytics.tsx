"use client";

import { motion } from "framer-motion";
import { Search, AlertCircle, Hash } from "lucide-react";

interface SearchItem {
    query: string;
    count: number;
    noResults: number;
    hasResultsRate: number;
}

export default function SearchAnalytics({
    data,
    loading,
}: {
    data: SearchItem[] | null;
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-card p-5 dark:border-border">
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="mt-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-5 text-center dark:border-border">
                <Search size={24} className="mx-auto text-muted-foreground dark:text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No search data yet</p>
            </div>
        );
    }

    const topNoResults = data.filter((s) => s.noResults > 0).slice(0, 5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-5 dark:border-border"
        >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Top Search Queries
            </h3>

            {/* No Results Alerts */}
            {topNoResults.length > 0 && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800/30 dark:bg-amber-950/20">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        <AlertCircle size={13} />
                        Searches with no results
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {topNoResults.map((s) => (
                            <span
                                key={s.query}
                                className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            >
                                &ldquo;{s.query}&rdquo; ×{s.noResults}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-3 max-h-[360px] space-y-1 overflow-y-auto">
                {data.map((item, i) => (
                    <div
                        key={item.query}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-subtle dark:hover:bg-card/50"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground dark:bg-card dark:text-muted-foreground">
                                {i + 1}
                            </span>
                            <span className="truncate text-sm font-medium text-foreground">
                                {item.query}
                            </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Hash size={11} />
                                {item.count}
                            </div>
                            {item.noResults > 0 && (
                                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                    <AlertCircle size={11} />
                                    {item.noResults} no results
                                </div>
                            )}
                            <div
                                className={`w-16 text-right text-[11px] font-medium ${item.hasResultsRate >= 80
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : item.hasResultsRate >= 50
                                            ? "text-amber-600 dark:text-amber-400"
                                            : "text-red-600 dark:text-red-400"
                                    }`}
                            >
                                {item.hasResultsRate}% hit
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

