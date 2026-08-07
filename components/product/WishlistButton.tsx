"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
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
        let active = true;

        async function load() {
            try {
                const state = await isWishlisted(productId);
                if (active) setWishlisted(state);
            } catch {
                // User may not be logged in
            } finally {
                if (active) setLoading(false);
            }
        }

        load();
        return () => {
            active = false;
        };
    }, [productId]);

    async function handleClick() {
        if (busy) return;
        setBusy(true);

        try {
            const state = await toggleWishlist(productId);
            setWishlisted(state);

            if (state) {
                trackWishlistAdd(productId, { productId });
                toast.success("Added to wishlist", { icon: "❤️" });
            } else {
                trackWishlistRemove(productId);
                toast.success("Removed from wishlist");
            }
        } catch {
            toast.error("Please sign in to wishlist");
        } finally {
            setBusy(false);
        }
    }

    return (
        <Button
            variant={wishlisted ? "primary" : "outline"}
            size="iconMd"
            loading={loading}
            aria-label="Toggle wishlist"
            aria-pressed={wishlisted}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleClick}
        >
            <motion.span
                key={wishlisted ? "filled" : "outline"}
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex items-center justify-center"
            >
                <Heart
                    className={`h-5 w-5 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : ""
                        }`}
                />
            </motion.span>
        </Button>
    );
}
