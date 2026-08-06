"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    /** Show error styling */
    error?: boolean;
    /** Placeholder option text (disabled) */
    placeholder?: string;
    /** Options array — alternative to children */
    options?: SelectOption[];
    /** Select size variant */
    variant?: "sm" | "md" | "lg";
}

/**
 * THRIFTX Design System — Select
 * Reusable dropdown with consistent styling and custom chevron.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        { className, children, error, placeholder, options, variant = "md", ...props },
        ref,
    ) => {
        const sizes = {
            sm: "h-9 px-3 text-small",
            md: "h-11 px-4 text-body-sm",
            lg: "h-12 px-4 text-body",
        };

        return (
            <div className="relative w-full">
                <select
                    ref={ref}
                    className={cn(
                        // Base
                        "w-full appearance-none rounded-xl border bg-background text-foreground outline-none transition-all duration-200",
                        // Sizing
                        sizes[variant],
                        // Padding for chevron
                        "pr-10",
                        // Border / focus
                        error
                            ? "border-error focus:border-error focus:ring-2 focus:ring-error/15"
                            : "border-border focus:border-foreground focus:ring-2 focus:ring-foreground/10",
                        // Disabled
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
                        className,
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options
                        ? options.map((opt) => (
                            <option
                                key={opt.value}
                                value={opt.value}
                                disabled={opt.disabled}
                            >
                                {opt.label}
                            </option>
                        ))
                        : children}
                </select>
                <ChevronDown
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                />
            </div>
        );
    },
);
Select.displayName = "Select";

export { Select };
