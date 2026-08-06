"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Show error styling */
    error?: boolean;
    /** Textarea size variant */
    variant?: "sm" | "md" | "lg";
}

/**
 * THRIFTX Design System — Textarea
 * Reusable multiline text input with consistent styling.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, variant = "md", ...props }, ref) => {
        const sizes = {
            sm: "min-h-[60px] px-3 py-2 text-small",
            md: "min-h-[90px] px-4 py-3 text-body-sm",
            lg: "min-h-[120px] px-4 py-3 text-body",
        };

        return (
            <textarea
                ref={ref}
                className={cn(
                    // Base
                    "w-full rounded-xl border bg-background text-foreground outline-none transition-all duration-200 resize-y",
                    // Sizing
                    sizes[variant],
                    // Border / focus
                    error
                        ? "border-error focus:border-error focus:ring-2 focus:ring-error/15"
                        : "border-border focus:border-foreground focus:ring-2 focus:ring-foreground/10",
                    // Placeholder
                    "placeholder:text-muted-foreground",
                    // Disabled
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
                    className,
                )}
                {...props}
            />
        );
    },
);
Textarea.displayName = "Textarea";

export { Textarea };
