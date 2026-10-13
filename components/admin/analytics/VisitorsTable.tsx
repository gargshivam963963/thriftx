"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MapPin,
  Clock,
  Globe,
  Search,
  ChevronRight,
  UserCheck,
  UserX,
} from "lucide-react";

import type { VisitorRow } from "@/lib/analytics/admin-types";
import { formatDuration } from "@/lib/analytics/utils";
import SegmentedControl from "@/components/ui/SegmentedControl";

function timeAgo(timestamp: number): string {
    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
}

type Filter = "all" | "identified" | "anonymous";

export default function VisitorsTable({
    data,
    loading,
    onSelect,
}: {
    data: VisitorRow[] | null;
    loading: boolean;
    /** Open the visitor detail drawer for the clicked row. */
    onSelect: (visitor: VisitorRow) => void;
}) {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("all");

    const signedInCount = useMemo(
        () => (data ?? []).filter((row) => row.identified).length,
        [data],
    );

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (data ?? []).filter((row) => {
            if (filter === "identified" && !row.identified) return false;
            if (filter === "anonymous" && row.identified) return false;
            if (!q) return true;
            return (
                row.displayName.toLowerCase().includes(q) ||
                (row.email ?? "").toLowerCase().includes(q) ||
                (row.location ?? "").toLowerCase().includes(q)
            );
        });
    }, [data, query, filter]);
    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-card p-5 dark:border-border">
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-5 text-center dark:border-border">
                <Users size={24} className="mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                    No visitor data yet for this range
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-5 dark:border-border"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-caption text-muted-foreground">
                    Visitors
                    <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-2xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {signedInCount} signed-in
                    </span>
                </h3>
                <SegmentedControl
                    options={[
                        { value: "all", label: "All" },
                        { value: "identified", label: "Signed-in", icon: <UserCheck size={12} /> },
                        { value: "anonymous", label: "Guests", icon: <UserX size={12} /> },
                    ]}
                    value={filter}
                    onChange={(v) => setFilter(v as Filter)}
                    size="sm"
                    ariaLabel="Filter visitors"
                />
            </div>

            <div className="relative mt-3">
                <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, email, or city…"
                    className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
            </div>

            {rows.length === 0 ? (
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    No visitors match this search
                </p>
            ) : (
            <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="px-2 py-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Visitor</th>
                            <th className="px-2 py-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Location</th>
                            <th className="px-2 py-2 text-right text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Sessions</th>
                            <th className="px-2 py-2 text-right text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Page Views</th>
                            <th className="px-2 py-2 text-right text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Time on Site</th>
                            <th className="px-2 py-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Source</th>
                            <th className="px-2 py-2 text-right text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Last Seen</th>
                            <th className="w-8 px-2 py-2" aria-label="Open details" />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.slice(0, 50).map((row) => (
                            <tr
                                key={row.id}
                                onClick={() => onSelect(row)}
                                className="cursor-pointer border-b border-border/50 transition hover:bg-subtle dark:hover:bg-card/50"
                            >
                                <td className="px-2 py-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-2xs font-bold ${
                                                row.identified
                                                    ? "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
                                                    : "bg-muted text-muted-foreground"
                                            }`}
                                        >
                                            {(row.displayName || "?").charAt(0).toUpperCase()}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {row.displayName}
                                            </p>
                                            {row.identified && row.email ? (
                                                <p className="truncate text-2xs text-muted-foreground">{row.email}</p>
                                            ) : (
                                                <p className="truncate text-2xs text-muted-foreground/70">
                                                    Guest · {row.sessions} visit{row.sessions === 1 ? "" : "s"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 py-2.5">
                                    {row.location ? (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin size={12} className="shrink-0" />
                                            {row.location}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground/60">—</span>
                                    )}
                                </td>
                                <td className="px-2 py-2.5 text-right text-sm font-semibold text-foreground">
                                    {row.sessions}
                                </td>
                                <td className="px-2 py-2.5 text-right text-sm text-muted-foreground">
                                    {row.pageViews}
                                </td>
                                <td className="px-2 py-2.5 text-right">
                                    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                                        <Clock size={12} className="text-muted-foreground" />
                                        {formatDuration(row.timeOnSite)}
                                    </span>
                                </td>
                                <td className="px-2 py-2.5">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-2xs font-medium text-muted-foreground">
                                        <Globe size={10} />
                                        {row.source}
                                    </span>
                                </td>
                                <td className="px-2 py-2.5 text-right text-xs text-muted-foreground">
                                    {timeAgo(row.lastSeen)}
                                </td>
                                <td className="px-2 py-2.5 text-right">
                                    <ChevronRight size={16} className="ml-auto text-muted-foreground/50" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}

            {rows.length > 50 && (
                <p className="mt-3 border-t border-border pt-3 text-2xs text-muted-foreground">
                    Showing 50 of {rows.length} visitors in range
                </p>
            )}
        </motion.div>
    );
}
