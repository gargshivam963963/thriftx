'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import {
  getCartItems,
  removeCartItem,
  updateCartQuantity,
} from '@/lib/services/cart';
import { getProductById, Product } from '@/lib/products';
import { getAddress, saveAddress } from "@/lib/services/address";
import { useRouter } from "next/navigation";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { createOrder } from "@/lib/services/orderService";
import { clearCart } from "@/lib/services/cart";

type CartProduct = Product & {
  cartId: string;
  quantity: number;
};

export default function Cart() {
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [address, setAddress] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "India",
    notes: "",
    isDefault: true,
  });

  useEffect(() => {
    loadCart();
    loadAddress();
  }, []);

  async function loadAddress() {
    try {
      const saved = await getAddress();

      if (!saved) return;

      setAddress({
        email: saved.email,
        firstName: saved.firstName,
        lastName: saved.lastName,
        phone: saved.phone,
        address: saved.address,
        city: saved.city,
        postalCode: saved.postalCode,
        country: saved.country,
        notes: saved.notes || "",
        isDefault: saved.isDefault,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCart() {
    try {
      setLoading(true);

      const cart = await getCartItems();

      const items = await Promise.all(
        cart.map(async (item) => {
          const product = await getProductById(item.productId);

          if (!product) return null;

          return {
            ...product,
            cartId: item.id,
            quantity: item.quantity,
          };
        })
      );

      setCartProducts(items.filter(Boolean) as CartProduct[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleProceedToCheckout() {
    try {
      setPaymentLoading(true);

      if (
        !address.firstName ||
        !address.lastName ||
        !address.phone ||
        !address.address ||
        !address.city ||
        !address.postalCode ||
        !address.country
      ) {
        alert("Please complete your shipping address.");
        return;
      }

      // Save address
      await saveAddress(address);

      // Load Razorpay SDK
      const loaded = await loadRazorpay();

      if (!loaded) {
        alert("Unable to load Razorpay.");
        return;
      }

      // Create Order
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total * 100,
        }),
      });

      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,

        name: "THRIFTX",
        description: "Order Payment",

        prefill: {
          name: `${address.firstName} ${address.lastName}`,
          email: address.email,
          contact: address.phone,
        },

        theme: {
          color: "#000000",
        },

        handler: async (response: any) => {
          try {
            const verify = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            });

            const data = await verify.json();
            console.log(cartProducts, "cartProducts");
            if (data.success) {
              await createOrder({
                subtotal,
                shipping,
                total,
                paymentId: data.paymentId,
                orderId: data.orderId,
                signature: response.razorpay_signature,
                // status: "Pending",
                firstName: address.firstName,
                lastName: address.lastName,
                phone: address.phone,
                address: address.address,
                city: address.city,
                postalCode: address.postalCode,
                country: address.country,
                deliveryMethod: "Standard",

                products: JSON.stringify(
                  cartProducts.map((item) => ({
                    id: item.id,
                    title: item.title,
                    image: item.image,
                    brand: item.brand,
                    size: item.measurements?.size ?? "",
                    quantity: item.quantity,
                    price: item.price,
                  }))
                ),
              });

              await clearCart();

              router.push("/success");
            } else {
              alert("Payment Verification Failed");
            }
          } catch (error: any) {
            console.error(error, "Payment Verification Error");

            alert(
              error?.message ||
              JSON.stringify(error) ||
              "Something went wrong"
            );
          }
        },
      };

      const razorpay = new (window as any).Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("Unable to start payment.");
    } finally {
      setPaymentLoading(false);
    }
  }

  function parsePrice(price: string | number) {
    if (typeof price === "number") {
      return price;
    }

    return Number(price.replace(/[^\d.]/g, "")) || 0;
  }

  const subtotal = useMemo(() => {
    return cartProducts.reduce(
      (sum, item) => sum + parsePrice(item.price) * item.quantity,
      0
    );
  }, [cartProducts]);

  const shipping = subtotal > 999 ? 0 : 99;

  const total = subtotal ? subtotal + shipping : 0;
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-5 md:px-16 py-6 sm:py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">

      {/* Left Column */}
      <div className="lg:col-span-8 flex flex-col gap-12">
        <nav className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-[#4c4546]">
          <Link href="/cart" className="text-black font-bold">Cart</Link>
          <ChevronRight className="w-4 h-4" />
          <span>Shipping</span>
          <ChevronRight className="w-4 h-4" />
          <span>Payment</span>
        </nav>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-black">Your Cart</h1>

        <div className="flex flex-col gap-6">
          {/* Cart Item 1 */}
          {paymentLoading ? (
            <div className="text-center py-20 text-gray-500">
              Loading cart...
            </div>
          ) : cartProducts.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-serif mb-3">Your cart is empty</h2>
              <Link
                href="/shop"
                className="inline-block mt-4 bg-black text-white px-6 py-3 rounded-xl"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            cartProducts.map((item) => (
              <div
                key={item.cartId}
                className="bg-white/70 backdrop-blur-xl border border-[#e5e5e5] p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center relative hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300"
              >
                <Link
                  href={`/product/${item.id}`}
                  className="w-full sm:w-28 aspect-[1/1.25] bg-[#eeeeee] rounded-xl overflow-hidden shrink-0 block"
                >
                  <Image
                    src={item.image || "/assets/placeholder.png"}
                    alt={item.title}
                    width={128}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-grow flex flex-col gap-2 w-full">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <Link
                        href={`/product/${item.id}`}
                        className="font-sans text-base sm:text-lg font-semibold text-black hover:underline"
                      >
                        {item.title}
                      </Link>

                      <p className="font-sans text-sm text-[#4c4546] mt-1">
                        {item.brand}
                      </p>
                    </div>

                    <span className="font-sans text-lg sm:text-xl font-bold text-black">
                      {item.price}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div className="flex items-center border border-[#cfc4c5] rounded-full px-3 sm:px-4 py-1.5">
                      <button
                        onClick={async () => {
                          if (item.quantity <= 1) return;

                          await updateCartQuantity(
                            item.cartId,
                            item.quantity - 1
                          );

                          loadCart();
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="font-sans text-sm mx-5 font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={async () => {
                          await updateCartQuantity(
                            item.cartId,
                            item.quantity + 1
                          );

                          loadCart();
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      className="ml-auto text-red-500"
                      onClick={async () => {
                        await removeCartItem(item.cartId);

                        loadCart();
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-semibold text-black mb-6">
            Shipping Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">
                First Name
              </label>
              <input
                type="text"
                value={address.firstName}
                onChange={(e) =>
                  setAddress({ ...address, firstName: e.target.value })
                }
                placeholder="First Name"
                className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={address.lastName}
                onChange={(e) =>
                  setAddress({ ...address, lastName: e.target.value })
                }
                placeholder="Last Name"
                className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={address.phone}
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
                placeholder="Phone Number"
                className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={address.email}
                onChange={(e) =>
                  setAddress({ ...address, email: e.target.value })
                }
                placeholder="Email Address"
                className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black outline-none transition-colors"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">
                Address
              </label>
              <input
                type="text"
                value={address.address}
                onChange={(e) =>
                  setAddress({ ...address, address: e.target.value })
                }
                placeholder="Street Address"
                className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">
                City
              </label>
              <input
                type="text"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                placeholder="City"
                className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                value={address.postalCode}
                onChange={(e) =>
                  setAddress({ ...address, postalCode: e.target.value })
                }
                placeholder="ZIP / Postal Code"
                className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black outline-none transition-colors"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">
                Country
              </label>
              <input
                type="text"
                value={address.country}
                onChange={(e) =>
                  setAddress({ ...address, country: e.target.value })
                }
                placeholder="Country"
                className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base focus:border-black outline-none transition-colors"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#4c4546] mb-2">
                Delivery Notes (Optional)
              </label>
              <textarea
                value={address.notes}
                onChange={(e) =>
                  setAddress({ ...address, notes: e.target.value })
                }
                rows={4}
                placeholder="Apartment, Landmark, Delivery Instructions..."
                className="w-full bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-4 font-sans text-base resize-none focus:border-black outline-none transition-colors"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Summary */}
      <div className="lg:col-span-4 mt-8 lg:mt-0">
        <div className="bg-white/70 backdrop-blur-xl border border-[#e5e5e5] p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] sticky top-24 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">
          <h2 className="font-serif text-2xl font-semibold text-black mb-6 border-b border-[#e5e5e5] pb-6">Order Summary</h2>
          <div className="flex flex-col gap-4 font-sans text-base text-[#4c4546] mb-8">
            <div className="flex justify-between">
              <span>
                Subtotal ({cartProducts.length} item
                {cartProducts.length !== 1 ? "s" : ""})
              </span>
              <span className="text-black font-semibold">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="text-black font-semibold">
                ₹{shipping.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-[#a17f3b]">
              <span>Discount</span>
              <span>-$0.00</span>
            </div>
          </div>
          <div className="border-t border-[#e5e5e5] pt-6 mb-8 flex justify-between items-end">
            <span className="font-sans text-xl font-bold text-black">Total</span>
            <span className="font-sans text-2xl font-bold text-black">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input type="text" placeholder="Promo code" className="flex-grow w-full min-w-0 bg-[#f3f3f3] border border-[#cfc4c5] rounded-xl p-3.5 font-sans text-base focus:border-black outline-none transition-colors" />
            <button className="bg-[#eeeeee] border border-[#cfc4c5] text-black text-xs font-semibold tracking-widest uppercase px-6 py-3.5 rounded-xl hover:bg-[#e2e2e2] transition-colors shrink-0">Apply</button>
          </div>
          <button
            onClick={handleProceedToCheckout}
            disabled={paymentLoading}
            className="w-full bg-black text-white font-sans text-lg font-medium py-5 rounded-2xl transition-all duration-200 hover:bg-black/90 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3"
          >
            {paymentLoading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>

                Preparing Payment...
              </>
            ) : (
              <>
                Proceed to Payment
                <Lock className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#7e7576] mt-6 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Secure Checkout
          </p>
        </div>
      </div>
    </div>
  );
}