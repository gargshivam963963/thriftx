"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface OtpFieldProps {
    /** Number of OTP digits */
    length?: number;
    /** Current OTP value (controlled) */
    value?: string;
    /** Default value (uncontrolled) */
    defaultValue?: string;
    /** Label for accessibility */
    label?: string;
    /** Show error styling */
    error?: boolean;
    /** Disable all inputs */
    disabled?: boolean;
    /** Auto-submit when all digits filled */
    onComplete?: (otp: string) => void;
    /** Controlled change handler */
    onChange?: (otp: string) => void;
}

/**
 * THRIFTX Design System — OTP Field
 * Accessible one-time-password input with smart digit navigation.
 */
export function OtpField({
    length = 6,
    value,
    defaultValue = "",
    label = "Verification code",
    error,
    disabled,
    onComplete,
    onChange,
}: OtpFieldProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = value !== undefined;
    const otp = (isControlled ? value : internalValue) ?? "";
    const refs = React.useRef<Array<HTMLInputElement | null>>([]);

    const setOtp = (next: string) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
    };

    const focusDigit = (index: number) => {
        const input = refs.current[index];
        if (input) {
            input.focus();
            input.select();
        }
    };

    const handleChange = (index: number, char: string) => {
        const next = otp.split("");
        // Take only the last digit character
        const digit = char.replace(/\D/g, "").slice(-1);
        next[index] = digit;
        const joined = next.join("").slice(0, length);
        setOtp(joined);

        // Auto-advance
        if (digit && index < length - 1) {
            focusDigit(index + 1);
        }

        if (joined.length === length && joined.replace(/\D/g, "").length === length) {
            onComplete?.(joined);
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const next = otp.split("");
            if (next[index]) {
                next[index] = "";
                setOtp(next.join(""));
            } else if (index > 0) {
                next[index - 1] = "";
                setOtp(next.join(""));
                focusDigit(index - 1);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            focusDigit(index - 1);
        } else if (e.key === "ArrowRight" && index < length - 1) {
            e.preventDefault();
            focusDigit(index + 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        setOtp(pasted);
        if (pasted.length === length) {
            onComplete?.(pasted);
        } else {
            focusDigit(Math.min(pasted.length, length - 1));
        }
    };

    return (
        <div
            role="group"
            aria-label={label}
            className="flex items-center justify-center gap-2"
            onPaste={handlePaste}
        >
            {Array.from({ length }).map((_, index) => (
                <React.Fragment key={index}>
                    <input
                        ref={(el) => {
                            refs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={2}
                        value={otp[index] ?? ""}
                        disabled={disabled}
                        aria-label={`Digit ${index + 1}`}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={cn(
                            "h-12 w-10 rounded-xl border bg-background text-center text-lg font-bold text-foreground outline-none transition-all duration-200 sm:h-14 sm:w-12",
                            error
                                ? "border-error focus:border-error focus:ring-2 focus:ring-error/15"
                                : "border-border focus:border-foreground focus:ring-2 focus:ring-foreground/10",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                    />
                </React.Fragment>
            ))}
        </div>
    );
}

OtpField.displayName = "OtpField";
