"use client";


import { Button } from '@/components/ui/button';import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOptionListProps {
    options: string[];
    selected: string | null;
    onSelect: (value: string) => void;
    /** Enable search input (e.g. for Brand). */
    searchable?: boolean;
    /** Show as compact chips instead of list rows. */
    chips?: boolean;
    /** Max visible before "Show more". Default 8. */
    visibleLimit?: number;
    className?: string;
}

/**
 * Reusable option list for checkbox-like filters (brand, color, material,
 * condition). Supports optional search, "show more/less", and chip layout.
 */
export default function FilterOptionList({
    options,
    selected,
    onSelect,
    searchable = false,
    chips = false,
    visibleLimit = 8,
    className,
}: FilterOptionListProps) {
    const [query, setQuery] = useState("");
    const [showAll, setShowAll] = useState(false);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => o.toLowerCase().includes(q));
    }, [options, query]);

    const visible = showAll ? filtered : filtered.slice(0, visibleLimit);
    const hasMore = filtered.length > visibleLimit;

    return (
        <div className={cn("space-y-3", className)}>
            {searchable && (
                <div className="relative">
                    <Search
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowAll(false);
                        }}
                        placeholder="Search brands"
                        aria-label="Search brands"
                        className="h-9 w-full rounded-xl border border-border bg-muted/50 pl-9 pr-3 text-small outline-none transition placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                    />
                </div>
            )}

            {filtered.length === 0 ? (
                <p className="py-2 text-center text-small text-muted-foreground">
                    No options found
                </p>
            ) : chips ? (
                <div className="flex flex-wrap gap-2">
                    {visible.map((option) => {
                        const active = selected === option;
                        return (
                            <Button
                                key={option}
                                type="button"
                                onClick={() => onSelect(option)}
                                aria-pressed={active}
                                className={cn(
                                    "inline-flex items-center rounded-full border px-3 py-1.5 text-body-sm font-medium transition-all duration-150",
                                    active
                                        ? "border-foreground bg-foreground text-background shadow-card"
                                        : "border-border bg-card text-foreground hover:border-foreground/50 hover:bg-muted",
                                )}
                            >
                                {active && <span className="mr-1.5 text-badge">✓</span>}
                                {option}
                            </Button>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col gap-0.5">
                    {visible.map((option) => {
                        const active = selected === option;
                        return (
                            <Button
                                key={option}
                                type="button"
                                onClick={() => onSelect(option)}
                                aria-pressed={active}
                                className={cn(
                                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-body-sm font-medium transition-colors",
                                    active
                                        ? "bg-foreground text-background"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                )}
                            >
                                <span
                                    className={cn(
                                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors",
                                        active
                                            ? "border-background bg-background text-foreground"
                                            : "border-border bg-card",
                                    )}
                                >
                                    {active && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="text-badge font-bold"
                                        >
                                            ✓
                                        </motion.span>
                                    )}
                                </span>
                                <span className="truncate">{option}</span>
                            </Button>
                        );
                    })}
                </div>
            )}

            {searchable && hasMore && (
                <Button
                    type="button"
                    onClick={() => setShowAll((s) => !s)}
                    className="w-full text-center text-small font-semibold text-muted-foreground transition hover:text-foreground"
                >
                    {showAll ? "Show less" : `+ ${filtered.length - visibleLimit} more`}
                </Button>
            )}
        </div>
    );
}
