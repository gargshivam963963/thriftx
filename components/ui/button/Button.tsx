"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { buttonVariants } from "./button.styles";
import type { ButtonProps } from "./button.types";

interface ExtendedButtonProps extends ButtonProps {
    loading?: boolean;
    loadingText?: string;
    success?: boolean;
    successText?: string;
}

export const Button = forwardRef<
    HTMLButtonElement,
    ExtendedButtonProps
>(
    (
        {
            children,
            className,
            variant,
            size,
            rounded,
            shadow,

            loading = false,
            loadingText = "Loading...",

            success = false,
            successText = "Success",

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

        const isIconOnly =
            typeof size === "string" &&
            size.startsWith("icon");

        return (
            <motion.button
                ref={ref}
                type={type}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                aria-busy={loading}
                whileHover={{
                    scale: 1.03,
                    y: -1,
                }}
                whileTap={{
                    scale: 0.97,
                }}
                transition={{
                    duration: 0.18,
                }}
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

                        {!isIconOnly && (
                            <span>{loadingText}</span>
                        )}
                    </>
                ) : success ? (
                    <>
                        <Check
                            className="h-4 w-4"
                            aria-hidden="true"
                        />

                        {!isIconOnly && (
                            <span>{successText}</span>
                        )}
                    </>
                ) : isIconOnly ? (
                    children
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

                        {children}

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
            </motion.button>
        );
    }
);

Button.displayName = "Button";