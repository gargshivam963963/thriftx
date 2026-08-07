"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { buttonVariants } from "./button.styles";
import type { ButtonProps } from "./button.types";

/**
 * Button — THRIFTX design-system button.
 *
 * - `asChild` renders a plain Radix `Slot` (no Framer Motion) so it can merge
 *   styles/aria onto a single consumer element (e.g. a `<Link>`). Using
 *   `motion(Slot)` breaks Slot's single-child contract, so we deliberately
 *   avoid it here.
 * - Non-asChild renders a `motion.button` with hover/tap/transition motion.
 */
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
        const content = children as React.ReactNode;

        const variantClasses = cn(
            buttonVariants({
                variant,
                size,
                rounded,
                shadow,
            }),
            fullWidth && "w-full",
            !isIconOnly && !asChild && "relative overflow-hidden",
            className
        );

        // ── asChild: plain Radix Slot, no motion props ────────────────
        // Strip motion-only props so we don't pass a MotionStyle onto an
        // element merging into a consumer's single child (e.g. a Link).
        if (asChild) {
            const {
                style: _style,
                initial: _initial,
                animate: _animate,
                exit: _exit,
                whileInView: _whileInView,
                variants: _variants,
                layout: _layout,
                layoutId: _layoutId,
                drag: _drag,
                dragControls: _dragControls,
                dragConstraints: _dragConstraints,
                dragElastic: _dragElastic,
                dragMomentum: _dragMomentum,
                dragPropagation: _dragPropagation,
                dragTransition: _dragTransition,
                onDrag: _onDrag,
                onDragStart: _onDragStart,
                onDragEnd: _onDragEnd,
                onDragTransitionEnd: _onDragTransitionEnd,
                onPan: _onPan,
                onPanStart: _onPanStart,
                onPanEnd: _onPanEnd,
                onTap: _onTap,
                onTapStart: _onTapStart,
                onTapCancel: _onTapCancel,
                onHoverStart: _onHoverStart,
                onHoverEnd: _onHoverEnd,
                onUpdate: _onUpdate,
                ...domProps
            } = props;

            return (
                <Slot
                    ref={ref}
                    aria-disabled={isDisabled}
                    aria-busy={loading}
                    className={variantClasses}
                    {...(domProps as React.HTMLAttributes<HTMLElement>)}
                >
                    {content}
                </Slot>
            );
        }

        // ── Standard motion.button ────────────────────────────────────
        return (
            <motion.button
                ref={ref}
                type={type}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                aria-busy={loading}
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
                className={variantClasses}
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
                            <span className="truncate">{loadingText}</span>
                        )}
                    </>
                ) : success ? (
                    <>
                        <Check
                            className="h-[1.125em] w-[1.125em] shrink-0"
                            aria-hidden="true"
                        />

                        {!isIconOnly && (
                            <span className="truncate">{successText}</span>
                        )}
                    </>
                ) : isIconOnly ? (
                    <span className="flex items-center justify-center">
                        {content}
                    </span>
                ) : (
                    <>
                        {leftIcon && (
                            <span
                                className="flex h-[1.125em] w-[1.125em] shrink-0 items-center justify-center [&_svg]:h-full [&_svg]:w-full"
                                aria-hidden="true"
                            >
                                {leftIcon}
                            </span>
                        )}

                        <span className="truncate">{content}</span>

                        {rightIcon && (
                            <span
                                className="flex h-[1.125em] w-[1.125em] shrink-0 items-center justify-center [&_svg]:h-full [&_svg]:w-full"
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
