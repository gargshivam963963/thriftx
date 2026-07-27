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
            className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white dark:border-neutral-700/50 dark:bg-neutral-900"
        >
            <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                            Summary
                        </p>
                        <h2 className="mt-0.5 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            Order
                        </h2>
                    </div>
                    <span className="rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                        {itemCount} {itemCount === 1 ? "Item" : "Items"}
                    </span>
                </div>

                {/* Free shipping progress */}
                {remainingForFree > 0 && subtotal > 0 && (
                    <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2.5 dark:border-amber-800/30 dark:bg-amber-950/10">
                        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                            <Truck size={14} className="shrink-0" />
                            <span>
                                Add <strong>₹{remainingForFree.toLocaleString("en-IN")}</strong> more for{" "}
                                <strong>FREE shipping</strong>
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-800/30">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                                className="h-full rounded-full bg-amber-500"
                            />
                        </div>
                    </div>
                )}
                {qualifiesForFreeShipping && subtotal > 0 && (
                    <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/80 px-3 py-2.5 dark:border-emerald-800/30 dark:bg-emerald-950/10">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            <Truck size={14} className="shrink-0" />
                            <span>🎉 You qualify for FREE shipping!</span>
                        </div>
                    </div>
                )}

                {/* ── Shipping Method Selector ── */}
                {subtotal > 0 && (
                    <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2">
                            <Truck size={13} className="text-neutral-400" />
                            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">Delivery Method</span>
                        </div>
                        {ratesLoading ? (
                            <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-3 text-xs text-neutral-400 dark:bg-neutral-800">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
                                Loading shipping rates...
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {availableRates.map((rate) => {
                                    const selected = shippingMethod === rate.method;
                                    const isFree = qualifiesForFreeShipping || rate.amount === 0;

                                    return (
                                        <button
                                            key={rate.courierId}
                                            type="button"
                                            onClick={() => handleMethodSelect(rate.method)}
                                            className={`w-full rounded-lg border p-2.5 text-left transition-all ${selected
                                                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                                                    : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`rounded-md p-1.5 ${selected
                                                                ? "bg-white/10 text-white dark:bg-neutral-900/10 dark:text-neutral-900"
                                                                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                                            }`}
                                                    >
                                                        {rate.method === "express" ? <Zap size={12} /> : <Truck size={12} />}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-semibold">{rate.courierName}</span>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                                                            <Clock size={9} />
                                                            <span>{rate.estimatedDays} days</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold ${isFree ? "text-emerald-500" : ""}`}>
                                                    {isFree ? "FREE" : `₹${rate.amount}`}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {ratesError && (
                            <p className="mt-1 text-[10px] text-red-500">{ratesError}</p>
                        )}
                    </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            ₹{subtotal.toLocaleString("en-IN")}
                        </span>
                    </div>
                    {savings > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-500 dark:text-neutral-400">Savings</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                −₹{savings.toLocaleString("en-IN")}
                            </span>
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-500 dark:text-neutral-400">Discount</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                −₹{discount.toLocaleString("en-IN")}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500 dark:text-neutral-400">Shipping</span>
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                        </span>
                    </div>
                </div>

                <div className="my-4 h-px bg-neutral-200 dark:bg-neutral-700" />

                {/* Coupon */}
                <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                        <TicketPercent size={13} className="text-neutral-400" />
                        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
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
                            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:border-neutral-500 placeholder-neutral-400"
                        />
                        <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                        >
                            Apply
                        </button>
                    </div>
                    {couponError && (
                        <p className="mt-1.5 text-[11px] font-medium text-red-500">{couponError}</p>
                    )}
                    {appliedCoupon && discount > 0 && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <span>✓</span> {appliedCoupon} applied — ₹{discount.toLocaleString("en-IN")} off
                        </p>
                    )}
                </div>

                <div className="my-4 h-px bg-neutral-200 dark:bg-neutral-700" />

                {/* Total */}
                <div className="mb-5 flex items-end justify-between">
                    <div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">You Pay</p>
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Inclusive of all taxes</p>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
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
                    className="h-12 rounded-xl text-sm font-bold shadow-sm"
                >
                    Proceed to Checkout
                </Button>

                {/* Trust badges */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center gap-1 rounded-lg bg-neutral-50 py-2.5 dark:bg-neutral-800/50">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[9px] font-medium text-neutral-500 dark:text-neutral-400">Authenticated</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-lg bg-neutral-50 py-2.5 dark:bg-neutral-800/50">
                        <Sparkles size={14} className="text-blue-500" />
                        <span className="text-[9px] font-medium text-neutral-500 dark:text-neutral-400">Quality Checked</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-lg bg-neutral-50 py-2.5 dark:bg-neutral-800/50">
                        <Truck size={14} className="text-violet-500" />
                        <span className="text-[9px] font-medium text-neutral-500 dark:text-neutral-400">Fast Dispatch</span>
                    </div>
                </div>

                <p className="mt-3 text-center text-[10px] text-neutral-400 dark:text-neutral-500">
                    Secure payment powered by Razorpay
                </p>
            </div>
        </motion.div>
    );
}

