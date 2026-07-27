"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import CartItem from "./CartItem";
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
                    <div key={i} className="h-[120px] animate-pulse rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900" />
                ))}
            </div>
        );
    }

    if (!items.length) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-20 dark:border-neutral-700 dark:bg-neutral-900"
            >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                    <ShoppingBag size={28} className="text-neutral-400" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Your cart is empty</h2>
                <p className="mt-1.5 max-w-xs text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Your collection is waiting. Start with one exceptional piece.
                </p>
                <Link
                    href="/shop"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                >
                    Continue Shopping
                </Link>
            </motion.div>
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
