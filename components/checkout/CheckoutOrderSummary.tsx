"use client";

import { motion } from "framer-motion";
import {
    ChevronRight,
    Lock,
    ShieldCheck,
    ShoppingBag,
    Tag,
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

interface RowProps {
    label: string;
    value: string;
    highlight?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
    if (!Number.isFinite(value)) {
        return "—";
    }

    return `₹${currencyFormatter.format(value)}`;
}

function Row({ label, value, highlight = false }: RowProps) {
    return (
        <div className="flex items-center justify-between gap-4 text-sm">
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
        <aside
            aria-label="Order summary"
            className="h-fit xl:sticky xl:top-24"
        >
            <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:rounded-[28px]"
            >
                {/* Summary heading */}
                <div className="border-b border-border p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Order Summary
                            </p>

                            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                {items.length}{" "}
                                {items.length === 1 ? "Item" : "Items"}
                            </h2>
                        </div>

                        <div
                            aria-hidden="true"
                            className="rounded-full bg-muted p-2.5 sm:p-3"
                        >
                            <ShoppingBag className="h-[18px] w-[18px] text-muted-foreground sm:h-[22px] sm:w-[22px]" />
                        </div>
                    </div>
                </div>

                {/* Cart items */}
                <div
                    aria-label="Items in your order"
                    className="max-h-[300px] space-y-2.5 overflow-y-auto px-4 py-4 sm:max-h-[320px] sm:space-y-3 sm:px-6"
                >
                    {items.map((item, index) => (
                        <motion.div
                            key={item.cartId}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                                delay: Math.min(index * 0.04, 0.2),
                                duration: 0.2,
                            }}
                            className="flex min-w-0 items-center gap-3 rounded-xl bg-subtle p-2.5 transition-colors hover:bg-muted sm:rounded-2xl sm:p-3"
                        >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-16 sm:w-16 sm:rounded-xl">
                                <PremiumImage
                                    src={item.primaryImage}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 640px) 56px, 64px"
                                    className="object-cover"
                                    rounded
                                />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col">
                                <h3
                                    title={item.title}
                                    className="line-clamp-2 break-words text-xs font-semibold leading-5 text-foreground sm:text-sm"
                                >
                                    {item.title}
                                </h3>

                                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground sm:text-xs">
                                    <span>Size {item.size}</span>
                                    <span aria-hidden="true">•</span>
                                    <span>Qty {item.quantity}</span>
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-muted-foreground sm:text-xs">
                                        Item total
                                    </span>

                                    <span className="text-sm font-bold text-foreground sm:text-base">
                                        {formatCurrency(
                                            item.price * item.quantity
                                        )}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Price breakdown */}
                <div className="border-t border-border px-4 py-4 sm:px-6 sm:py-5">
                    <div className="space-y-3">
                        <Row
                            label="Subtotal"
                            value={formatCurrency(subtotal)}
                        />

                        <Row
                            label="Shipping"
                            value={
                                isFreeShipping
                                    ? "FREE"
                                    : formatCurrency(shippingCost)
                            }
                            highlight={isFreeShipping}
                        />

                        {/* Coupon information */}
                        <div className="flex items-center gap-2 rounded-xl bg-subtle px-3 py-2.5">
                            <Tag
                                aria-hidden="true"
                                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                            />

                            <span className="text-xs text-muted-foreground">
                                Have a coupon? Apply it in your cart.
                            </span>
                        </div>

                        <div
                            aria-hidden="true"
                            className="h-px bg-border"
                        />

                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <span className="text-sm text-muted-foreground">
                                    You Pay
                                </span>

                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Inclusive of applicable taxes
                                </p>
                            </div>

                            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>

                    {/* Desktop payment action */}
                    <div className="hidden xl:block">
                        <Button
                            type="button"
                            onClick={onPay}
                            loading={paymentLoading}
                            disabled={!canPay || paymentLoading}
                            fullWidth
                            size="lg"
                            leftIcon={<Lock className="h-5 w-5" />}
                            rightIcon={
                                <ChevronRight className="h-5 w-5" />
                            }
                            className="mt-5 h-14 rounded-2xl text-base shadow-lg shadow-foreground/10 sm:mt-6"
                        >
                            Pay Securely
                        </Button>

                        {!canPay && (
                            <p
                                role="status"
                                className="mt-3 text-center text-xs text-amber-600"
                            >
                                Complete your address and shipping selection
                                to continue.
                            </p>
                        )}
                    </div>

                    {/* Purchase protection */}
                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 sm:mt-5 sm:rounded-2xl sm:p-4">
                        <div className="flex items-start gap-3">
                            <ShieldCheck
                                aria-hidden="true"
                                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                            />

                            <div>
                                <h4 className="text-sm font-semibold text-foreground">
                                    Purchase Protection
                                </h4>

                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
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