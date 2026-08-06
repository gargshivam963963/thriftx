"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption<T extends string = string> {
    value: T;
    label: React.ReactNode;
    description?: React.ReactNode;
    disabled?: boolean;
}

export interface RadioGroupProps<T extends string = string>
    extends Omit<
        React.HTMLAttributes<HTMLDivElement>,
        "onChange" | "defaultValue"
    > {
    /** Options to render */
    options: RadioOption<T>[];
    /** Selected value (controlled) */
    value?: T;
    /** Default selected value (uncontrolled) */
    defaultValue?: T;
    /** Name for the radio group */
    name?: string;
    /** Show error styling */
    error?: boolean;
    /** Layout direction */
    direction?: "row" | "column";
    /** Controlled change handler */
    onChange?: (value: T) => void;
}

/**
 * THRIFTX Design System — Radio Group
 * Accessible radio group with consistent styling.
 */
export function RadioGroup<T extends string = string>({
    options,
    value,
    defaultValue,
    name,
    error,
    direction = "column",
    onChange,
    className,
    ...props
}: RadioGroupProps<T>) {
    const [internalValue, setInternalValue] = React.useState<T | undefined>(
        defaultValue,
    );
    const isControlled = value !== undefined;
    const selectedValue = isControlled ? value : internalValue;

    const handleChange = (val: T) => {
        if (!isControlled) setInternalValue(val);
        onChange?.(val);
    };

    return (
        <div
            role="radiogroup"
            className={cn(
                "flex gap-3",
                direction === "column" ? "flex-col" : "flex-row flex-wrap",
                className,
            )}
            {...props}
        >
            {options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                    <label
                        key={option.value}
                        className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 select-none",
                            isSelected
                                ? "border-foreground bg-background shadow-sm"
                                : "border-border hover:border-foreground/40",
                            option.disabled && "cursor-not-allowed opacity-50",
                            error && !isSelected && "border-error",
                        )}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={isSelected}
                            disabled={option.disabled}
                            onChange={() => handleChange(option.value)}
                            className="sr-only"
                        />
                        <span
                            className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                                isSelected
                                    ? "border-foreground"
                                    : "border-border group-hover:border-foreground/50",
                            )}
                            aria-hidden="true"
                        >
                            {isSelected && (
                                <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
                            )}
                        </span>
                        <span className="flex flex-col gap-0.5">
                            <span className="text-body-sm font-medium text-foreground">
                                {option.label}
                            </span>
                            {option.description && (
                                <span className="text-small text-muted-foreground">
                                    {option.description}
                                </span>
                            )}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}

RadioGroup.displayName = "RadioGroup";
