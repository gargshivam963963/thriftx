"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ShoppingBag, Zap, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import type { Product } from "@/lib/services/products";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { addToCart as persistAddToCart } from "@/lib/services/cart";
import { Button } from "@/components/ui/button";
import { toggleWishlist, isWishlisted } from "@/lib/services/wishlist";

interface StickyPurchaseBarProps {
    product: Product;
}

/**
 * StickyPurchaseBar — mobile-only fixed bottom purchase panel.
 * Shows price + Add to Cart + Buy Now. Renders nothing on desktop (lg:).
 */
export default function StickyPurchaseBar({ product }: StickyPurchaseBarProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [loading, setLoading] = useState<"none" | "add" | "buy">("none");
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const busyRef = useRef(false);

    const soldOut = product.status === "sold" || product.isActive === false;

    const checkWishlist = useCallback(async () => {
        if (!user) return;
        try {
            setWishlisted(await isWishlisted(product.id));
        } catch {
            // ignore
        }
    }, [user, product.id]);

    // Check wishlist on mount if logged in
    useEffect(() => {
        checkWishlist();
    }, [checkWishlist]);

    const ensureAuth = useCallback(() => {
        if (!user) {
            toast.error("Please sign in to continue");
            router.push(`/login?redirect=/product/${product.slug}`);
            return false;
        }
        return true;
    }, [user, router, product.slug]);

    const handleAdd = useCallback(async () => {
        if (busyRef.current || soldOut) return;
        busyRef.current = true;
        setLoading("add");
        try {
            addToCart(product, 1);
            if (user) {
                await persistAddToCart(product.id, 1);
            }
            toast.success("Added to cart");
            setTimeout(() => router.push("/cart"), 300);
        } catch {
            toast.error("Unable to add to cart");
            setLoading("none");
        } finally {
            busyRef.current = false;
        }
    }, [addToCart, product, router, soldOut, user]);

    const handleBuy = useCallback(async () => {
        if (busyRef.current || soldOut) return;
        if (!ensureAuth()) return;
        busyRef.current = true;
        setLoading("buy");
        try {
            addToCart(product, 1);
            if (user) {
                await persistAddToCart(product.id, 1);
            }
            router.push("/checkout");
        } catch {
            toast.error("Unable to start checkout");
            setLoading("none");
        } finally {
            busyRef.current = false;
        }
    }, [addToCart, ensureAuth, product, router, soldOut, user]);

    const handleWishlist = useCallback(async () => {
        if (wishlistLoading) return;
        setWishlistLoading(true);
        try {
            const state = await toggleWishlist(product.id);
            setWishlisted(state);
            toast.success(state ? "Added to wishlist" : "Removed from wishlist");
        } catch {
            toast.error("Please sign in to wishlist");
        } finally {
            setWishlistLoading(false);
        }
    }, [product.id, wishlistLoading]);

    if (soldOut) {
        return (
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-card/95 p-4 backdrop-blur-xl lg:hidden"
            >
                <Button variant="secondary" size="lg" fullWidth disabled>
                    Sold Out
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-card/95 px-4 py-3 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:hidden"
        >
            <div className="mx-auto flex max-w-[1280px] items-center gap-3">
                <div className="shrink-0">
                    <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                        Price
                    </p>
                    <p className="text-title font-bold text-foreground">
                        ₹{product.price.toLocaleString("en-IN")}
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="iconMd"
                    onClick={handleWishlist}
                    loading={wishlistLoading}
                    aria-label="Toggle wishlist"
                    className="shrink-0"
                >
                    <Heart
                        className={`h-5 w-5 transition-all ${wishlisted ? "fill-red-500 text-red-500" : ""
                            }`}
                    />
                </Button>

                <Button
                    variant="primary"
                    size="lg"
                    className="h-12 flex-1"
                    loading={loading === "add"}
                    loadingText="…"
                    leftIcon={<ShoppingBag />}
                    onClick={handleAdd}
                    disabled={loading === "buy"}
                >
                    Add
                </Button>

                <Button
                    variant="secondary"
                    size="lg"
                    className="h-12 flex-1"
                    loading={loading === "buy"}
                    loadingText="…"
                    leftIcon={<Zap />}
                    onClick={handleBuy}
                    disabled={loading === "add"}
                >
                    Buy Now
                </Button>
            </div>
        </motion.div>
    );
}
