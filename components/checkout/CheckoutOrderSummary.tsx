"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
    ChevronRight,
    ShieldCheck,
    ShoppingBag,
    Tag,
} from "lucide-react";

import PremiumImage from "@/components/ui/PremiumImage";
import type { CartProduct } from "@/lib/services/cartProducts";

interface CheckoutOrderSummaryProps {
    items: CartProduct[];
    subtotal: number;
    shippingCost: number;
    total: number;
    discount?: number;
    discountReason?: string;
    pricingLoading?: boolean;
    canPay: boolean;
    className?: string;
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
        <div className="flex items-center justify-between gap-4 text-body-sm">
            <span className="text-muted-foreground">{label}</span>

            <span
                className={
                    highlight
                        ? "font-semibold text-success-foreground"
                        : "font-medium tabular-nums text-foreground"
                }
            >
                {value}
            </span>
        </div>
    );
}

function ItemList({ items }: { items: CartProduct[] }) {
    return (
        <div
            aria-label="Items in your order"
            className="max-h-72 space-y-2.5 overflow-y-auto overscroll-contain px-4 py-4 sm:max-h-80 sm:px-5"
        >
            {items.map((item) => (
                <motion.div
                    key={item.cartId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex min-w-0 items-center gap-3"
                >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-16">
                        <PremiumImage
                            src={item.primaryImage}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 56px, 64px"
                            className="object-cover"
                            rounded
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3
                            title={item.title}
                            className="line-clamp-2 break-words text-small font-semibold leading-snug text-foreground"
                        >
                            {item.title}
                        </h3>

                        <p className="mt-0.5 text-small text-muted-foreground">
                            Size {item.size} · Qty {item.quantity}
                        </p>
                    </div>

                    <span className="shrink-0 text-small font-semibold tabular-nums text-foreground">
                        {formatCurrency(item.price * item.quantity)}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}
/**
 * CheckoutOrderSummary — order contents + price breakdown.
 *
 * Deliberately holds NO pay button. The single "Place order" CTA lives in the
 * sticky mobile bar and in the desktop panel, so there is exactly one action
 * per breakpoint instead of the previous three competing CTAs.
 */
export default function CheckoutOrderSummary({
    items,
    subtotal,
    shippingCost,
    total,
    discount = 0,
    discountReason = "",
    pricingLoading = false,
    canPay,
    className,
}: CheckoutOrderSummaryProps) {
    const reduceMotion = useReducedMotion();

    const isFreeShipping = shippingCost === 0;

    const totalLabel =
        pricingLoading || !canPay ? "—" : formatCurrency(total);

    const priceRows = (
        <div className="space-y-2.5">
            <Row label="Subtotal" value={formatCurrency(subtotal)} />

            <Row
                label="Delivery"
                value={
                    isFreeShipping
                        ? "FREE"
                        : formatCurrency(shippingCost)
                }
                highlight={isFreeShipping}
            />

            {discount > 0 && (
                <Row
                    label={discountReason || "Promotion"}
                    value={`−${formatCurrency(discount)}`}
                    highlight
                />
            )}
        </div>
    );

    return (
        <aside aria-label="Order summary" className={className}>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:rounded-3xl">
                {/* ── Mobile: collapsible ────────────────────────── */}
                <details className="group lg:hidden">
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                        <span
                            aria-hidden="true"
                            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                        >
                            <ShoppingBag className="size-5" />
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block text-label font-semibold text-foreground">
                                Order summary
                            </span>

                            <span className="mt-0.5 block truncate text-small text-muted-foreground">
                                {items.length}{" "}
                                {items.length === 1 ? "item" : "items"}
                            </span>
                        </span>

                        <span className="shrink-0 text-price text-foreground">
                            {totalLabel}
                        </span>

                        <ChevronRight
                            aria-hidden="true"
                            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90"
                        />
                    </summary>

                    <div className="border-t border-border">
                        <ItemList items={items} />

                        <div className="border-t border-border px-4 py-4">
                            {priceRows}
                        </div>
                    </div>
                </details>

                {/* ── Desktop ────────────────────────────────────── */}
                <div className="hidden lg:block">
                    <div className="flex items-center justify-between gap-3 border-b border-border p-5">
                        <div>
                            <p className="text-caption text-muted-foreground">
                                Order summary
                            </p>

                            <h2 className="mt-1 text-h4 font-bold text-foreground">
                                {items.length}{" "}
                                {items.length === 1 ? "item" : "items"}
                            </h2>
                        </div>

                        <span
                            aria-hidden="true"
                            className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                        >
                            <ShoppingBag className="size-5" />
                        </span>
                    </div>

                    <ItemList items={items} />

                    <div className="space-y-4 border-t border-border p-5">
                        {priceRows}

                        {discount === 0 && (
                            <div className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
                                <Tag
                                    aria-hidden="true"
                                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                                />

                                <p className="text-small text-muted-foreground">
                                    {pricingLoading
                                        ? "Confirming your total…"
                                        : "Have a coupon? Apply it from your cart."}
                                </p>
                            </div>
                        )}

                        <div
                            aria-hidden="true"
                            className="h-px bg-border"
                        />

                        <div className="flex items-end justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-body-sm font-semibold text-foreground">
                                    Total payable
                                </p>

                                <p className="mt-0.5 text-small text-muted-foreground">
                                    Inclusive of all taxes
                                </p>
                            </div>

                            <span className="shrink-0 text-h4 font-bold tabular-nums text-foreground">
                                {totalLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <motion.p
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-3 flex items-start gap-2 px-1 text-small text-muted-foreground"
            >
                <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-success"
                />

                <span>
                    Every order is quality checked and securely packed
                    before dispatch.
                </span>
            </motion.p>
        </aside>
    );
}