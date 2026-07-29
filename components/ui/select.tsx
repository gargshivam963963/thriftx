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
                        "flex h-11 w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10",
                        "text-sm font-medium text-neutral-900",
                        // Border
                        "border-neutral-300",
                        error && "border-red-400",
                        // Focus
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-600",
                        // Disabled
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50",
                        // Dark mode
                        "dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-600",
                        "dark:focus-visible:ring-white/20 dark:focus-visible:border-neutral-400",
                        "dark:disabled:bg-neutral-950",
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
                        "text-neutral-400",
                        "dark:text-neutral-500",
                    )}
                />
            </div>
        );
    },
);
Select.displayName = "Select";

export { Select };
