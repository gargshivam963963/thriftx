"use client";

import { useState, useCallback, useRef } from "react";
import { ShoppingBag, Zap, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Product } from "@/lib/services/products";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/analytics/AnalyticsContext";

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({
  product,
}: ProductActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { trackAddToCart } = useAnalytics();

  const [cartLoading, setCartLoading] = useState<
    "none" | "add" | "buy"
  >("none");

  const busyRef = useRef(false);

  const soldOut =
    product.status === "sold" || product.isActive === false;

  const ensureAuth = useCallback(() => {
    if (!user) {
      toast.error("Please sign in to continue");

      router.push(
        `/ login ? redirect = ${encodeURIComponent(
          `/product/${product.slug}`,
        )
        } `,
      );

      return false;
    }

    return true;
  }, [user, router, product.slug]);

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
    if (!ensureAuth()) return;

    busyRef.current = true;
    setCartLoading("add");

    try {
      await addToCart(product, 1);
      trackProduct();

      toast.success("Added to cart");
      router.push("/cart");
    } catch (error) {
      console.error(
        "[ProductActions] Add to cart failed:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to add this item. Please try again.",
      );

      setCartLoading("none");
    } finally {
      busyRef.current = false;
    }
  }, [
    addToCart,
    ensureAuth,
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
      await addToCart(product, 1);
      trackProduct();

      router.push("/checkout");
    } catch (error) {
      console.error(
        "[ProductActions] Buy now failed:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Please try again.",
      );

      setCartLoading("none");
    } finally {
      busyRef.current = false;
    }
  }, [
    addToCart,
    ensureAuth,
    product,
    router,
    soldOut,
    trackProduct,
  ]);

  if (soldOut) {
    return (
      <Button
        variant="secondary"
        size="xl"
        fullWidth
        disabled
        className="h-14 rounded-2xl"
      >
        Sold Out
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="primary"
          size="xl"
          rounded="xl"
          shadow="md"
          loading={cartLoading === "add"}
          loadingText="Adding…"
          leftIcon={<ShoppingBag className="h-5 w-5" />}
          onClick={handleAddToCart}
          disabled={cartLoading === "buy"}
          className="
            relative h-14 min-w-0 overflow-hidden
            border border-foreground/10
            shadow-[0_5px_18px_rgba(0,0,0,0.12)]
            transition-[transform,box-shadow,filter]
            duration-300 ease-out
            hover:-translate-y-0.5
            hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)]
            active:translate-y-0 active:scale-[0.975]
            disabled:cursor-not-allowed
            motion-reduce:transform-none motion-reduce:transition-none
          "
        >
          <span
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-x-5 top-px h-px
              bg-gradient-to-r from-transparent
              via-background/45 to-transparent
            "
          />
          <span className="relative z-10">Add to Cart</span>
        </Button>

        <Button
          type="button"
          variant="glass"
          size="xl"
          rounded="xl"
          shadow="md"
          loading={cartLoading === "buy"}
          loadingText="Preparing…"
          leftIcon={<Zap className="h-5 w-5" />}
          onClick={handleBuyNow}
          disabled={cartLoading === "add"}
          className="
            relative h-14 min-w-0 overflow-hidden
            border border-border
            bg-card/80 text-card-foreground
            shadow-[0_4px_16px_rgba(0,0,0,0.06)]
            backdrop-blur-xl
            transition-[transform,background-color,border-color,box-shadow]
            duration-300 ease-out
            hover:-translate-y-0.5
            hover:border-foreground/20
            hover:bg-card
            hover:shadow-[0_9px_24px_rgba(0,0,0,0.11)]
            active:translate-y-0 active:scale-[0.975]
            disabled:cursor-not-allowed
            motion-reduce:transform-none motion-reduce:transition-none
          "
        >
          <span
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-x-5 top-px h-px
              bg-gradient-to-r from-transparent
              via-foreground/15 to-transparent
            "
          />
          <span className="relative z-10">Buy Now</span>
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-small text-muted-foreground">
        <Heart className="h-3.5 w-3.5 shrink-0" />
        <span>
          1-of-1 curated piece — once sold, it&apos;s gone
        </span>
      </div>
    </div>
  );
}