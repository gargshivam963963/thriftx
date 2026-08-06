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

const skeletons = Array.from({ length: 3 });

export default function CartItems({ items, loading, onIncrease, onDecrease, onRemove }: CartItemsProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {skeletons.map((_, i) => (
                    <div key={i} className="h-[120px] animate-pulse rounded-xl border border-border bg-card" />
                ))}
            </div>
        );
    }

    if (!items.length) {
        return (
            <EmptyState
                title="Your cart is empty"
                description="Your collection is waiting. Start with one exceptional piece."
            >
                <Link
                    href="/shop"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-body-sm font-semibold text-background transition hover:bg-muted-foreground"
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
