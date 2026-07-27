"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { CartProduct } from "@/lib/services/cartProducts";
import ConfirmPopover from "@/components/ui/ConfirmPopover";
import { isWishlisted, toggleWishlist } from "@/lib/services/wishlist";

interface CartItemProps {
    item: CartProduct;
    onIncrease: (cartId: string) => void;
    onDecrease: (cartId: string, quantity: number) => void;
    onRemove: (cartId: string) => void;
}

export default function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        isWishlisted(item.id).then(setWishlisted).catch(() => { });
    }, [item.id]);

    const handleWishlistToggle = async () => {
        setWishlistLoading(true);
        try {
            const state = await toggleWishlist(item.id);
            setWishlisted(state);
            toast.success(state ? "Added to wishlist ❤️" : "Removed from wishlist");
        } catch {
            toast.error("Please sign in to wishlist");
        } finally {
            setWishlistLoading(false);
        }
    };

    const retailPrice = item.retailPrice && item.retailPrice > item.price ? item.retailPrice : undefined;

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-200 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-500"
            >
                <div className="flex flex-col md:flex-row md:items-stretch">
                    {/* Image */}
                    <div className="relative aspect-[4/3] w-full md:aspect-auto md:w-[140px] shrink-0 overflow-hidden bg-neutral-50 dark:bg-neutral-800">
                        <Image
                            src={item.primaryImage}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 140px"
                            className="object-cover transition-all duration-500 hover:scale-105"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-2 p-3.5 md:p-4">
                        {/* Top row: title + actions */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                    {item.brand} &middot; Size {item.size}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleWishlistToggle}
                                    disabled={wishlistLoading}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-neutral-600 dark:hover:border-red-500 dark:hover:bg-red-950/20"
                                >
                                    <Heart
                                        size={13}
                                        className={`transition-all duration-200 ${wishlisted ? "fill-red-500 text-red-500" : ""
                                            }`}
                                    />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeleteOpen(true)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-neutral-600 dark:hover:border-red-500 dark:hover:bg-red-950/20"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="rounded-md bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">{item.condition}</span>
                            {retailPrice && (
                                <span className="text-neutral-400">
                                    MRP <span className="line-through">₹{retailPrice.toLocaleString("en-IN")}</span>
                                </span>
                            )}
                        </div>

                        {/* Bottom row: price + quantity */}
                        <div className="mt-auto flex items-center justify-between pt-1">
                            <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                ₹{item.price.toLocaleString("en-IN")}
                            </span>

                            <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-600 dark:bg-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => onDecrease(item.cartId, item.quantity)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-white dark:hover:bg-neutral-700 active:scale-90"
                                >
                                    <Minus size={13} />
                                </button>
                                <span className="min-w-[32px] text-center text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                    {item.quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onIncrease(item.cartId)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-white dark:hover:bg-neutral-700 active:scale-90"
                                >
                                    <Plus size={13} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <ConfirmPopover
                open={deleteOpen}
                title="Remove this item?"
                description="This item will be removed from your cart. You can add it again later if still available."
                confirmText="Remove"
                cancelText="Keep"
                onCancel={() => setDeleteOpen(false)}
                onConfirm={() => {
                    setDeleteOpen(false);
                    onRemove(item.cartId);
                }}
            />
        </>
    );
}

