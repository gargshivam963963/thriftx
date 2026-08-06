"use client";

import * as React from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./Input";

export interface PhoneFieldProps
    extends Omit<InputProps, "type" | "leftIcon" | "inputMode"> {
    /** Country calling code prefix (default +91) */
    countryCode?: string;
    /** Show error styling */
    error?: boolean;
}

/**
 * THRIFTX Design System — Phone Field
 * Phone input with country code prefix and validation hint.
 */
const PhoneField = React.forwardRef<HTMLInputElement, PhoneFieldProps>(
    ({ className, countryCode = "+91", error, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <span
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                >
                    <Phone className="h-4 w-4" />
                </span>

                <div className="flex items-stretch">
                    <span
                        className={cn(
                            "flex items-center rounded-l-xl border border-r-0 bg-muted px-3 text-small font-medium text-foreground",
                            "border-border",
                            error && "border-error",
                        )}
                    >
                        {countryCode}
                    </span>
                    <Input
                        ref={ref}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        error={error}
                        className={cn("rounded-l-none pl-4", className)}
                        {...props}
                    />
                </div>
            </div>
        );
    },
);
PhoneField.displayName = "PhoneField";

export { PhoneField };
