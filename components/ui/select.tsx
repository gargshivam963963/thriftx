"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    /** Show error state styling */
    error?: boolean;
    /** Placeholder option text */
    placeholder?: string;
    /** Options array */
    options?: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, error, placeholder, options, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    ref={ref}
                    className={cn(
                        // Base
                        "flex w-full appearance-none rounded-xl border bg-white pr-10",
                        "h-11 px-4 py-2.5",
                        "text-sm font-medium text-foreground",
                        // Border
                        "border-border",
                        error && "border-red-400",
                        // Focus
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:border-border",
                        // Disabled
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-subtle",
                        // Dark mode
                        "bg-foreground dark:border-border",
                        "dark:focus-visible:ring-white/20 dark:focus-visible:border-foreground",
                        "dark:disabled:bg-foreground",
                        // Allow className to override height & padding
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
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))
                        : children}
                </select>
                <ChevronDown
                    size={16}
                    className={cn(
                        "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2",
                        "text-muted-foreground",
                        "dark:text-muted-foreground",
                    )}
                />
            </div>
        );
    },
);
Select.displayName = "Select";

export { Select };
