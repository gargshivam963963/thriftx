"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Banknote, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "@/lib/types/order";
import { cn } from "@/lib/utils";

interface CheckoutPayBarProps {
    total: number;
    discount?: number;
    discountReason?: string;
    /** Show the total as a dash while the quote is in flight. */
    loading?: boolean;
    /** Non-null when the server rejected the quote. */
    error?: string;
    canPay: boolean;
    paymentLoading: boolean;
    selectedMethod: PaymentMethod | null;
    onPay: (method: PaymentMethod) => void;
    className?: string;
}

/**
 * CheckoutPayBar — the ONE payment action on mobile.
 *
 * Previously the mobile bar rendered a "COD" button and a "Pay ₹598" button
 * side by side. At 375px that row overflowed the viewport and clipped the
 * primary action mid-word (see the iPhone SE screenshot). It also gave the
 * customer three competing CTAs once the desktop summary button was counted.
 *
 * Now the payment method is chosen once, in step 3, and this bar renders a
 * single full-width button whose label reflects that choice. One decision,
 * one action.
 */
export function CheckoutPayBar({
    total,
    discount = 0,
    discountReason = "",
    loading = false,
    error = "",
    canPay,
    paymentLoading,
    selectedMethod,
    onPay,
    className,
}: CheckoutPayBarProps) {
    const reduceMotion = useReducedMotion();

    const isCod = selectedMethod === "cod";
    const totalLabel = loading
        ? "—"
        : `₹${total.toLocaleString("en-IN")}`;

    const ctaLabel = isCod
        ? "Place order — pay on delivery"
        : loading
          ? "Confirming total…"
          : `Pay ${totalLabel}`;

    return (
        <motion.div
            initial={reduceMotion ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={cn(
                "fixed inset-x-0 z-40 border-t border-white/40 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-950/65",
                "bottom-[var(--mobile-nav-height)] pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
                "md:bottom-0 lg:hidden",
                className,
            )}
        >
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                <div className="mb-2.5 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-caption text-muted-foreground">
                            Total payable
                        </p>

                        <p
                            aria-live="polite"
                            className="mt-0.5 text-h4 font-bold tabular-nums text-foreground"
                        >
                            {totalLabel}
                        </p>
                    </div>

                    <div className="min-w-0 shrink-0 text-right">
                        {discount > 0 && (
                            <p className="text-small font-semibold text-success-foreground">
                                {discountReason || "You saved"} −₹
                                {discount.toLocaleString("en-IN")}
                            </p>
                        )}

                        <p className="text-small text-muted-foreground">
                            {isCod
                                ? "Cash on delivery"
                                : "Secured by Razorpay"}
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    onClick={() => onPay(selectedMethod ?? "razorpay")}
                    disabled={!canPay || paymentLoading || !selectedMethod}
                    loading={paymentLoading}
                    loadingText="Placing your order…"
                    size="lg"
                    fullWidth
                    leftIcon={
                        isCod ? (
                            <Banknote
                                className="size-5"
                                aria-hidden="true"
                            />
                        ) : (
                            <Lock className="size-5" aria-hidden="true" />
                        )
                    }
                    className="shadow-lg"
                >
                    {ctaLabel}
                </Button>

                {!canPay && !error && (
                    <p
                        role="status"
                        className="mt-2 text-center text-small text-muted-foreground"
                    >
                        {selectedMethod
                            ? "Confirming your total…"
                            : "Choose a payment method to continue."}
                    </p>
                )}

                {error && (
                    <p
                        role="alert"
                        className="mt-2 flex items-start justify-center gap-1.5 text-center text-small text-error"
                    >
                        <AlertCircle
                            className="mt-0.5 size-3.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span>{error}</span>
                    </p>
                )}
            </div>
        </motion.div>
    );
}

export default CheckoutPayBar;