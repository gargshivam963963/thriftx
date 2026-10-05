"use client";

import {
    useCallback,
    useId,
    useRef,
    type KeyboardEvent,
    type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────────────────────── */

export type SegmentedControlVariant = "surface" | "underline";
export type SegmentedControlSize = "sm" | "md" | "lg";

export interface SegmentOption<T extends string> {
    value: T;
    /** Visible label. Omit for an icon-only segment. */
    label?: string;
    icon?: ReactNode;
    /** Optional numeric badge (order counts, result totals…). */
    count?: number;
    /** Screen-reader name — required when `label` is omitted. */
    ariaLabel?: string;
    disabled?: boolean;
}

interface SegmentedControlProps<T extends string> {
    options: SegmentOption<T>[];
    value: T;
    onChange: (value: T) => void;
    /** Visual language. `underline` reads as a nav / filter tab bar. */
    variant?: SegmentedControlVariant;
    size?: SegmentedControlSize;
    /** Accessible name for the whole group. */
    ariaLabel?: string;
    /** `tabpanel` id prefix so each tab can point at its region. */
    idPrefix?: string;
    /** Every segment shares the width equally (toolbar icon toggles). */
    fullWidth?: boolean;
    /** Allow the row to wrap onto multiple lines (filter chips). */
    wrap?: boolean;
    className?: string;
}

/* ── Motion tokens ────────────────────────────────────────────────────────────
 * Shared so every switch in the app moves identically.                          */

const spring = {
    type: "spring",
    stiffness: 520,
    damping: 40,
    mass: 0.7,
} as const;

/* ── Size tokens ──────────────────────────────────────────────────────────────
 * Heights follow the shared control language (32 · 36→40 · 40→44 px) and the
 * typography tokens, never arbitrary font sizes.                               */

const SIZE = {
    sm: {
        track: "gap-0.5 p-1",
        radius: "rounded-lg",
        seg: "h-8 gap-1.5 px-2.5 text-label",
        iconOnly: "h-8 w-8 p-0",
        indicator: "rounded-md",
    },
    md: {
        track: "gap-1 p-1",
        radius: "rounded-xl",
        seg: "h-9 gap-2 px-3.5 text-label md:h-10",
        iconOnly: "h-9 w-9 p-0 md:h-10 md:w-10",
        indicator: "rounded-lg",
    },
    lg: {
        track: "gap-1 p-1",
        radius: "rounded-xl",
        seg: "h-10 gap-2 px-4 text-button md:h-11",
        iconOnly: "h-10 w-10 p-0 md:h-11 md:w-11",
        indicator: "rounded-lg",
    },
} as const;

/**
 * SegmentedControl — the ONE switch / tab primitive for THRIFTX.
 *
 * Replaces every hand-rolled grid-list toggle, period picker, status filter and
 * pill group in the app so they all read as one system:
 *
 * - **Sliding indicator** driven by a per-instance `layoutId` (via `useId`), so
 *   two controls on the same page never animate into one another.
 * - **Full keyboard support** — arrow keys / Home / End with a roving
 *   `tabIndex`, following the WAI-ARIA tabs pattern.
 * - **Theme-aware** — driven purely by `foreground` / `background` / `muted`
 *   tokens, so light and dark stay in sync with zero `dark:` overrides.
 * - **Three sizes** aligned to the shared control height language
 *   (32px · 36→40px · 40→44px) and the typography tokens.
 * - **Motion-safe** — springs collapse to an instant swap under
 *   `prefers-reduced-motion`.
 */
export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    variant = "surface",
    size = "md",
    ariaLabel,
    idPrefix,
    fullWidth = false,
    wrap = false,
    className,
}: SegmentedControlProps<T>) {
    const reactId = useId();
    const listId = `${idPrefix ?? "segment"}-${reactId.replace(/:/g, "")}`;
    const reduceMotion = useReducedMotion();
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const tokens = SIZE[size];
    const isUnderline = variant === "underline";
    const activeIndex = Math.max(
        0,
        options.findIndex((o) => o.value === value),
    );

    const focusTab = useCallback(
        (index: number) => {
            const bounded = (index + options.length) % options.length;
            const next = options[bounded];
            if (!next || next.disabled) return;
            tabRefs.current[next.value]?.focus();
            onChange(next.value);
        },
        [options, onChange],
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
                event.preventDefault();
                focusTab(activeIndex + 1);
                break;
            case "ArrowLeft":
            case "ArrowUp":
                event.preventDefault();
                focusTab(activeIndex - 1);
                break;
            case "Home":
                event.preventDefault();
                focusTab(0);
                break;
            case "End":
                event.preventDefault();
                focusTab(options.length - 1);
                break;
            default:
                break;
        }
    };

    return (
        <div
            role="tablist"
            aria-label={ariaLabel}
            onKeyDown={handleKeyDown}
            className={cn(
                "inline-flex items-center",
                isUnderline
                    ? cn(
                          "gap-1 border-b border-border bg-transparent",
                          wrap ? "flex-wrap" : "flex-nowrap",
                      )
                    : cn(
                          "border border-border bg-muted",
                          tokens.track,
                          tokens.radius,
                          wrap ? "flex-wrap" : "flex-nowrap",
                      ),
                fullWidth && "flex w-full",
                className,
            )}
        >
            {options.map((opt) => {
                const active = value === opt.value;
                const iconOnly = !opt.label;

                return (
                    <button
                        key={opt.value}
                        ref={(node) => {
                            tabRefs.current[opt.value] = node;
                        }}
                        type="button"
                        role="tab"
                        id={`${listId}-tab-${opt.value}`}
                        aria-selected={active}
                        aria-controls={`${listId}-panel-${opt.value}`}
                        aria-label={opt.ariaLabel ?? opt.label}
                        tabIndex={active ? 0 : -1}
                        disabled={opt.disabled}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "group relative isolate inline-flex shrink-0 items-center justify-center",
                            "whitespace-nowrap font-medium leading-normal select-none",
                            "cursor-pointer transition-colors duration-200 ease-out",
                            "focus-visible:outline-none focus-visible:ring-2",
                            "focus-visible:ring-ring focus-visible:ring-offset-2",
                            "focus-visible:ring-offset-background",
                            "disabled:pointer-events-none disabled:opacity-40",
                            tokens.seg,
                            iconOnly && tokens.iconOnly,
                            fullWidth && "flex-1",
                            isUnderline
                                ? cn(
                                      "-mb-px rounded-t-lg pb-2.5 pt-2",
                                      active
                                          ? "text-foreground"
                                          : "text-muted-foreground hover:text-foreground",
                                  )
                                : cn(
                                      tokens.radius,
                                      active
                                          ? "text-background"
                                          : "text-muted-foreground hover:text-foreground",
                                  ),
                        )}
                    >
                        {/* Active indicator — slides between segments */}
                        {active &&
                            (isUnderline ? (
                                <motion.span
                                    layoutId={`${listId}-underline`}
                                    transition={
                                        reduceMotion ? { duration: 0 } : spring
                                    }
                                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-foreground"
                                />
                            ) : (
                                <motion.span
                                    layoutId={`${listId}-indicator`}
                                    transition={
                                        reduceMotion ? { duration: 0 } : spring
                                    }
                                    className={cn(
                                        "absolute inset-0 -z-10 bg-foreground shadow-sm",
                                        tokens.indicator,
                                    )}
                                />
                            ))}
{/* Icon — swaps with a short scale + fade */}
                        {opt.icon && (
                            <span
                                aria-hidden="true"
                                className="relative z-10 inline-flex shrink-0 items-center justify-center [&_svg]:h-4 [&_svg]:w-4"
                            >
                                <AnimatePresence initial={false} mode="popLayout">
                                    <motion.span
                                        key={active ? "on" : "off"}
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.6, opacity: 0 }}
                                        transition={
                                            reduceMotion
                                                ? { duration: 0 }
                                                : { duration: 0.18, ease: "easeOut" }
                                        }
                                        className="inline-flex"
                                    >
                                        {opt.icon}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                        )}

                        {/* Label + optional count badge */}
                        {!iconOnly && (
                            <span className="relative z-10 inline-flex items-center gap-1.5">
                                {opt.label}
                                {typeof opt.count === "number" && (
                                    <span
                                        className={cn(
                                            "inline-flex min-w-5 items-center justify-center",
                                            "rounded-full px-1.5 py-px text-badge tabular-nums",
                                            isUnderline
                                                ? "bg-muted text-muted-foreground"
                                                : active
                                                  ? "bg-background/20 text-background"
                                                  : "bg-card text-muted-foreground",
                                        )}
                                    >
                                        {opt.count}
                                    </span>
                                )}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * SegmentedFilterRow — wrapping filter tab bar built on the same primitive.
 *
 * Used where there are too many options for a fixed-width track (order
 * statuses, product categories). Keeps identical motion + keyboard behaviour,
 * just drops the container surface for an underline indicator.
 */
export function SegmentedFilterRow<T extends string>({
    options,
    value,
    onChange,
    ariaLabel,
    size = "md",
    className,
}: Omit<SegmentedControlProps<T>, "variant" | "wrap" | "fullWidth">) {
    return (
        <SegmentedControl
            options={options}
            value={value}
            onChange={onChange}
            variant="underline"
            size={size}
            ariaLabel={ariaLabel}
            wrap
            className={cn(
                "w-full justify-start gap-x-1 gap-y-1 rounded-none border-0 bg-transparent p-0",
                className,
            )}
        />
    );
}

export default SegmentedControl;
