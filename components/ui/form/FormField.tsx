"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Label text shown above the field */
    label?: string;
    /** Error message — shows error styling when provided */
    error?: string;
    /** Helper text shown below the field */
    helper?: string;
    /** Whether the field is required (adds * to label) */
    required?: boolean;
    /** Input group id — link label to control via htmlFor */
    htmlFor?: string;
    /** Optional trailing element (e.g. inline icon button) */
    trailing?: React.ReactNode;
}

/**
 * THRIFTX Design System — Form Field
 * Consistent wrapper for all form controls: label + input + helper/error.
 */
export function FormField({
    label,
    error,
    helper,
    required,
    htmlFor,
    trailing,
    className,
    children,
    ...props
}: FormFieldProps) {
    const id = htmlFor;
    const hasError = Boolean(error);

    return (
        <div className={cn("flex flex-col gap-1.5", className)} {...props}>
            {label && (
                <div className="flex items-center justify-between">
                    <label
                        htmlFor={id}
                        className="text-label font-medium text-foreground"
                    >
                        {label}
                        {required && (
                            <span className="ml-0.5 text-error" aria-hidden="true">
                                *
                            </span>
                        )}
                    </label>
                    {trailing}
                </div>
            )}

            {children}

            {hasError && <ErrorMessage message={error} />}
            {!hasError && helper && <HelperText>{helper}</HelperText>}
        </div>
    );
}

FormField.displayName = "FormField";

/** Error message with icon — used for field-level and form-level errors */
export function ErrorMessage({
    message,
    className,
}: {
    message?: string;
    className?: string;
}) {
    if (!message) return null;

    return (
        <p
            role="alert"
            className={cn(
                "mt-1.5 flex items-start gap-1 px-1 text-caption text-error",
                className,
            )}
        >
            <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{message}</span>
        </p>
    );
}

/** Helper text shown under a field */
export function HelperText({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p className={cn("mt-1.5 px-1 text-small text-muted-foreground", className)}>
            {children}
        </p>
    );
}
