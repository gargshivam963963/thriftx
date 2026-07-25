"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check,
    CreditCard,
    IndianRupee,
    ShoppingBag,
    ArrowRight,
    ShieldCheck,
    Package,
    Sparkles,
    Truck,
    RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutAccordion, {
    type CheckoutStep,
    type ShippingMethod,
    getShippingOptionsForCity,
} from "@/components/checkout/CheckoutAccordion";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import { Button } from "@/components/ui/button";

import { useAddresses } from "@/hooks/useAddresses";
import { useAuth } from "@/lib/AuthContext";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { clearCart } from "@/lib/services/cart";
import {
    getCartProducts,
    type CartProduct,
} from "@/lib/services/cartProducts";
import { createOrder } from "@/lib/services/orderService";
import type { Address, CreateAddressPayload } from "@/lib/types/address";
import type { PaymentMethod } from "@/lib/types/order";

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => {
            open: () => void;
        };
    }
}

const orderNotes = [
    {
        icon: Check,
        title: "Quality Checked",
        description: "Every thrift piece is individually inspected for quality.",
    },
    {
        icon: Package,
        title: "Professionally Packed",
        description: "Items are steamed, folded, and packed with care.",
    },
    {
        icon: Truck,
        title: "Tracking Included",
        description: "Tracking ID shared via email/SMS after dispatch.",
    },
    {
        icon: RotateCcw,
        title: "Easy Returns",
        description: "Returns follow THRIFTX policy within 7 days.",
    },
];

function parsePrice(value: number | string) {
    return Number(String(value).replace(/[^\d.]/g, ""));
}

function splitFullName(fullName: string) {
    const parts = fullName.trim().split(/\s+/);
    return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

function formatDeliveryAddress(address: Address) {
    return [address.addressLine1, address.addressLine2, address.landmark]
        .filter(Boolean)
        .join(", ");
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CheckoutSkeleton() {
    return (
        <main className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
                <div className="space-y-4 sm:space-y-6">
                    <div className="h-36 animate-pulse rounded-2xl bg-zinc-200 sm:h-44 sm:rounded-[32px]" />
                    <div className="hidden sm:flex gap-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-8 w-24 animate-pulse rounded-full bg-zinc-200"
                            />
                        ))}
                    </div>
                    <div className="grid gap-5 sm:gap-6 xl:grid-cols-[1fr_380px]">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-28 animate-pulse rounded-2xl bg-zinc-200 sm:h-36 sm:rounded-3xl"
                                />
                            ))}
                        </div>
                        <div className="hidden h-[500px] animate-pulse rounded-[28px] bg-zinc-200 xl:block" />
                    </div>
                </div>
            </div>
        </main>
    );
}

// ─── Empty Cart ───────────────────────────────────────────────────────────────

