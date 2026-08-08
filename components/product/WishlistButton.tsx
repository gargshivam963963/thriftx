"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    isWishlisted,
    toggleWishlist,
} from "@/lib/services/wishlist";
import { useAnalytics } from "@/lib/analytics/AnalyticsContext";

interface Props {
    productId: string;
}

export default function WishlistButton({ productId }: Props) {
    const [wishlisted, setWishlisted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const { trackWishlistAdd, trackWishlistRemove } = useAnalytics();

    useEffect(() => {
        async function load() {
            try {
                setWishlisted(await isWishlisted(productId));
            } catch {
                // User may not be logged in
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [productId]);

    const handleClick = useCallback(async () => {
        if (busy) return;
        setBusy(true);
        // Optimistic toggle for instant UI feedback
        const next = !wishlisted;
        setWishlisted(next);

        try {
            const state = await toggleWishlist(productId);
            setWishlisted(state);

            if (state) {
                trackWishlistAdd(productId, { productId });
                toast.success("Added to wishlist");
            } else {
                trackWishlistRemove(productId);
                toast.success("Removed from wishlist");
            }
        } catch {
            // Revert optimistic state on failure
            setWishlisted(!next);
            toast.error("Please sign in to wishlist");
        } finally {
            setBusy(false);
        }
    }, [busy, wishlisted, productId, trackWishlistAdd, trackWishlistRemove]);

    return (
        <Button
            variant="outline"
            size="iconMd"
            loading={loading}
            disabled={busy}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleClick}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={wishlisted ? "on" : "off"}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex items-center justify-center"
                >
                    <Heart
                        className={`h-5 w-5 transition-colors ${wishlisted
                                ? "fill-red-500 text-red-500"
                                : "text-foreground"
                            }`}
                    />
                </motion.span>
            </AnimatePresence>
        </Button>
    );
}
