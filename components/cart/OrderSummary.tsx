"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    TicketPercent,
    Truck,
    ShieldCheck,
    Sparkles,
    Zap,
    Clock,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getShippingRates } from "@/lib/shipping/api";
import type { ShippingRate } from "@/lib/shipping/types";
import { FALLBACK_SHIPPING_RATES, SHIPPING_DEFAULTS } from "@/lib/shipping/constants";

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

const FREE_SHIPPING_THRESHOLD = SHIPPING_DEFAULTS.freeShippingAmount;

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
    const [shippingMethod, setShippingMethod] = useState<string>("standard");
    const [shippingCost, setShippingCost] = useState(0);
    const [ratesLoading, setRatesLoading] = useState(false);
    const [ratesError, setRatesError] = useState("");

    // Shipping rates (attempt live, fallback to preset)
    const [availableRates, setAvailableRates] = useState<ShippingRate[]>([]);

    useEffect(() => {
        async function loadRates() {
            setRatesLoading(true);
            setRatesError("");
            try {
                const result = await getShippingRates("132103", SHIPPING_DEFAULTS.defaultWeight);
                if (result.rates && result.rates.length > 0) {
                    setAvailableRates(result.rates);
                } else {
                    // Use fallback rates
                    setAvailableRates([
                        {
                            courierId: "fallback_standard",
                            courierName: FALLBACK_SHIPPING_RATES.courier.standard.name,
                            method: "standard",
                            amount: FALLBACK_SHIPPING_RATES.courier.standard.price,
                            estimatedDays: 5,
                            codAvailable: true,
                            trackingAvailable: true,
                        },
                        {
                            courierId: "fallback_express",
                            courierName: FALLBACK_SHIPPING_RATES.courier.express.name,
                            method: "express",
                            amount: FALLBACK_SHIPPING_RATES.courier.express.price,
                            estimatedDays: 3,
                            codAvailable: true,
                            trackingAvailable: true,
                        },
                    ]);
                }
            } catch {
                // Fallback rates
                setAvailableRates([
                    {
                        courierId: "fallback_standard",
                        courierName: FALLBACK_SHIPPING_RATES.courier.standard.name,
                        method: "standard",
                        amount: FALLBACK_SHIPPING_RATES.courier.standard.price,
                        estimatedDays: 5,
                        codAvailable: true,
                        trackingAvailable: true,
                    },
                    {
                        courierId: "fallback_express",
                        courierName: FALLBACK_SHIPPING_RATES.courier.express.name,
                        method: "express",
                        amount: FALLBACK_SHIPPING_RATES.courier.express.price,
                        estimatedDays: 3,
                        codAvailable: true,
                        trackingAvailable: true,
                    },
                ]);
            } finally {
                setRatesLoading(false);
            }
        }
        loadRates();
    }, []);

    // Update shipping cost when method changes
    useEffect(() => {
        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
            setShippingCost(0);
            return;
        }
        const rate = availableRates.find((r) => r.method === shippingMethod);
        setShippingCost(rate?.amount ?? 0);
    }, [shippingMethod, availableRates, subtotal]);

    const finalTotal = total + shippingCost;
    const remainingForFree = FREE_SHIPPING_THRESHOLD - subtotal;
    const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

    function handleApplyCoupon() {
        const code = couponInput.trim().toUpperCase();
        if (!code) {
            setCouponError("Please enter a coupon code");
            return;
        }
        setCouponError("");
        onApplyCoupon(code);
    }

    function handleMethodSelect(method: string) {
        setShippingMethod(method);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
        >
            <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-caption font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Summary
                        </p>
                        <h2 className="mt-0.5 text-heading-4 font-bold text-foreground">
                            Order
                        </h2>
                    </div>
                    <span className="rounded-lg border border-border px-2.5 py-1 text-badge font-medium text-muted-foreground">
                        {itemCount} {itemCount === 1 ? "Item" : "Items"}
                    </span>
                </div>

                {/* Free shipping progress */}
                {remainingForFree > 0 && subtotal > 0 && (
                    <div className="mb-4 rounded-lg border border-warning-bg bg-warning-bg px-3 py-2.5">
                        <div className="flex items-center gap-2 text-small text-warning-foreground">
                            <Truck size={14} className="shrink-0" />
                            <span>
                                Add <strong>₹{remainingForFree.toLocaleString("en-IN")}</strong> more for{" "}
                                <strong>FREE shipping</strong>
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-warning">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                                className="h-full rounded-full bg-warning-foreground"
                            />
                        </div>
                    </div>
                )}
                {qualifiesForFreeShipping && subtotal > 0 && (
                    <div className="mb-4 rounded-lg border border-success-bg bg-success-bg px-3 py-2.5">
                        <div className="flex items-center gap-2 text-small font-semibold text-success-foreground">
                            <Truck size={14} className="shrink-0" />
                            <span>🎉 You qualify for FREE shipping!</span>
                        </div>
                    </div>
                )}

                {/* ── Shipping Method Selector ── */}
                {subtotal > 0 && (
                    <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2">
                            <Truck size={13} className="text-muted-foreground" />
                            <span className="text-badge font-semibold text-muted-foreground">Delivery Method</span>
                        </div>
                        {ratesLoading ? (
                            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-3 text-small text-muted-foreground">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-border border-t-foreground" />
                                Loading shipping rates...
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {availableRates.map((rate) => {
                                    const selected = shippingMethod === rate.method;
                                    const isFree = qualifiesForFreeShipping || rate.amount === 0;

                                    return (
                                        <Button
                                            key={rate.courierId}
                                            type="button"
                                            onClick={() => handleMethodSelect(rate.method)}
                                            className={`w-full rounded-lg border p-2.5 text-left transition-all ${selected
                                                ? "border-foreground bg-foreground text-background"
                                                : "border-border hover:border-muted-foreground"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`rounded-md p-1.5 ${selected
                                                            ? "bg-background/10 text-background"
                                                            : "bg-muted text-muted-foreground"
                                                            }`}
                                                    >
                                                        {rate.method === "express" ? <Zap size={12} /> : <Truck size={12} />}
                                                    </div>
                                                    <div>
                                                        <span className="text-small font-semibold">{rate.courierName}</span>
                                                        <div className="flex items-center gap-1.5 text-badge text-muted-foreground">
                                                            <Clock size={9} />
                                                            <span>{rate.estimatedDays} days</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`text-small font-bold ${isFree ? "text-success" : ""}`}>
                                                    {isFree ? "FREE" : `₹${rate.amount}`}
                                                </span>
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                        {ratesError && (
                            <p className="mt-1 text-badge text-error">{ratesError}</p>
                        )}
                    </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-2.5 text-body-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium text-foreground">
                            ₹{subtotal.toLocaleString("en-IN")}
                        </span>
                    </div>
                    {savings > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Savings</span>
                            <span className="font-semibold text-success">
                                −₹{savings.toLocaleString("en-IN")}
                            </span>
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Discount</span>
                            <span className="font-semibold text-success">
                                −₹{discount.toLocaleString("en-IN")}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-small font-medium text-muted-foreground">
                            {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                        </span>
                    </div>
                </div>

                <div className="my-4 h-px bg-border" />

                {/* Coupon */}
                <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                        <TicketPercent size={13} className="text-muted-foreground" />
                        <span className="text-badge font-semibold text-muted-foreground">
                            Have a coupon?
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <input
                            value={couponInput}
                            onChange={(e) => {
                                setCouponInput(e.target.value.toUpperCase());
                                setCouponError("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleApplyCoupon();
                            }}
                            placeholder="Enter code"
                            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-small font-medium outline-none transition focus:border-foreground focus:ring-1 focus:ring-foreground placeholder:text-muted"
                        />
                        <Button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="rounded-lg bg-foreground px-4 py-2 text-small font-semibold text-background transition hover:bg-muted-foreground"
                        >
                            Apply
                        </Button>
                    </div>
                    {couponError && (
                        <p className="mt-1.5 text-badge font-medium text-error">{couponError}</p>
                    )}
                    {appliedCoupon && discount > 0 && (
                        <p className="mt-1.5 flex items-center gap-1 text-badge font-medium text-success">
                            <span>✓</span> {appliedCoupon} applied — ₹{discount.toLocaleString("en-IN")} off
                        </p>
                    )}
                </div>

                <div className="my-4 h-px bg-border" />

                {/* Total */}
                <div className="mb-5 flex items-end justify-between">
                    <div>
                        <p className="text-body-sm font-medium text-muted-foreground">You Pay</p>
                        <p className="text-badge text-muted-foreground">Inclusive of all taxes</p>
                    </div>
                    <span className="text-heading-3 font-bold tracking-tight text-foreground">
                        ₹{finalTotal.toLocaleString("en-IN")}
                    </span>
                </div>

                {/* Checkout button */}
                <Button
                    type="button"
                    onClick={onCheckout}
                    loading={paymentLoading}
                    fullWidth
                    size="lg"
                    rightIcon={<ArrowRight size={16} />}
                    className="h-12 rounded-xl text-body-sm font-bold shadow-card"
                >
                    Proceed to Checkout
                </Button>

                {/* Trust badges */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted py-2.5">
                        <ShieldCheck size={14} className="text-success" />
                        <span className="text-badge font-medium text-muted-foreground">Authenticated</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted py-2.5">
                        <Sparkles size={14} className="text-info" />
                        <span className="text-badge font-medium text-muted-foreground">Quality Checked</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted py-2.5">
                        <Truck size={14} className="text-warning" />
                        <span className="text-badge font-medium text-muted-foreground">Fast Dispatch</span>
                    </div>
                </div>

                <p className="mt-3 text-center text-badge text-muted-foreground">
                    Secure payment powered by Razorpay
                </p>
            </div>
        </motion.div>
    );
}

