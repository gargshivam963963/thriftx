
"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
    getWishlistedProductIds,
    toggleWishlist,
} from "@/lib/services/wishlist";

import { useAnalytics } from "@/lib/analytics/AnalyticsContext";

interface Props {
    productId: string;
}

export default function WishlistButton({ productId }: Props) {
    const [wishlisted, setWishlisted] = useState(false);
    const [busy, setBusy] = useState(false);

    const { trackWishlistAdd, trackWishlistRemove } = useAnalytics();

    useEffect(() => {
        let cancelled = false;

        async function loadWishlistState() {
            try {
                const productIds = await getWishlistedProductIds();

                if (!cancelled) {
                    setWishlisted(productIds.includes(productId));
                }
            } catch (error) {
                console.error(
                    "[WishlistButton] Failed to load wishlist:",
                    error
                );
            }
        }

        loadWishlistState();

        return () => {
            cancelled = true;
        };
    }, [productId]);

    const handleToggle = useCallback(async () => {
        if (busy) return;

        setBusy(true);

        const previousState = wishlisted;
        const nextState = !previousState;

        setWishlisted(nextState);

        try {
            const state = await toggleWishlist(productId);

            setWishlisted(state);

            if (state) {
                trackWishlistAdd(productId, { productId });
                toast.success("Added to wishlist ❤️");
            } else {
                trackWishlistRemove(productId);
                toast.success("Removed from wishlist");
            }
        } catch (error) {
            setWishlisted(previousState);

            console.error(
                "[WishlistButton] Wishlist update failed:",
                error
            );

            toast.error("Please sign in to wishlist");
        } finally {
            setBusy(false);
        }
    }, [
        busy,
        wishlisted,
        productId,
        trackWishlistAdd,
        trackWishlistRemove,
    ]);

    return (
        <motion.button
            type="button"
            onClick={handleToggle}
            disabled={busy}
            aria-label={
                wishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            aria-pressed={wishlisted}
            title={
                wishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 22,
            }}
            className="
        group relative
        flex h-12 w-12 shrink-0
        items-center justify-center
        rounded-full
        border border-border/60
        bg-background
        shadow-sm
        transition-all duration-200
        hover:shadow-md
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-rose-500
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-70
      "
        >
            {busy ? (
                <Loader2
                    className="h-5 w-5 animate-spin text-muted-foreground"
                    aria-hidden="true"
                />
            ) : (
                <Heart
                    className={`
            h-6 w-6
            transition-all duration-200
            ${wishlisted
                            ? "fill-red-500 text-red-500"
                            : "fill-transparent text-foreground group-hover:text-red-500"
                        }
          `}
                    fill={wishlisted ? "currentColor" : "none"}
                    strokeWidth={2}
                    aria-hidden="true"
                />
            )}
        </motion.button>
    );
}