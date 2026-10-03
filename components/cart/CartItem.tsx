
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { CartProduct } from "@/lib/services/cartProducts";
import ConfirmPopover from "@/components/ui/ConfirmPopover";
import { Button } from "@/components/ui/button";

interface CartItemProps {
    item: CartProduct;
    onIncrease: (cartId: string) => void | Promise<void>;
    onDecrease: (cartId: string, quantity: number) => void | Promise<void>;
    onRemove: (cartId: string) => void | Promise<void>;
}

export default function CartItem({ item, onRemove }: CartItemProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [removing, setRemoving] = useState(false);

    const retailPrice =
        item.retailPrice && item.retailPrice > item.price
            ? item.retailPrice
            : undefined;

    const handleRemove = async () => {
        if (removing) return;

        setRemoving(true);

        try {
            await onRemove(item.cartId);
            setDeleteOpen(false);
        } catch (error) {
            console.error("Cart item removal failed:", error);
            toast.error("Unable to remove this item. Please try again.");
        } finally {
            setRemoving(false);
        }
    };

    return (
        <>
            <motion.article
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-muted-foreground"
            >
                <div className="flex flex-col sm:flex-row sm:items-stretch">
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted sm:aspect-square sm:w-32 md:w-36">
                        <Image
                            src={item.primaryImage}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 144px"
                            className="object-cover"
                        />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="line-clamp-2 text-body font-semibold text-foreground">
                                    {item.title}
                                </h3>

                                <p className="mt-1 text-small text-muted-foreground">
                                    {item.brand}
                                    {item.size ? ` · Size ${item.size}` : ""}
                                </p>
                            </div>

                            <Button
                                type="button"
                                onClick={() => setDeleteOpen(true)}
                                variant="ghost"
                                size="iconMd"
                                rounded="lg"
                                disabled={removing}
                                className="shrink-0 border border-border text-muted-foreground transition hover:border-error hover:bg-error-bg hover:text-error"
                                aria-label={`Remove ${item.title} from cart`}
                            >
                                <Trash2 size={15} aria-hidden="true" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-small text-muted-foreground">
                            {item.condition && (
                                <span className="rounded-md bg-muted px-2 py-1">
                                    {item.condition}
                                </span>
                            )}

                            {retailPrice && (
                                <span>
                                    MRP{" "}
                                    <span className="line-through">
                                        ₹{retailPrice.toLocaleString("en-IN")}
                                    </span>
                                </span>
                            )}
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex flex-col">
                                <span className="text-body-lg font-bold text-foreground">
                                    ₹{item.price.toLocaleString("en-IN")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Quantity: 1
                                </span>
                            </div>

                            <span className="rounded-lg bg-muted px-3 py-2 text-small font-medium text-muted-foreground">
                                One-of-a-kind piece
                            </span>
                        </div>
                    </div>
                </div>
            </motion.article>

            <ConfirmPopover
                open={deleteOpen}
                title="Remove this item?"
                description="This unique piece will be removed from your cart. You can add it again if it is still available."
                confirmText={removing ? "Removing…" : "Remove"}
                cancelText="Keep"
                onCancel={() => {
                    if (!removing) setDeleteOpen(false);
                }}
                onConfirm={() => {
                    void handleRemove();
                }}
            />
        </>
    );
}