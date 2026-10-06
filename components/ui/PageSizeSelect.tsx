"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, ListFilter } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { menuVariants } from "@/components/animations/Motion";
import {
    controlBase,
    controlIcon,
    controlSurface,
} from "@/components/ui/control.styles";

interface PageSizeSelectProps {
    /** Currently active page size. */
    value: number;
    /** Allowed choices — defaults to the single source of truth. */
    options?: readonly number[];
    onChange: (pageSize: number) => void;
    ariaLabel?: string;
    className?: string;
}

/**
 * PageSizeSelect — "20 / 50 / 100 per page" control.
 *
 * Built from the same control tokens as `SortDropdown` (identical height,
 * radius, typography, focus ring, dropdown animation) so the shop toolbar and
 * any admin toolbar read as one system.
 *
 * Lives in `components/ui` because it is rendered by the shared `Pagination`
 * component — it is part of the paging system, not a shop-specific control.
 */
export default function PageSizeSelect({
    value,
    options,
    onChange,
    ariaLabel = "Items per page",
    className,
}: PageSizeSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const choices = options ?? [20, 50, 100];

    function handleSelect(next: number) {
        if (next !== value) onChange(next);
        setOpen(false);
    }

    return (
        <div ref={ref} className={cn("relative shrink-0", className)}>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={ariaLabel}
                className={cn(
                    controlBase,
                    controlSurface,
                    "shrink-0",
                )}
            >
                <ListFilter
                    size={16}
                    className={cn(controlIcon, "shrink-0 text-muted-foreground")}
                />
                <span className="tabular-nums">{value}</span>
                <span className="hidden text-muted-foreground md:inline">
                    / page
                </span>
                <ChevronDown
                    size={16}
                    className={cn(
                        controlIcon,
                        "shrink-0 text-muted-foreground transition-transform duration-200",
                        open && "rotate-180",
                    )}
                />
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="listbox"
                        aria-label={ariaLabel}
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 bottom-full z-50 mb-2 w-44 origin-bottom-right overflow-hidden rounded-xl border border-border bg-card shadow-float"
                    >
                        <div className="p-1.5">
                            {choices.map((opt) => {
                                const active = value === opt;
                                return (
                                    <Button
                                        key={opt}
                                        variant={active ? "primary" : "ghost"}
                                        size="sm"
                                        fullWidth
                                        role="option"
                                        aria-selected={active}
                                        onClick={() => handleSelect(opt)}
                                        className={cn(
                                            "justify-between rounded-lg px-3.5 py-2.5 text-left tabular-nums",
                                            !active && "text-foreground hover:bg-muted dark:hover:bg-card",
                                        )}
                                    >
                                        <span className="truncate">{opt} / page</span>
                                        {active && (
                                            <Check size={15} strokeWidth={3} className="h-4 w-4 shrink-0" />
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
