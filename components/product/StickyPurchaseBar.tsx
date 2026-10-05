"use client";

import { useState, useCallback, useRef } from "react";
import { ShoppingBag, Zap, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import type { Product } from "@/lib/services/products";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useWishlistProduct } from "@/lib/WishlistContext";

interface StickyPurchaseBarProps {
    product: Product;
}

export default function StickyPurchaseBar({
    product,
}: StickyPurchaseBarProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [loading, setLoading] = useState<"none" | "add" | "buy">("none");
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const { wishlisted, toggle } = useWishlistProduct(product.id);

    const busyRef = useRef(false);

    const soldOut =
        product.status === "sold" || product.isActive === false;

    const ensureAuth = useCallback(() => {
        if (!user) {
            toast.error("Please sign in to continue");

            router.push(
                `/login?redirect=${encodeURIComponent(
                    `/product/${product.slug}`,
                )}`,
            );

            return false;
        }

        return true;
    }, [user, router, product.slug]);

    const handleAdd = useCallback(async () => {
        if (busyRef.current || soldOut) return;
        if (!ensureAuth()) return;

        busyRef.current = true;
        setLoading("add");

        try {
            await addToCart(product, 1);

            toast.success("Added to cart");
            router.push("/cart");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to add this item to your cart",
            );

            setLoading("none");
        } finally {
            busyRef.current = false;
        }
    }, [addToCart, ensureAuth, product, router, soldOut]);

    const handleBuy = useCallback(async () => {
        if (busyRef.current || soldOut) return;
        if (!ensureAuth()) return;

        busyRef.current = true;
        setLoading("buy");

        try {
            await addToCart(product, 1);

            router.push("/checkout");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to start checkout",
            );

            setLoading("none");
        } finally {
            busyRef.current = false;
        }
    }, [addToCart, ensureAuth, product, router, soldOut]);

    const handleWishlist = useCallback(async () => {
        if (wishlistLoading) return;

        setWishlistLoading(true);

        try {
            const state = await toggle();

            toast.success(
                state ? "Added to wishlist" : "Removed from wishlist",
            );
        } catch {
            toast.error("Please sign in to wishlist");
        } finally {
            setWishlistLoading(false);
        }
    }, [toggle, wishlistLoading]);

    if (soldOut) {
        return (
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="
                    fixed inset-x-0
                    bottom-[var(--mobile-nav-height)]
                    z-[60]
                    border-t border-border/70
                    bg-card/85
                    p-4
                    shadow-[0_-8px_32px_rgba(0,0,0,0.08)]
                    backdrop-blur-2xl
                    supports-[backdrop-filter]:bg-card/75
                    md:bottom-0
                    lg:hidden
                "
            >
                <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    disabled
                >
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
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
            }}
            className="
                fixed inset-x-0
                bottom-[var(--mobile-nav-height)]
                z-[60]
                border-t border-border/70
                bg-card/85
                px-3 py-3
                shadow-[0_-8px_32px_rgba(0,0,0,0.08)]
                backdrop-blur-2xl
                supports-[backdrop-filter]:bg-card/75
                sm:px-4
                md:bottom-0
                lg:hidden
            "
        >
            <div className="mx-auto flex w-full max-w-[1280px] items-center gap-2.5 sm:gap-3">
                <div className="min-w-0 shrink-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                        Price
                    </p>

                    <p className="text-lg font-bold leading-tight tracking-tight text-foreground sm:text-xl">
                        ₹{product.price.toLocaleString("en-IN")}
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="iconMd"
                    onClick={handleWishlist}
                    loading={wishlistLoading}
                    aria-label={
                        wishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                    }
                    aria-pressed={wishlisted}
                    className="h-11 w-11 shrink-0 rounded-xl"
                >
                    <Heart
                        aria-hidden="true"
                        className={`h-5 w-5 transition-colors ${wishlisted
                            ? "fill-red-500 text-red-500"
                            : ""
                            }`}
                    />
                </Button>

                <Button
                    variant="primary"
                    size="lg"
                    className="h-11 min-w-0 flex-1 rounded-xl px-2 sm:h-12 sm:px-4"
                    loading={loading === "add"}
                    loadingText="Adding"
                    leftIcon={<ShoppingBag className="h-4 w-4" />}
                    onClick={handleAdd}
                    disabled={loading === "buy"}
                >
                    Add
                </Button>

                <Button
                    variant="secondary"
                    size="lg"
                    className="h-11 min-w-0 flex-1 rounded-xl px-2 sm:h-12 sm:px-4"
                    loading={loading === "buy"}
                    loadingText="Opening"
                    leftIcon={<Zap className="h-4 w-4" />}
                    onClick={handleBuy}
                    disabled={loading === "add"}
                >
                    Buy Now
                </Button>
            </div>
        </motion.div>
    );
}