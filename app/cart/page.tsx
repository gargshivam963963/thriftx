'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import CartItems from '@/components/cart/CartItems';
import OrderSummary from '@/components/cart/OrderSummary';

import {
  updateCartQuantity,
  removeCartItem,
} from '@/lib/services/cart';

import {
  CartProduct,
  getCartProducts,
} from '@/lib/services/cartProducts';

import { useAuth } from '@/lib/AuthContext';

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [cartItems, setCartItems] =
    useState<CartProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [couponCode, setCouponCode] =
    useState('');

  const [discount, setDiscount] =
    useState(0);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);

      if (authLoading) {
        return;
      }

      if (!user) {
        setCartItems([]);
        return;
      }

      const products =
        await getCartProducts();

      setCartItems(products);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load cart.');
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(
        String(item.price).replace(/[^\d.]/g, '')
      );

      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const savings = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const retail =
        item.retailPrice ?? item.price;

      return (
        total +
        (retail - item.price) * item.quantity
      );
    }, 0);
  }, [cartItems]);

  const total =
    subtotal -
    discount;

  const increaseQuantity = async (
    cartId: string,
  ) => {
    try {
      const item = cartItems.find(
        (cart) => cart.cartId === cartId,
      );

      if (!item) {
        return;
      }

      await updateCartQuantity(
        cartId,
        item.quantity + 1,
      );

      await loadCart();
    } catch (error) {
      console.error(error);

      toast.error(
        'Unable to update quantity.',
      );
    }
  };

  const removeItem = async (
    cartId: string,
  ) => {
    try {
      await removeCartItem(cartId);

      toast.success(
        'Item removed.',
      );

      await loadCart();
    } catch (error) {
      console.error(error);

      toast.error(
        'Unable to remove item.',
      );
    }
  };

  const decreaseQuantity = async (
    cartId: string,
    quantity: number,
  ) => {
    try {
      if (quantity <= 1) {
        await removeItem(cartId);
        return;
      }

      await updateCartQuantity(
        cartId,
        quantity - 1,
      );

      await loadCart();
    } catch (error) {
      console.error(error);

      toast.error(
        'Unable to update quantity.',
      );
    }
  };

  const applyCoupon = (code: string) => {
    const coupon = code.trim().toUpperCase();

    if (!coupon) {
      toast.error('Enter coupon code.');
      return;
    }

    if (coupon === 'WELCOME10') {
      setCouponCode(coupon);
      setDiscount(100);

      toast.success('Coupon applied successfully.');
      return;
    }

    setCouponCode('');
    setDiscount(0);

    toast.error('Invalid coupon code.');
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login first.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!cartItems.length) {
      toast.error('Your cart is empty.');
      return;
    }

    router.push('/checkout');
  };

  return (
    <main className="min-h-screen bg-white">

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 xl:px-10 2xl:px-16">

        <div className="mb-6 flex items-center justify-between">

          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-neutral-400">
              THRIFTX
            </p>

            <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Shopping Cart
            </h1>

          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium transition hover:border-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

        </div>

        {cartItems.length === 0 &&
          !loading ? (
          <CartItems
            items={[]}
            loading={false}
            onIncrease={
              increaseQuantity
            }
            onDecrease={
              decreaseQuantity
            }
            onRemove={
              removeItem
            }
          />
        ) : (
          <div className="grid items-start gap-8 xl:gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">

            <section className="space-y-6">

              <CartItems
                items={cartItems}
                loading={loading}
                onIncrease={
                  increaseQuantity
                }
                onDecrease={
                  decreaseQuantity
                }
                onRemove={
                  removeItem
                }
              />

            </section>

            <aside className="sticky top-24 flex flex-col gap-4 self-start">
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

      </section>

    </main>
  );
}
