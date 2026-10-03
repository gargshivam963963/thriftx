
"use client";

import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import CartItem from "./CartItem";
import EmptyState from "@/components/ui/EmptyState";
import type { CartProduct } from "@/lib/services/cartProducts";

interface CartItemsProps {
    items: CartProduct[];
    loading: boolean;
    onIncrease: (cartId: string) => Promise<void>;
    onDecrease: (cartId: string, quantity: number) => Promise<void>;
    onRemove: (cartId: string) => Promise<void>;
}

const skeletons = [0, 1, 2];

export default function CartItems({
    items,
    loading,
    onIncrease,
    onDecrease,
    onRemove,
}: CartItemsProps) {
    if (loading) {
        return (
            <div
                className="space-y-3"
                role="status"
                aria-label="Loading cart items"
                aria-live="polite"
            >
                <span className="sr-only">Loading your cart items…</span>

                {skeletons.map((index) => (
                    <div
                        key={index}
                        className="flex min-h-[132px] gap-4 overflow-hidden rounded-xl border border-border bg-card p-3"
                    >
                        <div className="h-28 w-28 shrink-0 animate-pulse rounded-lg bg-muted sm:h-32 sm:w-32" />

                        <div className="flex min-w-0 flex-1 flex-col gap-3 py-2">
                            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                            <div className="mt-auto h-5 w-20 animate-pulse rounded bg-muted" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <EmptyState
                title="Your cart is empty"
                description="Your collection is waiting. Start with one exceptional piece."
            >
                <Link
                    href="/shop"
                    className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3 text-body-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    Continue Shopping
                </Link>
            </EmptyState>
        );
    }

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout">
                {items.map((item) => (
                    <CartItem
                        key={item.cartId}
                        item={item}
                        onIncrease={onIncrease}
                        onDecrease={onDecrease}
                        onRemove={onRemove}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}