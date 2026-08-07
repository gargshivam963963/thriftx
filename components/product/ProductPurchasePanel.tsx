"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Product } from "@/lib/services/products";
import { addToCart as persistAddToCart } from "@/lib/services/cart";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { useAnalytics } from "@/lib/analytics/AnalyticsContext";

import ProductActions from "@/app/product/[slug]/ProductActions";
import StickyPurchaseBar from "@/components/product/StickyPurchaseBar";

type BusyAction = "add" | "buy" | null;

/**
 * ProductPurchasePanel — shared purchase logic for the desktop actions
 * and the mobile sticky bar. Wires optimistic cart + Appwrite persistence.
 */
export default function ProductPurchasePanel({
    product,
}: {
    product: Product;
}) {
    const [busy, setBusy] = useState<BusyAction>(null);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { trackAddToCart } = useAnalytics();
    const router = useRouter();
    const lockRef = useRef(false);

    const persist = useCallback(
        async (productId: string) => {
            if (!user) return;
            try {
                await persistAddToCart(productId, 1);
            } catch {
                // local cart still reflects the add
            }
        },
        [user],
    );

    const handleAddToCart = useCallback(async () => {
        if (lockRef.current) return;
        lockRef.current = true;
        setBusy("add");

        addToCart(product);
        trackAddToCart(product.id, {
            title: product.title,
            brand: product.brand || "",
            category: product.category || "",
            price: product.price,
            slug: product.slug,
        });
        await persist(product.id);
        toast.success("Added to cart");

        setBusy(null);
        lockRef.current = false;
    }, [product, addToCart, trackAddToCart, persist]);

    const handleBuyNow = useCallback(async () => {
        if (lockRef.current) return;
        lockRef.current = true;
        setBusy("buy");

        addToCart(product);
        await persist(product.id);
        router.push("/checkout");
    }, [product, addToCart, persist, router]);

    return (
        <>
            <ProductActions
                busy={busy}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
            />
            <StickyPurchaseBar
                price={product.price}
                addToCartLoading={busy === "add"}
                buyNowLoading={busy === "buy"}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
            />
        </>
    );
}
