"use client";

import { motion } from "framer-motion";
import {
    ChevronRight,
    Lock,
    Package,
    ShieldCheck,
    ShoppingBag,
    Tag,
    Sparkles,
} from "lucide-react";

import PremiumImage from "@/components/ui/PremiumImage";
import { Button } from "@/components/ui/button";
import type { CartProduct } from "@/lib/services/cartProducts";

interface CheckoutOrderSummaryProps {
    items: CartProduct[];
    subtotal: number;
    shippingCost: number;
    total: number;
    paymentLoading: boolean;
    canPay: boolean;
    onPay: () => void;
}

function Row({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span
                className={
                    highlight
                        ? "font-semibold text-emerald-600"
                        : "font-medium text-foreground"
                }
            >
                {value}
            </span>
        </div>
    );
}

export default function CheckoutOrderSummary({
    items,
    subtotal,
    shippingCost,
    total,
    paymentLoading,
    canPay,
    onPay,
}: CheckoutOrderSummaryProps) {
    const isFreeShipping = shippingCost === 0;

    return (
        <aside className="h-fit xl:sticky xl:top-24">
            <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm sm:rounded-[28px]"
            >
                {/* Header */}
                <div className="border-b border-border p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                                Order Summary
                            </p>
                            <h2 className="mt-1 font-bold text-lg font-semibold tracking-tight sm:mt-1.5 sm:text-xl sm:text-2xl">
                                {items.length}{" "}
                                {items.length === 1 ? "Item" : "Items"}
                            </h2>
                        </div>
                        <div className="rounded-full bg-muted p-2.5 sm:p-3">
                            <ShoppingBag
                                size={18}
                                className="text-muted-foreground sm:h-[22px] sm:w-[22px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="max-h-[300px] space-y-2.5 overflow-y-auto px-4 py-4 sm:max-h-[320px] sm:space-y-3 sm:px-6">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.cartId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * index }}
                            className="flex items-center gap-3 rounded-xl bg-subtle p-2.5 transition hover:bg-muted sm:rounded-2xl sm:p-3"
                        >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-16 sm:w-16 sm:rounded-xl">
                                <PremiumImage
                                    src={item.primaryImage}
                                    alt={item.title}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                    rounded
                                />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col">
                                <h3 className="line-clamp-1 text-xs font-semibold text-foreground sm:text-sm">
                                    {item.title}
                                </h3>
                                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
                                    <span>Size {item.size}</span>
                                    <span>•</span>
                                    <span>Qty {item.quantity}</span>
                                </div>
                                <div className="mt-1.5 flex items-center justify-between">
                                    <span className="text-[11px] text-muted-foreground sm:text-xs">
                                        Price
                                    </span>
                                    <span className="text-xs font-bold text-foreground sm:text-sm sm:text-base">
                                        ₹
                                        {(
                                            item.price * item.quantity
                                        ).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-border px-4 py-4 sm:px-6 sm:py-5">
                    <div className="space-y-2.5 sm:space-y-3">
                        <Row
                            label="Subtotal"
                            value={`₹${subtotal.toLocaleString("en-IN")}`}
                        />
                        <Row
                            label="Shipping"
                            value={
                                isFreeShipping
                                    ? "FREE"
                                    : `₹${shippingCost.toLocaleString("en-IN")}`
                            }
                            highlight={isFreeShipping}
                        />

                        {/* Coupon hint */}
                        <motion.div
                            whileHover={{ y: -1 }}
                            className="flex items-center gap-2 rounded-xl bg-subtle px-3 py-2.5"
                        >
                            <Tag size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                                Have a coupon? Apply at cart
                            </span>
                        </motion.div>

                        <div className="h-px bg-muted" />

                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-sm text-muted-foreground">You Pay</span>
                                <p className="text-[10px] text-muted-foreground">
                                    Inclusive of all taxes
                                </p>
                            </div>
                            <span className="font-bold text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                ₹{total.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    {/* Desktop Pay Button */}
                    <div className="hidden xl:block">
                        <Button
                            type="button"
                            onClick={onPay}
                            loading={paymentLoading}
                            disabled={!canPay}
                            fullWidth
                            size="lg"
                            leftIcon={<Lock className="h-5 w-5" />}
                            rightIcon={<ChevronRight className="h-5 w-5" />}
                            className="mt-5 h-14 rounded-2xl text-base shadow-lg shadow-foreground/20 sm:mt-6"
                        >
                            Pay Securely
                        </Button>

                        {!canPay && (
                            <p className="mt-3 text-center text-xs text-amber-600">
                                Complete address and shipping to continue
                            </p>
                        )}
                    </div>

                    {/* Purchase Protection */}
                    <motion.div
                        whileHover={{ y: -1 }}
                        className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 sm:mt-5 sm:rounded-2xl sm:p-4"
                    >
                        <div className="flex gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            <div>
                                <h4 className="text-sm font-semibold text-foreground">
                                    Purchase Protection
                                </h4>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Every order is quality checked and securely packed before
                                    dispatch.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </aside>
    );
}

