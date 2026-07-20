"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    isWishlisted,
    toggleWishlist,
} from "@/lib/services/wishlist";

interface Props {
    productId: string;
}

export default function WishlistButton({
    productId,
}: Props) {
    const [wishlisted, setWishlisted] = useState(false);
    const [loading, setLoading] = useState(true);

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

    async function handleClick() {
        try {
            const state = await toggleWishlist(productId);

            setWishlisted(state);

            toast.success(
                state
                    ? "Added to wishlist"
                    : "Removed from wishlist"
            );
        } catch (error) {
            console.error(error);

            toast.error("Something went wrong.");
        }
    }

    return (
        <Button
            variant="outline"
            size="iconMd"
            loading={loading}
            aria-label="Wishlist"
            onClick={handleClick}
        >
            <Heart
                className={`h-5 w-5 transition-all ${wishlisted
                    ? "fill-red-500 text-red-500"
                    : ""
                    }`}
            />
        </Button>
    );
}