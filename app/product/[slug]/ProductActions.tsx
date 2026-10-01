"use client";

import { useState, useCallback, useRef } from "react";
import { ShoppingBag, Zap, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import type { Product } from "@/lib/services/products";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { addToCart as persistAddToCart } from "@/lib/services/cart";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/analytics/AnalyticsContext";

interface ProductActionsProps {
  product: Product;
}

/**
 * ProductActions — Add to Cart + Buy Now with optimistic UI.
 *
 * - Add to Cart: optimistic cart update (no wait), prevents duplicate clicks,
 *   shows loading, then navigates to cart.
 * - Buy Now: adds to cart then routes straight to checkout.
 * - Both gate on auth (redirect to login) and guard against sold-out products.
 */
export default function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { trackAddToCart } = useAnalytics();

  const [cartLoading, setCartLoading] = useState<"none" | "add" | "buy">("none");
  const busyRef = useRef(false);

  const soldOut = product.status === "sold" || product.isActive === false;

  const ensureAuth = useCallback(() => {
    if (!user) {
      toast.error("Please sign in to continue");
      router.push(`/login?redirect=/product/${product.slug}`);
      return false;
    }
    return true;
  }, [user, router, product.slug]);

  const handleAddToCart = useCallback(async () => {
    if (busyRef.current || soldOut) return;
    busyRef.current = true;
    setCartLoading("add");

    try {
      // Optimistic local cart update (instant UI)
      addToCart(product, 1);

      // Persist the cart update so the cart page reflects it (ignore if not logged in)
      if (user) {
        await persistAddToCart(product.id, 1);
      }

      trackAddToCart(product.id, {
        title: product.title,
        brand: product.brand || "",
        category: product.category || "",
        price: product.price,
        slug: product.slug,
      });

      toast.success("Added to cart");
      // Brief pause so the user sees the optimistic state before navigating
      setTimeout(() => router.push("/cart"), 350);
    } catch {
      toast.error("Unable to add product to cart");
      setCartLoading("none");
    } finally {
      busyRef.current = false;
    }
  }, [addToCart, product, router, soldOut, trackAddToCart, user]);

  const handleBuyNow = useCallback(async () => {
    if (busyRef.current || soldOut) return;
    if (!ensureAuth()) return;

    busyRef.current = true;
    setCartLoading("buy");

    try {
      // Add to cart then immediately go to checkout
      addToCart(product, 1);
      if (user) {
        await persistAddToCart(product.id, 1);
      }

      trackAddToCart(product.id, {
        title: product.title,
        brand: product.brand || "",
        category: product.category || "",
        price: product.price,
        slug: product.slug,
      });

      router.push("/checkout");
    } catch {
      toast.error("Unable to start checkout");
      setCartLoading("none");
    } finally {
      busyRef.current = false;
    }
  }, [addToCart, ensureAuth, product, router, soldOut, trackAddToCart, user]);

  if (soldOut) {
    return (
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        disabled
        className="h-14"
      >
        Sold Out
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Button
          variant="primary"
          size="lg"
          className="h-14 flex-1"
          loading={cartLoading === "add"}
          loadingText="Adding…"
          leftIcon={<ShoppingBag />}
          onClick={handleAddToCart}
          disabled={cartLoading === "buy"}
        >
          Add to Cart
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="h-14 flex-1"
          loading={cartLoading === "buy"}
          loadingText="Redirecting…"
          leftIcon={<Zap />}
          onClick={handleBuyNow}
          disabled={cartLoading === "add"}
        >
          Buy Now
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-small text-muted-foreground">
        <Heart className="h-3.5 w-3.5" />
        <span>1-of-1 curated piece — once sold, it&apos;s gone</span>
      </div>
    </div>
  );
}