function EmptyCheckout() {
    return (
        <main className="min-h-screen bg-zinc-50">
            <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                    }}
                    className="rounded-full bg-zinc-100 p-5 sm:p-6"
                >
                    <ShoppingBag className="h-8 w-8 text-zinc-400 sm:h-10 sm:w-10" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-5 font-serif text-2xl font-semibold text-zinc-900 sm:mt-6 sm:text-3xl"
                >
                    Nothing to checkout
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-3 max-w-md text-sm leading-6 text-zinc-500"
                >
                    Your cart is empty. Add some curated thrift pieces before
                    completing your order.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Link
                        href="/shop"
                        className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-zinc-900 px-8 text-sm font-medium text-white shadow-lg shadow-zinc-900/20 transition hover:opacity-90"
                    >
                        Browse Shop
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const {
        addresses,
        loading: addressesLoading,
        createNewAddress,
        updateExistingAddress,
        deleteExistingAddress,
        setDefault,
    } = useAddresses(user?.$id ?? "");

    const [cartItems, setCartItems] = useState<CartProduct[]>([]);
    const [cartLoading, setCartLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [activeStep, setActiveStep] = useState<CheckoutStep>("address");
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
        null,
    );
    const [shippingMethod, setShippingMethod] =
        useState<ShippingMethod | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
        null,
    );

    const selectedAddress = useMemo<Address | null>(() => {
        if (!addresses.length) return null;
        if (selectedAddressId) {
            return (
                addresses.find((address) => address.$id === selectedAddressId) ??
                null
            );
        }
        return addresses.find((address) => address.isDefault) ?? addresses[0];
    }, [addresses, selectedAddressId]);

    useEffect(() => {
        let mounted = true;

        async function initCart() {
            if (authLoading || !user) {
                setCartItems([]);
                setCartLoading(false);
                return;
            }
            try {
                const products = await getCartProducts();
                if (mounted) setCartItems(products);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load cart.");
            } finally {
                if (mounted) setCartLoading(false);
            }
        }

        initCart();

        return () => {
            mounted = false;
        };
    }, [authLoading, user]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login?redirect=/checkout");
        }
    }, [authLoading, user, router]);

    const subtotal = useMemo(() => {
        return cartItems.reduce(
            (total, item) => total + parsePrice(item.price) * item.quantity,
            0,
        );
    }, [cartItems]);

    const shippingCost = shippingMethod?.price ?? 0;
    const total = subtotal + shippingCost;
    const canPay = Boolean(
        cartItems.length > 0 && selectedAddress && shippingMethod,
    );

    // Auto-select shipping when address changes
    useEffect(() => {
        if (selectedAddress) {
            const availableOptions = getShippingOptionsForCity(
                selectedAddress.city,
                selectedAddress.pincode,
            );
            if (
                shippingMethod &&
                !availableOptions.find((o) => o.id === shippingMethod.id)
            ) {
                setShippingMethod(availableOptions[0]);
                setActiveStep("payment");
            }
            // Auto-select first option if none selected
            if (!shippingMethod && availableOptions.length > 0) {
                setShippingMethod(availableOptions[0]);
            }
        }
    }, [selectedAddress?.city, selectedAddress?.pincode]);

    const handleAddressSave = async (
        data: CreateAddressPayload,
        addressId?: string,
    ) => {
        if (addressId) {
            await updateExistingAddress(addressId, data);
            setSelectedAddressId(addressId);
            await setDefault(addressId);
        } else {
            const created = await createNewAddress(data);
            setSelectedAddressId(created.$id);
            await setDefault(created.$id);
        }
    };

    const handleAddressDelete = async (address: Address) => {
        await deleteExistingAddress(address.$id);
        if (selectedAddressId === address.$id) {
            setSelectedAddressId(null);
        }
    };

    async function handleCODOrder() {
        if (!user || !selectedAddress || !shippingMethod) return;

        try {
            setPaymentLoading(true);

            const products = JSON.stringify(
                cartItems.map((item) => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.primaryImage,
                    size: item.size,
                })),
            );

            const { firstName, lastName } = splitFullName(
                selectedAddress.fullName,
            );

            await createOrder({
                subtotal,
                shipping: shippingCost,
                total,
                paymentMethod: "cod",
                firstName,
                lastName,
                phone: selectedAddress.phone,
                address: formatDeliveryAddress(selectedAddress),
                city: selectedAddress.city,
                postalCode: selectedAddress.pincode,
                country: "India",
                deliveryMethod: shippingMethod.name,
                products,
            });

            await clearCart();
            toast.success("Order placed! Pay on delivery.");
            router.push(
                `/success?city=${encodeURIComponent(selectedAddress.city)}&pincode=${selectedAddress.pincode}&items=${cartItems.length}`,
            );
        } catch (error) {
            console.error(error);
            toast.error("Failed to place COD order.");
        } finally {
            setPaymentLoading(false);
        }
    }

    async function handleRazorpayPayment() {
        if (!user || !selectedAddress || !shippingMethod) return;

        try {
            setPaymentLoading(true);

            const sdkLoaded = await loadRazorpay();
            if (!sdkLoaded) {
                toast.error("Unable to load payment gateway.");
                return;
            }

            const response = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: total }),
            });

            if (!response.ok) {
                throw new Error("Failed to create payment order.");
            }

            const razorpayOrder = await response.json();
            const { firstName, lastName } = splitFullName(
                selectedAddress.fullName,
            );

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "THRIFTX",
                description: "Premium Thrift Fashion",
                order_id: razorpayOrder.id,
                handler: async (paymentResponse: Record<string, string>) => {
                    try {
                        const verifyResponse = await fetch(
                            "/api/payment/verify",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(paymentResponse),
                            },
                        );

                        const verification = await verifyResponse.json();
                        if (!verification.success) {
                            throw new Error("Payment verification failed.");
                        }

                        const products = JSON.stringify(
                            cartItems.map((item) => ({
                                id: item.id,
                                title: item.title,
                                price: item.price,
                                quantity: item.quantity,
                                image: item.primaryImage,
                                size: item.size,
                            })),
                        );

                        await createOrder({
                            subtotal,
                            shipping: shippingCost,
                            total,
                            paymentMethod: "razorpay",
                            paymentId: paymentResponse.razorpay_payment_id,
                            orderId: paymentResponse.razorpay_order_id,
                            signature: paymentResponse.razorpay_signature,
                            firstName,
                            lastName,
                            phone: selectedAddress.phone,
                            address: formatDeliveryAddress(selectedAddress),
                            city: selectedAddress.city,
                            postalCode: selectedAddress.pincode,
                            country: "India",
                            deliveryMethod: shippingMethod.name,
                            products,
                        });

                        await clearCart();
                        toast.success("Order placed successfully!");
                        router.push(
                            `/success?city=${encodeURIComponent(selectedAddress.city)}&pincode=${selectedAddress.pincode}&items=${cartItems.length}`,
                        );
                    } catch (error) {
                        console.error(error);
                        toast.error("Payment verification failed.");
                    }
                },
                prefill: {
                    name: selectedAddress.fullName,
                    email: user.email ?? "",
                    contact: selectedAddress.phone,
                },
                theme: { color: "#000000" },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error(error);
            toast.error("Unable to initiate payment.");
        } finally {
            setPaymentLoading(false);
        }
    }

    const handlePay = async (method: PaymentMethod) => {
        if (!user) {
            toast.error("Please login to continue.");
            router.push("/login?redirect=/checkout");
            return;
        }

        if (!cartItems.length) {
            toast.error("Your cart is empty.");
            router.push("/cart");
            return;
        }

        if (!selectedAddress) {
            toast.error("Please select a delivery address.");
            setActiveStep("address");
            return;
        }

        if (!shippingMethod) {
            toast.error("Please select a shipping method.");
            setActiveStep("shipping");
            return;
        }

        setPaymentMethod(method);

        if (method === "cod") {
            await handleCODOrder();
        } else {
            await handleRazorpayPayment();
        }
    };

    if (authLoading || cartLoading) {
        return <CheckoutSkeleton />;
    }

    if (!cartItems.length) {
        return <EmptyCheckout />;
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 pb-28 xl:pb-10">
            <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
                <CheckoutHeader />

                <div className="grid gap-5 sm:gap-6 xl:grid-cols-[1fr_380px] xl:items-start">
                    {/* ── Left Column – Checkout Flow ──────────────────── */}
                    <div className="space-y-4 sm:space-y-5">
                        <CheckoutAccordion
                            activeStep={activeStep}
                            onStepChange={setActiveStep}
                            addresses={addresses}
                            addressesLoading={addressesLoading}
                            selectedAddressId={selectedAddressId}
                            onAddressSelect={setSelectedAddressId}
                            onAddressSave={handleAddressSave}
                            onAddressDelete={handleAddressDelete}
                            shippingMethod={shippingMethod}
                            onShippingSelect={setShippingMethod}
                            paymentLoading={paymentLoading}
                            canPay={canPay}
                            onPay={handlePay}
                            paymentMethod={paymentMethod}
                            onPaymentMethodChange={setPaymentMethod}
                        />

                        {/* ── What to Expect ──────────────────────────── */}
                        <motion.section
                            layout
                            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm sm:rounded-[28px]"
                        >
                            <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
                                <Sparkles
                                    size={16}
                                    className="text-zinc-400"
                                />
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px]">
                                    Before You Place Order
                                </p>
                            </div>

                            <div className="space-y-3 p-5 sm:space-y-4 sm:p-6">
                                {orderNotes.map((note, index) => {
                                    const Icon = note.icon;
                                    return (
                                        <motion.div
                                            key={note.title}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: 0.05 * index,
                                                duration: 0.25,
                                            }}
                                            className="flex items-start gap-3 sm:gap-4"
                                        >
                                            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 sm:h-8 sm:w-8">
                                                <Icon className="h-3.5 w-3.5 text-emerald-600 sm:h-4 sm:w-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-zinc-900 sm:text-base">
                                                    {note.title}
                                                </h4>
                                                <p className="mt-0.5 text-xs leading-6 text-zinc-500 sm:text-sm">
                                                    {note.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.section>
                    </div>

                    {/* ── Right Column – Order Summary (Desktop) ──────── */}
                    <div className="hidden xl:block">
                        <CheckoutOrderSummary
                            items={cartItems}
                            subtotal={subtotal}
                            shippingCost={shippingCost}
                            total={total}
                            paymentLoading={paymentLoading}
                            canPay={canPay}
                            onPay={() => handlePay("razorpay")}
                        />
                    </div>
                </div>

                {/* ── Mobile Bottom Bar ────────────────────────────────── */}
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] xl:hidden sm:px-6 sm:py-4"
                >
                    <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                Total
                            </p>
                            <h3 className="font-serif text-xl font-bold text-zinc-900 sm:text-2xl">
                                ₹{total.toLocaleString("en-IN")}
                            </h3>
                            {shippingCost > 0 && (
                                <p className="text-[10px] text-zinc-400">
                                    +₹{shippingCost.toLocaleString("en-IN")} shipping
                                </p>
                            )}
                            {shippingCost === 0 && (
                                <p className="text-[10px] text-emerald-600 font-medium">
                                    Free Shipping
                                </p>
                            )}
                        </div>

                        <Button
                            type="button"
                            onClick={() => handlePay("razorpay")}
                            loading={paymentLoading}
                            disabled={!canPay}
                            size="lg"
                            leftIcon={<CreditCard className="h-5 w-5" />}
                            className="rounded-xl px-5 shadow-lg shadow-zinc-900/20 sm:rounded-2xl sm:px-7"
                        >
                            {paymentLoading ? "Processing..." : "Pay Now"}
                        </Button>
                    </div>

                    {!canPay && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 text-center text-[11px] text-amber-600"
                        >
                            Please complete address &amp; shipping to proceed
                        </motion.p>
                    )}
                </motion.div>
            </div>
        </main>
    );
}

