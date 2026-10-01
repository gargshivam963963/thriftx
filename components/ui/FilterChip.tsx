"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { chipBase, chipRemove } from "./control.styles";

interface FilterChipProps {
    /** Chip label, e.g. "nike" or "Size M". */
    label: string;
    /** Remove handler. */
    onRemove: () => void;
    className?: string;
}

/**
 * Reusable selected-filter chip.
 *
 * Consistent padding, removable icon, hover animation, and dark/light theme
 * support via the shared control tokens. Height + radius + typography match
 * the rest of the filter/toolbar system.
 */
export function FilterChip({ label, onRemove, className }: FilterChipProps) {
    return (
        <span
            className={cn(chipBase, "group", className)}
        >
            <span className="truncate">{label}</span>
            <Button
                type="button"
                variant="ghost"
                size="iconXs"
                rounded="full"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                aria-label={`Remove ${label}`}
                className={cn(chipRemove, "group-hover:bg-muted/70")}
            >
                <X size={12} className="h-3 w-3" strokeWidth={2.5} />
            </Button>
        </span>
    );
}

export default FilterChip;
