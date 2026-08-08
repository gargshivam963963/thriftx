"use client";

import { Search } from "lucide-react";
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
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={ariaLabel}
                className={cn(
                    controlHeight,
                    controlRadius,
                    controlTransition,
                    controlFocusRing,
                    "w-full border border-border bg-card pl-10 pr-4 text-sm text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus:border-foreground/60",
                    "dark:border-border dark:bg-card dark:text-foreground",
                    "dark:placeholder:text-muted-foreground",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                )}
            />
        </div>
    );
}

export default ToolbarSearch;
