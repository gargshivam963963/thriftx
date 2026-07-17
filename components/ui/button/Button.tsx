"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { buttonVariants } from "./button.styles";
import type { ButtonProps } from "./button.types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            className,
            variant,
            size,
            rounded,
            shadow,
            loading = false,
            fullWidth = false,
            leftIcon,
            rightIcon,
            disabled,
            type = "button",
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        return (
            <button
                ref={ref}
                type={type}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                aria-busy={loading}
                className={cn(
                    buttonVariants({
                        variant,
                        size,
                        rounded,
                        shadow,
                    }),
                    fullWidth && "w-full",
                    className
                )}
                {...props}
            >
                {loading ? (
                    <>
                        <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                        />
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {leftIcon && (
                            <span
                                className="flex items-center justify-center"
                                aria-hidden="true"
                            >
                                {leftIcon}
                            </span>
                        )}

                        <span>{children}</span>

                        {rightIcon && (
                            <span
                                className="flex items-center justify-center"
                                aria-hidden="true"
                            >
                                {rightIcon}
                            </span>
                        )}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = "Button";