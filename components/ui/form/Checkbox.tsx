"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "type" | "size"
    > {
    /** Label shown next to the checkbox */
    label?: React.ReactNode;
    /** Optional description below the label */
    description?: React.ReactNode;
    /** Checkbox size variant */
    size?: "sm" | "md";
    /** Show error styling */
    error?: boolean;
}

/**
 * THRIFTX Design System — Checkbox
 * Accessible checkbox with consistent styling and label support.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    (
        { className, label, description, size = "md", error, id, ...props },
        ref,
    ) => {
        const boxSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
        const labelSize = size === "sm" ? "text-small" : "text-body-sm";

        const inputId = id ?? React.useId();

        return (
            <label
                htmlFor={inputId}
                className={cn(
                    "group flex cursor-pointer items-start gap-3 select-none",
                    props.disabled && "cursor-not-allowed opacity-60",
                    className,
                )}
            >
                <span className="relative mt-0.5 flex shrink-0">
                    <input
                        ref={ref}
                        id={inputId}
                        type="checkbox"
                        className="peer sr-only"
                        {...props}
                    />
                    <span
                        className={cn(
                            "flex items-center justify-center rounded-md border transition-all duration-200",
                            boxSize,
                            error
                                ? "border-error"
                                : "border-border group-hover:border-foreground/50",
                            "peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background",
                            "peer-focus-visible:ring-2 peer-focus-visible:ring-foreground/20 peer-focus-visible:ring-offset-1",
                        )}
                        aria-hidden="true"
                    >
                        <Check
                            className="h-3 w-3 opacity-0 transition-opacity peer-checked:opacity-100"
                            strokeWidth={3}
                        />
                    </span>
                </span>

                {(label || description) && (
                    <span className="flex flex-col gap-0.5">
                        {label && (
                            <span className={cn("font-medium text-foreground", labelSize)}>
                                {label}
                            </span>
                        )}
                        {description && (
                            <span className="text-small text-muted-foreground">
                                {description}
                            </span>
                        )}
                    </span>
                )}
            </label>
        );
    },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
