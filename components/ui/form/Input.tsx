"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Show error styling */
    error?: boolean;
    /** Left icon inside the input */
    leftIcon?: React.ReactNode;
    /** Right icon inside the input */
    rightIcon?: React.ReactNode;
    /** Input size variant */
    variant?: "sm" | "md" | "lg";
}

/**
 * THRIFTX Design System — Input
 * Reusable text input with consistent styling, error and icon support.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        { className, type, error, leftIcon, rightIcon, variant = "md", ...props },
        ref,
    ) => {
        const sizes = {
            sm: "h-9 px-3 text-small",
            md: "h-11 px-4 text-body-sm",
            lg: "h-12 px-4 text-body",
        };

        return (
            <div className="relative w-full">
                {leftIcon && (
                    <span
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    >
                        {leftIcon}
                    </span>
                )}

                <input
                    type={type}
                    ref={ref}
                    className={cn(
                        // Base
                        "w-full rounded-xl border bg-background text-foreground outline-none transition-all duration-200",
                        // Sizing
                        sizes[variant],
                        // Icon padding
                        leftIcon && "pl-10",
                        rightIcon && "pr-10",
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

                {rightIcon && (
                    <span
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    >
                        {rightIcon}
                    </span>
                )}
            </div>
        );
    },
);
Input.displayName = "Input";

export { Input };
