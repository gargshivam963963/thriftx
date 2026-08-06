"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./Input";

export interface PasswordFieldProps
    extends Omit<InputProps, "type" | "rightIcon"> {
    /** Show error styling */
    error?: boolean;
    /** Show a lock icon on the left */
    showLock?: boolean;
}

/**
 * THRIFTX Design System — Password Field
 * Input with built-in show/hide toggle and optional lock icon.
 */
const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
    ({ className, error, showLock = true, ...props }, ref) => {
        const [visible, setVisible] = React.useState(false);

        return (
            <div className="relative w-full">
                {showLock && (
                    <span
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    >
                        <Lock className="h-4 w-4" />
                    </span>
                )}

                <Input
                    ref={ref}
                    type={visible ? "text" : "password"}
                    error={error}
                    className={cn(showLock && "pl-10", className)}
                    {...props}
                />

                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                >
                    {visible ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        );
    },
);
PasswordField.displayName = "PasswordField";

export { PasswordField };
