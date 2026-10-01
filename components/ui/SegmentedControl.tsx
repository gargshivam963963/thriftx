"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SegmentOption<T extends string> {
    value: T;
    label?: string;
    icon?: ReactNode;
    ariaLabel: string;
}

interface SegmentedControlProps<T extends string> {
    options: SegmentOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

/**
 * Reusable segmented control — used for the Grid/List view toggle.
 *
 * - Equal button sizes (each segment fills equally).
 * - Active segment animated with a sliding, theme-aware indicator.
 * - Dark/light compatible via design tokens.
 * - Height matches the rest of the toolbar (40/44px).
 */
export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    className,
}: SegmentedControlProps<T>) {
    return (
        <div
            role="tablist"
            className={cn(
                "inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1",
                className,
            )}
        >
            {options.map((opt) => {
                const active = value === opt.value;
                return (
                    <Button
                        key={opt.value}
                        type="button"
                        variant="ghost"
                        size="sm"
                        rounded="md"
                        role="tab"
                        aria-selected={active}
                        aria-label={opt.ariaLabel}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "relative flex items-center justify-center gap-2 rounded-lg px-3",
                            "h-8 md:h-9",
                            "text-label",
                            "transition-colors duration-200",
                            active ? "text-background" : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {active && (
                            <motion.span
                                layoutId="segmented-active"
                                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                className="absolute inset-0 rounded-lg bg-foreground shadow-sm"
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {opt.icon && (
                                <span className="[&_svg]:h-4 [&_svg]:w-4">{opt.icon}</span>
                            )}
                            {opt.label && <span>{opt.label}</span>}
                        </span>
                    </Button>
                );
            })}
        </div>
    );
}

export default SegmentedControl;
