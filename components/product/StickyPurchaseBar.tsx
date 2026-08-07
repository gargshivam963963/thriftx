"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

interface StickyPurchaseBarProps {
    price: number;
    addToCartLoading: boolean;
    buyNowLoading: boolean;
    onAddToCart: () => void;
    onBuyNow: () => void;
}

/**
 * StickyPurchaseBar — mobile sticky bottom purchase panel.
 * Shows price, Add to Cart, and Buy Now. Fixed to bottom on small screens.
 */
export default function StickyPurchaseBar({
    price,
    addToCartLoading,
    buyNowLoading,
    onAddToCart,
    onBuyNow,
}: StickyPurchaseBarProps) {
    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-fixed border-t border-border bg-card/95 px-4 py-3 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:hidden"
        >
            <div className="mx-auto flex w-full max-w-[1280px] items-center gap-3">
                <div className="shrink-0">
                    <p className="text-caption text-muted-foreground">Price</p>
                    <p className="text-body font-bold text-foreground">
                        ₹{price.toLocaleString("en-IN")}
                    </p>
                </div>

                <div className="ml-auto flex flex-1 gap-2">
                    <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        loading={addToCartLoading}
                        loadingText="Adding..."
                        onClick={onAddToCart}
                    >
                        <ShoppingBag />
                        Add
                    </Button>
                    <Button
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        loading={buyNowLoading}
                        loadingText="Processing..."
                        onClick={onBuyNow}
                    >
                        <Zap />
                        Buy Now
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
