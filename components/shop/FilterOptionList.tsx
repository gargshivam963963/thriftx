"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    controlHeight,
    controlRadius,
    controlFocusRing,
    controlTransition,
} from "@/components/ui/control.styles";

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
 *
 * All controls (search field, list rows, chips, "show more") use the SAME
 * control tokens (height, radius, focus ring, transition, theme) so they read
 * as one design system.
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
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
                        className={cn(
                            controlHeight,
                            controlRadius,
                            controlTransition,
                            controlFocusRing,
                            "w-full border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground",
                            "placeholder:text-muted-foreground focus:border-foreground/60",
                            "dark:border-border dark:bg-muted/40 dark:text-foreground",
                        )}
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
                                variant={active ? "primary" : "outline"}
                                size="xs"
                                rounded="full"
                                onClick={() => onSelect(option)}
                                aria-pressed={active}
                                className={cn(
                                    controlTransition,
                                    controlFocusRing,
                                    "h-8 gap-1.5 px-3 text-badge",
                                    !active && "hover:border-foreground/50 hover:bg-muted dark:hover:bg-muted",
                                )}
                            >
                                {active && (
                                    <Check size={12} strokeWidth={3} className="h-3 w-3" />
                                )}
                                <span className="truncate">{option}</span>
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
                                variant={active ? "primary" : "ghost"}
                                size="md"
                                fullWidth
                                onClick={() => onSelect(option)}
                                aria-pressed={active}
                                className={cn(
                                    controlTransition,
                                    controlFocusRing,
                                    "justify-start rounded-lg px-3 text-left",
                                    !active && "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-card",
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
                    variant="ghost"
                    size="md"
                    fullWidth
                    onClick={() => setShowAll((s) => !s)}
                    className={cn(
                        controlTransition,
                        controlFocusRing,
                        "justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-card",
                    )}
                >
                    {showAll ? "Show less" : `+ ${filtered.length - visibleLimit} more`}
                </Button>
            )}
        </div>
    );
}
