'use client';

import { AnimatePresence, motion } from 'framer-motion';
import CartItem from './CartItem';
import type { CartProduct } from '@/lib/services/cartProducts';

interface CartItemsProps {
    items: CartProduct[];
    loading: boolean;
    onIncrease: (cartId: string) => Promise<void>;
    onDecrease: (
        cartId: string,
        quantity: number
    ) => Promise<void>;
    onRemove: (cartId: string) => Promise<void>;
}

const skeletons = Array.from({ length: 3 });

export default function CartItems({
    items,
    loading,
    onIncrease,
    onDecrease,
    onRemove,
}: CartItemsProps) {
    if (loading) {
        return (
            <section className="space-y-8">
                <div className="space-y-4">
                    {skeletons.map((_, index) => (
                        <div
                            key={index}
                            className="h-[170px] animate-pulse rounded-[30px] border border-neutral-200 bg-white"
                        />
                    ))}
                </div>
            </section>
        );
    }

    if (!items.length) {
        return (
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white"
            >
                <div className="px-8 py-14 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-neutral-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 3h2l.4 2m0 0L7 13h10l2-8H5.4M7 13l-1.2 6h12.4M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                            />
                        </svg>
                    </div>

                    <h2 className="mt-8 font-serif text-3xlfont-serif text-4xl font-semibold text-black">
                        Your cart is empty
                    </h2>

                    <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-neutral-500">
                        Your collection is waiting.
                        Start with one exceptional piece.
                    </p>

                    <a
                        href="/shop"
                        className="mt-10 inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:opacity-90"
                    >
                        Continue Shopping
                    </a>
                </div>
            </motion.section>
        );
    }

    return (
        <section>

            <AnimatePresence mode="popLayout">

                <div className="space-y-4">

                    {items.map((item) => (

                        <CartItem
                            key={item.cartId}
                            item={item}
                            onIncrease={onIncrease}
                            onDecrease={onDecrease}
                            onRemove={onRemove}
                        />

                    ))}

                </div>

            </AnimatePresence>

        </section>
    );
}