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

const ButtonIcon = ({
    children,
}: {
    children?: React.ReactNode;
}) => {
    if (!children) return null;

    return (
        <span
            className="inline-flex shrink-0 items-center justify-center text-current"
            aria-hidden="true"
        >
            {children}
        </span>
    );
};

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
                whileHover={whileHover}
                whileTap={whileTap ?? { scale: 0.98 }}
                transition={transition ?? { duration: 0.16, ease: "easeOut" }}
                className={variantClasses}
                {...props}
            >
                {loading ? (
                    <>
                        <ButtonIcon>
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </ButtonIcon>

                        {!isIconOnly && (
                            <span
                                className="min-w-0 truncate leading-normal"
                                role="status"
                            >
                                {loadingText}
                            </span>
                        )}
                    </>
                ) : success ? (
                    <>
                        <ButtonIcon>
                            <Check />
                        </ButtonIcon>

                        {!isIconOnly && (
                            <span className="min-w-0 truncate leading-normal">
                                {successText}
                            </span>
                        )}
                    </>
                ) : isIconOnly ? (
                    <span className="inline-flex items-center justify-center">
                        {content}
                    </span>
                ) : (
                    <>
                        {leftIcon && <ButtonIcon>{leftIcon}</ButtonIcon>}

                        {content}

                        {rightIcon && <ButtonIcon>{rightIcon}</ButtonIcon>}
                    </>
                )}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
