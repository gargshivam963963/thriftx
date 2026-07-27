"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import CartItems from "@/components/cart/CartItems";
import OrderSummary from "@/components/cart/OrderSummary";

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

  const applyCoupon = (code: string) => {
    const coupon = code.trim().toUpperCase();
    if (!coupon) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (coupon === "WELCOME10") {
      setCouponCode(coupon);
      setDiscount(100);
      toast.success("Coupon applied — ₹100 off!");
      return;
    }
    setCouponCode("");
    setDiscount(0);
    toast.error("Invalid coupon code");
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
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 dark:text-neutral-500">
              ThriftX
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              Shopping Cart
            </h1>
            {cartItems.length > 0 && (
              <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
              </p>
            )}
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-500"
          >
            <ArrowLeft size={14} />
            Continue Shopping
          </Link>
        </div>

        {/* Cart items or empty state */}
        {cartItems.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-24 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
              <ShoppingBag size={28} className="text-neutral-400" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Your cart is empty</h2>
            <p className="mt-1.5 max-w-sm text-center text-sm text-neutral-500 dark:text-neutral-400">
              Your collection is waiting. Start with one exceptional piece.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
            {/* Items list */}
            <section className="min-w-0">
              <CartItems
                items={cartItems}
                loading={loading}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeItem}
              />
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

