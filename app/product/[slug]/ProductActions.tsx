
"use client";

import { useState, useCallback, useRef } from "react";
import { ShoppingBag, Zap, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
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

export default function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { trackAddToCart } = useAnalytics();

  const [cartLoading, setCartLoading] = useState<"none" | "add" | "buy">(
    "none",
  );
  const busyRef = useRef(false);

  const soldOut =
    product.status === "sold" || product.isActive === false;

  const ensureAuth = useCallback(() => {
    if (!user) {
      toast.error("Please sign in to continue");
      router.push(
        `/login?redirect=${encodeURIComponent(`/product/${product.slug}`)}`,
      );
      return false;
    }

    return true;
  }, [user, router, product.slug]);

  const persistProduct = useCallback(async () => {
    if (user) {
      await persistAddToCart(product.id, 1);
    }
  }, [product.id, user]);

  const trackProduct = useCallback(() => {
    trackAddToCart(product.id, {
      title: product.title,
      brand: product.brand || "",
      category: product.category || "",
      price: product.price,
      slug: product.slug,
    });
  }, [product, trackAddToCart]);

  const handleAddToCart = useCallback(async () => {
    if (busyRef.current || soldOut) return;

    busyRef.current = true;
    setCartLoading("add");

    try {
      await persistProduct();

      addToCart(product, 1);
      trackProduct();

      toast.success("Added to cart");
      router.push("/cart");
    } catch (error) {
      console.error("[ProductActions] Add to cart failed:", error);
      toast.error("Unable to add this item. Please try again.");
      setCartLoading("none");
    } finally {
      busyRef.current = false;
    }
  }, [
    addToCart,
    persistProduct,
    product,
    router,
    soldOut,
    trackProduct,
  ]);

  const handleBuyNow = useCallback(async () => {
    if (busyRef.current || soldOut) return;
    if (!ensureAuth()) return;

    busyRef.current = true;
    setCartLoading("buy");

    try {
      await persistProduct();

      addToCart(product, 1);
      trackProduct();

      router.push("/checkout");
    } catch (error) {
      console.error("[ProductActions] Buy now failed:", error);
      toast.error("Unable to start checkout. Please try again.");
      setCartLoading("none");
    } finally {
      busyRef.current = false;
    }
  }, [
    addToCart,
    ensureAuth,
    persistProduct,
    product,
    router,
    soldOut,
    trackProduct,
  ]);

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