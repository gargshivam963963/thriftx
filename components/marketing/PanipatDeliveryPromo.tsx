"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, MapPin, Truck, Zap } from "lucide-react";

import { PANIPAT_DELIVERY_PROMO } from "@/lib/shipping/constants";
import { cn } from "@/lib/utils";

type PanipatPromoVariant = "compact" | "full";

interface PanipatDeliveryPromoProps {
    /** `compact` = one-line strip. `full` = headline + benefit grid. */
    variant?: PanipatPromoVariant;
    /** Show the "Shop now" link (hidden inside the checkout flow). */
    showCta?: boolean;
    className?: string;
}

/**
 * PanipatDeliveryPromo — the single Panipat marketing surface for the app.
 *
 * Why this exists: the "FREE delivery in Panipat, 2-3 hours" promise was
 * previously scattered across a checkout modal, a shipping notice and a few
 * hardcoded strings. This component plus `PANIPAT_DELIVERY_PROMO` makes it one
 * reusable, theme-aware, motion-safe block so the message is always identical
 * wherever it appears (checkout, cart, shop, product, success pages).
 *
 * Uses semantic `success` tokens so it stays legible in light and dark mode
 * with zero `dark:` overrides.
 */
export function PanipatDeliveryPromo({
    variant = "compact",
    showCta = true,
    className,
}: PanipatDeliveryPromoProps) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.aside
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            aria-label={`${PANIPAT_DELIVERY_PROMO.badge} — 2–3 hour delivery`}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-success/35 bg-success-bg shadow-sm sm:rounded-3xl",
                className,
            )}
        >
            {/* Soft ambient wash — decorative only. */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-14 size-32 rounded-full bg-success/15 blur-3xl"
            />
<div className="relative flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success text-white shadow-sm sm:size-11"
                >
                    <Zap className="size-5" strokeWidth={2.2} />
                </span>

                <div className="min-w-0 flex-1">
                    <p className="text-badge font-bold uppercase tracking-wider text-success">
                        {PANIPAT_DELIVERY_PROMO.badge}
                    </p>

                    <p className="mt-1 text-body-sm font-semibold text-foreground">
                        {variant === "full"
                            ? PANIPAT_DELIVERY_PROMO.headline
                            : PANIPAT_DELIVERY_PROMO.subheadline}
                    </p>

                    {variant === "compact" ? (
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <Clock
                                    className="size-3.5 shrink-0"
                                    aria-hidden="true"
                                />
                                2–3 hour delivery
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <MapPin
                                    className="size-3.5 shrink-0"
                                    aria-hidden="true"
                                />
                                Across Panipat
                            </span>
                        </p>
                    ) : (
                        <>
                            <p className="mt-1.5 text-small text-muted-foreground">
                                {PANIPAT_DELIVERY_PROMO.subheadline}
                            </p>
                            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                                {PANIPAT_DELIVERY_PROMO.benefits.map(
                                    (benefit) => (
                                        <li
                                            key={benefit}
                                            className="flex items-start gap-2 text-small text-foreground"
                                        >
                                            <Truck
                                                className="mt-0.5 size-3.5 shrink-0"
                                                aria-hidden="true"
                                            />
                                            <span>{benefit}</span>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </>
                    )}
                </div>

                {showCta && (
                    <Link
                        href="/shop"
                        className="hidden shrink-0 items-center gap-1 self-center rounded-xl bg-success px-4 py-2.5 text-button font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 sm:inline-flex"
                    >
                        {PANIPAT_DELIVERY_PROMO.ctaLabel}
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                )}
            </div>
        </motion.aside>
    );
}

export default PanipatDeliveryPromo;