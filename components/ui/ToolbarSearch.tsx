"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    controlHeight,
    controlRadius,
    controlFocusRing,
    controlTransition,
} from "./control.styles";

interface ToolbarSearchProps {
    value: string;
    onChange: (value: string) => void;
    /** Called when the shopper commits the query (Enter). Lets the parent
     * push the `?search=` URL immediately instead of waiting for debounce,
     * so the committed URL can't lag behind what's typed. */
    onSubmit?: () => void;
    placeholder?: string;
    ariaLabel?: string;
    className?: string;
}

/**
 * Standardized search field for the shop toolbar.
 *
 * Matches the exact height (40/44px), radius, focus ring, and tokens of the
 * sort dropdown and buttons so the toolbar reads as ONE design system.
 */
export function ToolbarSearch({
    value,
    onChange,
    onSubmit,
    placeholder = "Search products, brands…",
    ariaLabel = "Search products",
    className,
}: ToolbarSearchProps) {
    return (
        <div className={cn("relative min-w-0 flex-1", className)}>
            <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    // Enter commits immediately (parent pushes `?search=` now).
                    // Without this, Enter fires while the 350ms debounce is
                    // still pending, the URL keeps the PREVIOUS value, and the
                    // sync-back overwrites what was just typed.
                    if (e.key === "Enter") {
                        e.preventDefault();
                        onSubmit?.();
                    }
                }}
                placeholder={placeholder}
                aria-label={ariaLabel}
                className={cn(
                    controlHeight,
                    controlRadius,
                    controlTransition,
                    controlFocusRing,
                    "w-full border border-border bg-card pl-10 pr-9 text-sm text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus:border-foreground/60",
                    "dark:border-border dark:bg-card dark:text-foreground",
                    "dark:placeholder:text-muted-foreground",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                )}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                    <X size={15} />
                </button>
            )}
        </div>
    );
}

export default ToolbarSearch;
