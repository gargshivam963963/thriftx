"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { Check, Loader2 } from "lucide-react";

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
            loadingText = "Loading...",

            success = false,
            successText = "Success",

            fullWidth = false,

            leftIcon,
            rightIcon,

            disabled,
            type = "button",

            whileHover,
            whileTap,
            transition,
            asChild = false,

            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;
        const isIconOnly =
            typeof size === "string" && size.startsWith("icon");
        const Comp: any = asChild ? motion(Slot as any) : motion.button;

        const elementProps: any = {
            ref,
            ...(asChild ? {} : { type }),
            ...(asChild ? {} : { disabled: isDisabled }),
            'aria-disabled': isDisabled,
            'aria-busy': loading,
        };

        return (
            <Comp
                {...elementProps}
                whileHover={
                    whileHover ?? {
                        scale: 1.03,
                        y: -2,
                    }
                }
                whileTap={
                    whileTap ?? {
                        scale: 0.975,
                    }
                }
                transition={
                    transition ?? {
                        duration: 0.16,
                        ease: "easeOut",
                    }
                }
                className={cn(
                    buttonVariants({
                        variant,
                        size,
                        rounded,
                        shadow,
                    }),
                    fullWidth && "w-full",
                    !isIconOnly && "relative overflow-hidden",
                    className
                )}
                {...props}
            >
                {/* Shine effect on hover */}
                {!isIconOnly && (
                    <span
                        className="absolute inset-0 -translate-x-full rounded-[inherit] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[400ms] group-hover:translate-x-full"
                        aria-hidden="true"
                    />
                )}

                {loading ? (
                    <>
                        <Loader2
                            className="h-[1.125em] w-[1.125em] animate-spin shrink-0"
                            aria-hidden="true"
                        />

                        {!isIconOnly && (
                            <span className="truncate">
                                {loadingText}
                            </span>
                        )}
                    </>
                ) : success ? (
                    <>
                        <Check
                            className="h-[1.125em] w-[1.125em] shrink-0"
                            aria-hidden="true"
                        />

                        {!isIconOnly && (
                            <span className="truncate">
                                {successText}
                            </span>
                        )}
                    </>
                ) : isIconOnly ? (
                    <span className="flex items-center justify-center">
                        {children as React.ReactNode}
                    </span>
                ) : (
                    <>
                        {leftIcon && (
                            <span
                                className="flex shrink-0 items-center justify-center"
                                aria-hidden="true"
                            >
                                {leftIcon}
                            </span>
                        )}

                        <span className="truncate">{children as React.ReactNode}</span>

                        {rightIcon && (
                            <span
                                className="flex shrink-0 items-center justify-center"
                                aria-hidden="true"
                            >
                                {rightIcon}
                            </span>
                        )}
                    </>
                )}
            </Comp>
        );
    }
);

Button.displayName = "Button";

