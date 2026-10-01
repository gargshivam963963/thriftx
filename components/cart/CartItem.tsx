
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

import type { CartProduct } from "@/lib/services/cartProducts";
import ConfirmPopover from "@/components/ui/ConfirmPopover";
import { Button } from "@/components/ui/button";

interface CartItemProps {
    item: CartProduct;
    onIncrease: (cartId: string) => void;
    onDecrease: (cartId: string, quantity: number) => void;
    onRemove: (cartId: string) => void;
}

export default function CartItem({
    item,
    onRemove,
}: CartItemProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);

    const retailPrice =
        item.retailPrice && item.retailPrice > item.price
            ? item.retailPrice
            : undefined;

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-muted-foreground hover:shadow-card"
            >
                <div className="flex flex-col md:flex-row md:items-stretch">
                    {/* Product image */}
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted md:aspect-auto md:w-[140px]">
                        <Image
                            src={item.primaryImage}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 140px"
                            className="object-cover transition-all duration-500 hover:scale-105"
                        />
                    </div>

                    {/* Product details */}
                    <div className="flex flex-1 flex-col gap-2 p-3.5 md:p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="line-clamp-2 text-body font-semibold text-foreground">
                                    {item.title}
                                </h3>

                                <p className="mt-0.5 text-small text-muted-foreground">
                                    {item.brand} &middot; Size {item.size}
                                </p>
                            </div>

                            <Button
                                type="button"
                                onClick={() => setDeleteOpen(true)}
                                variant="ghost"
                                size="iconMd"
                                rounded="lg"
                                className="shrink-0 border border-border text-muted-foreground transition hover:border-error hover:bg-error-bg hover:text-error"
                                aria-label="Remove item from cart"
                            >
                                <Trash2 size={13} />
                            </Button>
                        </div>

                        {/* Condition and retail price */}
                        <div className="flex flex-wrap items-center gap-2 text-small text-muted-foreground">
                            <span className="rounded-md bg-muted px-2 py-0.5">
                                {item.condition}
                            </span>

                            {retailPrice && (
                                <span>
                                    MRP{" "}
                                    <span className="line-through">
                                        ₹{retailPrice.toLocaleString("en-IN")}
                                    </span>
                                </span>
                            )}
                        </div>

                        {/* Price and unique-item label */}
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
                            <span className="text-body-lg font-bold text-foreground">
                                ₹{item.price.toLocaleString("en-IN")}
                            </span>

                            <span className="rounded-lg bg-muted px-3 py-2 text-small font-medium text-muted-foreground">
                                One-of-a-kind piece
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <ConfirmPopover
                open={deleteOpen}
                title="Remove this item?"
                description="This unique piece will be removed from your cart. You can add it again if it is still available."
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