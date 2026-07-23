"use client";

import { motion } from "framer-motion";
import {
    ChevronRight,
    Lock,
    Package,
    ShieldCheck,
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

export default function CheckoutOrderSummary({
    items,
    subtotal,
    shippingCost,
    total,
    paymentLoading,
    canPay,
    onPay,
}: CheckoutOrderSummaryProps) {
    return (
        <aside className="h-fit xl:sticky xl:top-24">
            <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm"
            >
                <div className="border-b border-neutral-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-neutral-400">
                                Order Summary
                            </p>
                            <h2 className="mt-2 font-serif text-2xl font-semibold">
                                {items.length}{" "}
                                {items.length === 1 ? "Item" : "Items"}
                            </h2>
                        </div>
                        <Package className="h-7 w-7 text-neutral-300" />
                    </div>
                </div>

                <div className="max-h-[320px] space-y-4 overflow-y-auto px-5 py-4">
                    {items.map((item) => (
                        <div
                            key={item.cartId}
                            className="flex items-center gap-3"
                        >
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
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
                                <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">
                                    {item.title}
                                </h3>
                                <p className="mt-1 text-xs text-neutral-500">
                                    Size {item.size}
                                </p>
                                <div className="mt-auto flex items-center justify-between pt-2">
                                    <span className="text-xs text-neutral-500">
                                        Qty {item.quantity}
                                    </span>
                                    <span className="text-sm font-bold">
                                        ₹
                                        {(
                                            item.price * item.quantity
                                        ).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-neutral-100 px-5 py-5">
                    <div className="space-y-3">
                        <Row
                            label="Subtotal"
                            value={`₹${subtotal.toLocaleString("en-IN")}`}
                        />
                        <Row
                            label="Shipping"
                            value={
                                shippingCost === 0
                                    ? "FREE"
                                    : `₹${shippingCost.toLocaleString("en-IN")}`
                            }
                            highlight={shippingCost === 0}
                        />
                        <div className="h-px bg-neutral-200" />
                        <div className="flex items-end justify-between">
                            <span className="text-sm text-neutral-500">
                                You Pay
                            </span>
                            <span className="font-serif text-3xl font-semibold tracking-tight">
                                ₹{total.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={onPay}
                        loading={paymentLoading}
                        disabled={!canPay}
                        fullWidth
                        size="lg"
                        leftIcon={<Lock className="h-5 w-5" />}
                        rightIcon={<ChevronRight className="h-5 w-5" />}
                        className="mt-6 h-14 rounded-2xl text-base"
                    >
                        Pay Securely
                    </Button>

                    {!canPay && (
                        <p className="mt-3 text-center text-xs text-amber-600">
                            Complete address and shipping to continue
                        </p>
                    )}

                    <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                        <div className="flex gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            <div>
                                <h4 className="text-sm font-semibold text-neutral-900">
                                    Purchase Protection
                                </h4>
                                <p className="mt-1 text-xs leading-5 text-neutral-500">
                                    Every order is quality checked and securely
                                    packed before dispatch.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </aside>
    );
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
            <span className="text-neutral-500">{label}</span>
            <span
                className={
                    highlight
                        ? "font-semibold text-emerald-600"
                        : "font-medium text-neutral-900"
                }
            >
                {value}
            </span>
        </div>
    );
}
