"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import CartItems from "@/components/cart/CartItems";
import OrderSummary from "@/components/cart/OrderSummary";
import CartOffers from "@/components/marketing/CartOffers";

import { updateCartQuantity, removeCartItem } from "@/lib/services/cart";
import { getCartProducts, type CartProduct } from "@/lib/services/cartProducts";
import { useAuth } from "@/lib/AuthContext";

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      if (authLoading) return;
      if (!user) {
        setCartItems([]);
        return;
      }
      const products = await getCartProducts();
      setCartItems(products);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(String(item.price).replace(/[^\d.]/g, ""));
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const savings = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const retail = item.retailPrice ?? item.price;
      return total + (retail - item.price) * item.quantity;
    }, 0);
  }, [cartItems]);

  const total = subtotal - discount;

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
    const coupon = code.trim().toUpperCase();
    if (!coupon) {
      toast.error("Please enter a coupon code");
      return;
    }
    try {
      const res = await fetch("/api/marketing/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon, subtotal }),
      });
      const data = await res.json();
      if (data.success && data.valid) {
        setCouponCode(data.code);
        setDiscount(data.discount);
        toast.success(`Coupon applied — ₹${data.discount.toLocaleString("en-IN")} off!`);
      } else {
        setCouponCode("");
        setDiscount(0);
        toast.error(data.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error(error);
      setCouponCode("");
      setDiscount(0);
      toast.error("Failed to validate coupon");
    }
  };

  const handleCheckout = () => {
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
    router.push("/checkout");
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-caption font-bold uppercase tracking-[0.25em] text-muted-foreground">
              ThriftX
            </p>
            <h1 className="mt-1 text-heading-2 font-bold tracking-tight text-foreground">
              Shopping Cart
            </h1>
            {cartItems.length > 0 && (
              <p className="mt-0.5 text-body-sm text-muted-foreground">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
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

        {/* Cart items or empty state */}
        {cartItems.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-24">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <ShoppingBag size={28} className="text-muted-foreground" />
            </div>
            <h2 className="text-heading-4 font-bold text-foreground">Your cart is empty</h2>
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
            {/* Items list */}
            <section className="min-w-0 space-y-4">
              <CartItems
                items={cartItems}
                loading={loading}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeItem}
              />
              {cartItems.length > 0 && (
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
            </section>

            {/* Order Summary */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <OrderSummary
                itemCount={cartItems.length}
                subtotal={subtotal}
                total={total}
                savings={savings}
                paymentLoading={false}
                onCheckout={handleCheckout}
                appliedCoupon={couponCode}
                discount={discount}
                onApplyCoupon={applyCoupon}
              />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

