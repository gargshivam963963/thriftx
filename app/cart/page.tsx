
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import CartItems from "@/components/cart/CartItems";
import OrderSummary from "@/components/cart/OrderSummary";
import CartOffers from "@/components/marketing/CartOffers";

import { updateCartQuantity, removeCartItem } from "@/lib/services/cart";
import {
  getCartProducts,
  type CartProduct,
} from "@/lib/services/cartProducts";
import { useAuth } from "@/lib/AuthContext";

type CartStatus = "loading" | "ready" | "error";

interface CartQuote {
  subtotal: number;
  discount: number;
  discountReason: string;
  appliedPromotion: "welcome" | "referral" | "coupon" | "none";
  total: number;
}

function CartLoadingSkeleton() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-label="Loading your shopping cart"
      aria-live="polite"
    >
      <span className="sr-only">Loading your cart...</span>

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex min-h-[184px] gap-4 rounded-2xl border border-border bg-card p-4"
        >
          <div className="skeleton-glass h-32 w-32 shrink-0 rounded-xl" />

          <div className="flex min-w-0 flex-1 flex-col gap-3 py-2">
            <div className="skeleton-glass h-5 w-3/4 rounded" />
            <div className="skeleton-glass h-4 w-1/2 rounded" />
            <div className="skeleton-glass mt-auto h-6 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryLoadingSkeleton() {
  return (
    <div
      className="rounded-2xl border border-border bg-card p-6"
      role="status"
      aria-label="Loading order summary"
    >
      <div className="skeleton-glass mb-6 h-5 w-24 rounded" />
      <div className="skeleton-glass mb-8 h-8 w-36 rounded" />

      <div className="space-y-5">
        <div className="skeleton-glass h-12 rounded-xl" />
        <div className="skeleton-glass h-4 w-full rounded" />
        <div className="skeleton-glass h-4 w-3/4 rounded" />
        <div className="h-px bg-border" />
        <div className="skeleton-glass h-12 rounded-xl" />
        <div className="skeleton-glass h-12 rounded-xl" />
      </div>
    </div>
  );
}

function CartErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center"
      role="alert"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <AlertCircle size={26} className="text-muted-foreground" />
      </div>

      <h2 className="text-heading-4 font-bold text-foreground">
        We couldn&apos;t load your cart
      </h2>

      <p className="mt-2 max-w-sm text-body-sm text-muted-foreground">
        Your cart has not been confirmed as empty. Please check your
        connection and try again.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-body-sm font-semibold text-background transition hover:opacity-90"
      >
        <RefreshCw size={15} />
        Try Again
      </button>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [status, setStatus] = useState<CartStatus>("loading");
  const [couponCode, setCouponCode] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [cartQuote, setCartQuote] = useState<CartQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const requestId = useRef(0);
  const quoteRequestId = useRef(0);

  const loadCart = useCallback(async () => {
    if (authLoading) return;

    const currentRequest = ++requestId.current;

    setStatus("loading");

    try {
      if (!user) {
        setCartItems([]);
        setStatus("ready");
        return;
      }

      const products = await getCartProducts();

      if (currentRequest !== requestId.current) return;

      setCartItems(products);
      setStatus("ready");
    } catch (error) {
      if (currentRequest !== requestId.current) return;

      console.error("Cart loading failed:", error);
      setStatus("error");
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading) return;

    setCouponCode(
      window.sessionStorage.getItem("thriftx:checkout-coupon") ?? "",
    );
    setReferralCode(
      window.localStorage.getItem("thriftx:referral-code") ?? "",
    );
    void loadCart();

    return () => {
      requestId.current += 1;
    };
  }, [authLoading, loadCart]);

  useEffect(() => {
    if (status !== "ready" || !user || cartItems.length === 0) {
      setCartQuote(null);
      setQuoteLoading(false);
      setQuoteError("");
      return;
    }

    const currentRequest = ++quoteRequestId.current;
    const controller = new AbortController();
    setCartQuote(null);
    setQuoteLoading(true);
    setQuoteError("");

    void fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({
        ...(couponCode ? { couponCode } : {}),
        ...(referralCode ? { referralCode } : {}),
      }),
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          success?: boolean;
          message?: string;
          quote?: CartQuote;
        };
        if (!response.ok || !result.success || !result.quote) {
          throw new Error(result.message || "Unable to calculate cart total.");
        }
        if (currentRequest === quoteRequestId.current) {
          setCartQuote(result.quote);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (currentRequest === quoteRequestId.current) {
          console.error("Cart quote failed:", error);
          setCartQuote(null);
          setQuoteError(
            error instanceof Error
              ? error.message
              : "Unable to confirm your cart total.",
          );
        }
      })
      .finally(() => {
        if (currentRequest === quoteRequestId.current) {
          setQuoteLoading(false);
        }
      });

    return () => {
      controller.abort();
      quoteRequestId.current += 1;
    };
  }, [cartItems, couponCode, referralCode, status, user]);

  const authoritativeSubtotal = cartQuote?.subtotal ?? 0;
  const discount = cartQuote?.discount ?? 0;

  const savings = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const retail = item.retailPrice ?? item.price;
      return total + (retail - item.price) * item.quantity;
    }, 0);
  }, [cartItems]);

  const total = cartQuote?.total ?? 0;

  const increaseQuantity = async (cartId: string) => {
    try {
      const item = cartItems.find((c) => c.cartId === cartId);
      if (!item) return;

      await updateCartQuantity(cartId, item.quantity + 1);
      await loadCart();
    } catch (error) {
      console.error(error);
      toast.error("Unable to update quantity");
    }
  };

  const removeItem = async (cartId: string) => {
    try {
      await removeCartItem(cartId);

      setCouponCode("");
      window.sessionStorage.removeItem("thriftx:checkout-coupon");

      toast.success("Item removed from cart");
      await loadCart();
    } catch (error) {
      console.error(error);
      toast.error("Unable to remove item");
    }
  };

  const decreaseQuantity = async (cartId: string, quantity: number) => {
    try {
      if (quantity <= 1) {
        await removeItem(cartId);
        return;
      }

      await updateCartQuantity(cartId, quantity - 1);
      await loadCart();
    } catch (error) {
      console.error(error);
      toast.error("Unable to update quantity");
    }
  };

  const applyCoupon = async (code: string) => {
    if (status !== "ready" || cartItems.length === 0) return;

    const coupon = code.trim().toUpperCase();

    if (!coupon) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const res = await fetch("/api/marketing/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon }),
      });

      if (!res.ok) {
        throw new Error(`Coupon request failed: ${res.status}`);
      }

      const data = await res.json();

      if (data.success && data.valid) {
        setCouponCode(data.code);
        window.sessionStorage.setItem("thriftx:checkout-coupon", data.code);

        toast.success("Coupon accepted. Your total is being recalculated.");
      } else {
        setCouponCode("");
        window.sessionStorage.removeItem("thriftx:checkout-coupon");
        toast.error(data.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to validate coupon");
    }
  };

  const handleCheckout = () => {
    if (status !== "ready") {
      toast.error("Please wait until your cart has loaded");
      return;
    }

    if (!user) {
      toast.error("Please login first");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (cartItems.some((item) => !item.price || item.price <= 0)) {
      toast.error("Some items have invalid pricing");
      return;
    }

    if (quoteLoading || !cartQuote || quoteError) {
      toast.error("Please wait while we confirm your cart total.");
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("thriftx:checkout-coupon", couponCode);
    }

    router.push("/checkout");
  };

  const isLoading = authLoading || status === "loading";
  const isEmpty = !isLoading && status === "ready" && cartItems.length === 0;
  const hasError = !authLoading && status === "error";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-caption font-bold uppercase tracking-caps-wide text-muted-foreground">
              ThriftX
            </p>

            <h1 className="mt-1 text-heading-2 font-bold tracking-tight text-foreground">
              Shopping Cart
            </h1>

            {!isLoading && status === "ready" && cartItems.length > 0 && (
              <p className="mt-0.5 text-body-sm text-muted-foreground">
                {cartItems.length}{" "}
                {cartItems.length === 1 ? "item" : "items"} in your cart
              </p>
            )}
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-small font-semibold text-foreground transition hover:border-muted-foreground hover:bg-muted"
          >
            <ArrowLeft size={14} />
            Continue Shopping
          </Link>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-24">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <ShoppingBag size={28} className="text-muted-foreground" />
            </div>

            <h2 className="text-heading-4 font-bold text-foreground">
              Your cart is empty
            </h2>

            <p className="mt-1.5 max-w-sm text-center text-body-sm text-muted-foreground">
              Your collection is waiting. Start with one exceptional piece.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-body-sm font-semibold text-background transition hover:bg-muted-foreground"
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
            <section className="min-w-0 space-y-4">
              {hasError ? (
                <CartErrorState onRetry={() => void loadCart()} />
              ) : (
                <>
                  <CartItems
                    items={cartItems}
                    loading={isLoading}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                    onRemove={removeItem}
                  />

                  {!isLoading && cartItems.length > 0 && (
                    <CartOffers
                      items={cartItems.map((item) => ({
                        id: item.cartId,
                        title: item.title,
                        price: item.price,
                        quantity: item.quantity,
                        category: item.category,
                      }))}
                    />
                  )}
                </>
              )}
            </section>

            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              {isLoading ? (
                <SummaryLoadingSkeleton />
              ) : hasError ? (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-heading-4 font-bold text-foreground">
                    Order Summary
                  </h2>

                  <p className="mt-3 text-body-sm text-muted-foreground">
                    Totals are temporarily unavailable because your cart
                    could not be loaded.
                  </p>

                  <button
                    type="button"
                    onClick={() => void loadCart()}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-body-sm font-semibold text-background"
                  >
                    <RefreshCw size={15} />
                    Retry
                  </button>
                </div>
              ) : (
                <OrderSummary
                  itemCount={cartItems.length}
                  subtotal={authoritativeSubtotal}
                  total={total}
                  savings={savings}
                  paymentLoading={false}
                  onCheckout={handleCheckout}
                  appliedCoupon={couponCode}
                  discount={discount}
                  discountReason={cartQuote?.discountReason ?? ""}
                  appliedPromotion={cartQuote?.appliedPromotion ?? "none"}
                  pricingLoading={quoteLoading}
                  pricingError={quoteError}
                  onRetryPricing={() => void loadCart()}
                  onApplyCoupon={applyCoupon}
                />
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}