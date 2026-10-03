
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ArrowRight,
    TicketPercent,
    Truck,
    ShieldCheck,
    Sparkles,
    Zap,
    Clock,
    Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getShippingRates } from "@/lib/shipping/api";
import type { ShippingRate } from "@/lib/shipping/types";
import {
    FALLBACK_SHIPPING_RATES,
    SHIPPING_DEFAULTS,
} from "@/lib/shipping/constants";

interface OrderSummaryProps {
    itemCount: number;
    subtotal: number;
    total: number;
    savings: number;
    paymentLoading: boolean;
    appliedCoupon: string;
    discount: number;
    onCheckout: () => Promise<void> | void;
    onApplyCoupon: (code: string) => void;
}

const FREE_SHIPPING_THRESHOLD =
    SHIPPING_DEFAULTS.freeShippingAmount;

const formatINR = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

export default function OrderSummary({
    itemCount,
    subtotal,
    total,
    savings,
    paymentLoading,
    appliedCoupon,
    discount,
    onCheckout,
    onApplyCoupon,
}: OrderSummaryProps) {
    const [couponInput, setCouponInput] = useState(appliedCoupon);
    const [couponError, setCouponError] = useState("");
    const [shippingMethod, setShippingMethod] =
        useState<string>("standard");
    const [shippingCost, setShippingCost] = useState(0);
    const [ratesLoading, setRatesLoading] = useState(false);
    const [ratesError, setRatesError] = useState("");
    const [availableRates, setAvailableRates] =
        useState<ShippingRate[]>([]);

    useEffect(() => {
        let active = true;

        async function loadRates() {
            setRatesLoading(true);
            setRatesError("");

            try {
                const result = await getShippingRates(
                    "132103",
                    SHIPPING_DEFAULTS.defaultWeight
                );

                if (!active) return;

                if (result.rates?.length) {
                    setAvailableRates(result.rates);
                } else {
                    setAvailableRates([
                        {
                            courierId: "fallback_standard",
                            courierName:
                                FALLBACK_SHIPPING_RATES.courier.standard.name,
                            method: "standard",
                            amount:
                                FALLBACK_SHIPPING_RATES.courier.standard.price,
                            estimatedDays: 5,
                            codAvailable: true,
                            trackingAvailable: true,
                        },
                        {
                            courierId: "fallback_express",
                            courierName:
                                FALLBACK_SHIPPING_RATES.courier.express.name,
                            method: "express",
                            amount:
                                FALLBACK_SHIPPING_RATES.courier.express.price,
                            estimatedDays: 3,
                            codAvailable: true,
                            trackingAvailable: true,
                        },
                    ]);
                }
            } catch {
                if (!active) return;

                setRatesError(
                    "Live rates are temporarily unavailable. Showing estimated rates."
                );

                setAvailableRates([
                    {
                        courierId: "fallback_standard",
                        courierName:
                            FALLBACK_SHIPPING_RATES.courier.standard.name,
                        method: "standard",
                        amount:
                            FALLBACK_SHIPPING_RATES.courier.standard.price,
                        estimatedDays: 5,
                        codAvailable: true,
                        trackingAvailable: true,
                    },
                    {
                        courierId: "fallback_express",
                        courierName:
                            FALLBACK_SHIPPING_RATES.courier.express.name,
                        method: "express",
                        amount:
                            FALLBACK_SHIPPING_RATES.courier.express.price,
                        estimatedDays: 3,
                        codAvailable: true,
                        trackingAvailable: true,
                    },
                ]);
            } finally {
                if (active) setRatesLoading(false);
            }
        }

        loadRates();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
            setShippingCost(0);
            return;
        }

        const rate = availableRates.find(
            (item) => item.method === shippingMethod
        );

        setShippingCost(rate?.amount ?? 0);
    }, [shippingMethod, availableRates, subtotal]);

    const finalTotal = total + shippingCost;
    const remainingForFree =
        Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

    const qualifiesForFreeShipping =
        subtotal >= FREE_SHIPPING_THRESHOLD;

    function handleApplyCoupon() {
        const code = couponInput.trim().toUpperCase();

        if (!code) {
            setCouponError("Please enter a coupon code.");
            return;
        }

        setCouponError("");
        onApplyCoupon(code);
    }

    return (
        <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            aria-label="Order summary"
            className="
                overflow-hidden rounded-2xl
                border border-border
                bg-card text-card-foreground
                shadow-card
            "
        >
            <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Order summary
                        </p>

                        <h2 className="mt-1 text-heading-4 font-bold text-foreground">
                            Your order
                        </h2>
                    </div>

                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-badge font-medium text-foreground">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                </div>

                {/* Shipping progress */}
                {remainingForFree > 0 && subtotal > 0 && (
                    <div className="mb-5 rounded-xl border border-border bg-muted/60 p-3">
                        <div className="flex items-start gap-2.5">
                            <Truck
                                size={16}
                                className="mt-0.5 shrink-0 text-foreground"
                                aria-hidden="true"
                            />

                            <p className="text-small leading-relaxed text-foreground">
                                Add{" "}
                                <strong>
                                    {formatINR(remainingForFree)}
                                </strong>{" "}
                                more to unlock free shipping.
                            </p>
                        </div>

                        <div
                            className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"
                            role="progressbar"
                            aria-label="Free shipping progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.min(
                                100,
                                (subtotal / FREE_SHIPPING_THRESHOLD) * 100
                            )}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Math.min(
                                        100,
                                        (subtotal / FREE_SHIPPING_THRESHOLD) * 100
                                    )}%`,
                                }}
                                transition={{ duration: 0.45 }}
                                className="h-full rounded-full bg-foreground"
                            />
                        </div>
                    </div>
                )}

                {/* Free shipping confirmation */}
                {qualifiesForFreeShipping && subtotal > 0 && (
                    <div
                        role="status"
                        className="
                            mb-5 flex items-center gap-2
                            rounded-lg border border-success/30
                            bg-success/10 px-3 py-2.5
                            text-small font-medium text-success
                        "
                    >
                        <Check
                            size={15}
                            className="shrink-0"
                            aria-hidden="true"
                        />
                        Free shipping unlocked
                    </div>
                )}

                {/* Delivery method */}
                {subtotal > 0 && (
                    <section className="mb-5">
                        <div className="mb-3 flex items-center gap-2">
                            <Truck
                                size={15}
                                className="text-muted-foreground"
                                aria-hidden="true"
                            />

                            <h3 className="text-small font-semibold text-foreground">
                                Delivery method
                            </h3>
                        </div>

                        {ratesLoading ? (
                            <div
                                className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-4"
                                role="status"
                            >
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />

                                <span className="text-small text-muted-foreground">
                                    Loading delivery options…
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {availableRates.map((rate) => {
                                    const selected =
                                        shippingMethod === rate.method;

                                    const isFree =
                                        qualifiesForFreeShipping ||
                                        rate.amount === 0;

                                    return (
                                        <button
                                            key={rate.courierId}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() =>
                                                setShippingMethod(rate.method)
                                            }
                                            className={`
                                                w-full rounded-xl border
                                                p-3 text-left
                                                transition-colors duration-150
                                                focus-visible:outline-none
                                                focus-visible:ring-2
                                                focus-visible:ring-ring
                                                focus-visible:ring-offset-2
                                                focus-visible:ring-offset-background
                                                ${selected
                                                    ? "border-foreground bg-foreground text-background"
                                                    : "border-border bg-card text-foreground hover:border-muted-foreground"
                                                }
                                            `}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span
                                                        className={`
                                                            flex h-9 w-9 shrink-0
                                                            items-center justify-center
                                                            rounded-lg
                                                            ${selected
                                                                ? "bg-background/15 text-background"
                                                                : "bg-muted text-foreground"
                                                            }
                                                        `}
                                                    >
                                                        {rate.method === "express" ? (
                                                            <Zap size={16} />
                                                        ) : (
                                                            <Truck size={16} />
                                                        )}
                                                    </span>

                                                    <span className="min-w-0">
                                                        <span className="block text-small font-semibold">
                                                            {rate.courierName}
                                                        </span>

                                                        <span
                                                            className={`
                                                                mt-1 flex items-center gap-1.5
                                                                text-badge
                                                                ${selected
                                                                    ? "text-background/80"
                                                                    : "text-muted-foreground"
                                                                }
                                                            `}
                                                        >
                                                            <Clock
                                                                size={12}
                                                                aria-hidden="true"
                                                            />

                                                            {rate.estimatedDays}{" "}
                                                            {rate.estimatedDays === 1
                                                                ? "day"
                                                                : "days"}
                                                        </span>
                                                    </span>
                                                </div>

                                                <span
                                                    className={`
                                                        shrink-0 text-small font-bold
                                                        ${selected
                                                            ? "text-background"
                                                            : isFree
                                                                ? "text-success"
                                                                : "text-foreground"
                                                        }
                                                    `}
                                                >
                                                    {isFree
                                                        ? "FREE"
                                                        : formatINR(rate.amount)}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {ratesError && (
                            <p
                                role="status"
                                className="mt-2 text-caption text-muted-foreground"
                            >
                                {ratesError}
                            </p>
                        )}
                    </section>
                )}

                {/* Price breakdown */}
                <div className="space-y-3 text-body-sm">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                            Subtotal
                        </span>

                        <span className="font-medium tabular-nums text-foreground">
                            {formatINR(subtotal)}
                        </span>
                    </div>

                    {savings > 0 && (
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                                Product savings
                            </span>

                            <span className="font-medium tabular-nums text-success">
                                −{formatINR(savings)}
                            </span>
                        </div>
                    )}

                    {discount > 0 && (
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                                Coupon discount
                            </span>

                            <span className="font-medium tabular-nums text-success">
                                −{formatINR(discount)}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                            Shipping
                        </span>

                        <span className="font-medium tabular-nums text-foreground">
                            {shippingCost === 0
                                ? "FREE"
                                : formatINR(shippingCost)}
                        </span>
                    </div>
                </div>

                <div className="my-5 h-px bg-border" />

                {/* Coupon */}
                <section className="mb-5">
                    <label
                        htmlFor="cart-coupon"
                        className="mb-2.5 flex items-center gap-2 text-small font-medium text-foreground"
                    >
                        <TicketPercent
                            size={15}
                            className="text-muted-foreground"
                            aria-hidden="true"
                        />

                        Have a coupon?
                    </label>

                    <div className="flex gap-2">
                        <input
                            id="cart-coupon"
                            value={couponInput}
                            onChange={(event) => {
                                setCouponInput(
                                    event.target.value.toUpperCase()
                                );
                                setCouponError("");
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    handleApplyCoupon();
                                }
                            }}
                            placeholder="Enter code"
                            autoComplete="off"
                            aria-invalid={Boolean(couponError)}
                            aria-describedby={
                                couponError ? "cart-coupon-error" : undefined
                            }
                            className="
                                min-w-0 flex-1 rounded-xl
                                border border-input bg-background
                                px-3 py-2.5 text-small
                                text-foreground
                                placeholder:text-muted-foreground
                                outline-none
                                transition
                                focus-visible:border-ring
                                focus-visible:ring-2
                                focus-visible:ring-ring/30
                            "
                        />

                        <Button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="shrink-0 rounded-xl px-4"
                        >
                            Apply
                        </Button>
                    </div>

                    {couponError && (
                        <p
                            id="cart-coupon-error"
                            role="alert"
                            className="mt-2 text-caption font-medium text-error"
                        >
                            {couponError}
                        </p>
                    )}

                    {appliedCoupon && discount > 0 && (
                        <p
                            role="status"
                            className="mt-2 flex items-center gap-1.5 text-caption font-medium text-success"
                        >
                            <Check size={13} aria-hidden="true" />

                            {appliedCoupon} applied —{" "}
                            {formatINR(discount)} off
                        </p>
                    )}
                </section>

                <div className="my-5 h-px bg-border" />

                {/* Total */}
                <div className="mb-5 flex items-end justify-between gap-3">
                    <div>
                        <p className="text-body-sm font-semibold text-foreground">
                            You pay
                        </p>

                        <p className="mt-0.5 text-caption text-muted-foreground">
                            Inclusive of all taxes
                        </p>
                    </div>

                    <span className="text-heading-3 font-bold tracking-tight tabular-nums text-foreground">
                        {formatINR(finalTotal)}
                    </span>
                </div>

                {/* Checkout */}
                <Button
                    type="button"
                    onClick={onCheckout}
                    loading={paymentLoading}
                    disabled={paymentLoading || itemCount === 0}
                    fullWidth
                    size="lg"
                    rightIcon={<ArrowRight size={16} />}
                    className="h-12 rounded-xl text-body-sm font-semibold"
                >
                    Proceed to Checkout
                </Button>

                {/* Trust details */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl bg-muted/60 px-1 py-3 text-center">
                        <ShieldCheck
                            size={16}
                            className="text-success"
                            aria-hidden="true"
                        />

                        <span className="text-[10px] font-medium leading-tight text-muted-foreground sm:text-badge">
                            Authenticated
                        </span>
                    </div>

                    <div className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl bg-muted/60 px-1 py-3 text-center">
                        <Sparkles
                            size={16}
                            className="text-foreground"
                            aria-hidden="true"
                        />

                        <span className="text-[10px] font-medium leading-tight text-muted-foreground sm:text-badge">
                            Quality checked
                        </span>
                    </div>

                    <div className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl bg-muted/60 px-1 py-3 text-center">
                        <Truck
                            size={16}
                            className="text-foreground"
                            aria-hidden="true"
                        />

                        <span className="text-[10px] font-medium leading-tight text-muted-foreground sm:text-badge">
                            Fast dispatch
                        </span>
                    </div>
                </div>

                <p className="mt-4 text-center text-caption text-muted-foreground">
                    Secure payment powered by Razorpay
                </p>
            </div>
        </motion.aside>
    );
}