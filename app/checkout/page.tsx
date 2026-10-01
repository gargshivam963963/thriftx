"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
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

import CheckoutAccordion, {
    type CheckoutStep,
} from "@/components/checkout/CheckoutAccordion";
import type { ShippingMethod } from "@/lib/shipping/checkout-options";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import { Button } from "@/components/ui/button";

import { useAddresses } from "@/hooks/useAddresses";
import { useAuth } from "@/lib/AuthContext";
import { useAnalytics } from "@/lib/analytics/AnalyticsContext";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { clearCart } from "@/lib/services/cart";
import {
    getCartProducts,
    type CartProduct,
} from "@/lib/services/cartProducts";
import { createOrder } from "@/lib/client/orders";
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
        <main className="min-h-screen bg-subtle">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
                <div className="space-y-4 sm:space-y-6">
                    <div className="h-36 animate-pulse rounded-2xl bg-muted sm:h-44 sm:rounded-[32px]" />
                    <div className="hidden sm:flex gap-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-8 w-24 animate-pulse rounded-full bg-muted"
                            />
                        ))}
                    </div>
                    <div className="grid gap-5 sm:gap-6 xl:grid-cols-[1fr_380px]">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-28 animate-pulse rounded-2xl bg-muted sm:h-36 sm:rounded-3xl"
                                />
                            ))}
                        </div>
                        <div className="hidden h-[500px] animate-pulse rounded-[28px] bg-muted xl:block" />
                    </div>
                </div>
            </div>
        </main>
    );
}

// ─── Empty Cart ───────────────────────────────────────────────────────────────

function EmptyCheckout() {
    return (
        <main className="min-h-screen bg-subtle">
            <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                    }}
                    className="rounded-full bg-muted p-5 sm:p-6"
                >
                    <ShoppingBag className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-5 text-2xl font-bold text-foreground sm:mt-6 sm:text-3xl"
                >
                    Nothing to checkout
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-3 max-w-md text-sm leading-6 text-muted-foreground"
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
                        className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-foreground px-8 text-sm font-medium text-white shadow-lg shadow-foreground/20 transition hover:opacity-90"
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
    const analytics = useAnalytics();

    const {
        addresses,
        loading: addressesLoading,
        createNewAddress,
        updateExistingAddress,
        deleteExistingAddress,
        setDefault,
    } = useAddresses(user?.id ?? "");

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

    // Shipping options are now fetched and auto-selected inside CheckoutAccordion
    // to avoid duplicating async calls and fixing Promise-based logic

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

            // Track purchase event for analytics
            analytics.trackPurchase({
                orderTotal: total,
                subtotal,
                shipping: shippingCost,
                paymentMethod: "cod",
                itemCount: cartItems.length,
                city: selectedAddress.city,
            });
            analytics.trackCheckoutComplete({
                orderTotal: total,
                paymentMethod: "cod",
            });

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
                body: JSON.stringify({
                    amount: total,
                    addressId: selectedAddress.$id,
                    deliveryMethod: shippingMethod.name,
                }),
            });

            const razorpayOrder = await response.json();
            if (!response.ok) {
                throw new Error(
                    razorpayOrder.error || "Failed to create payment order.",
                );
            }

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
                            addressId: selectedAddress.$id,
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

                        // Track purchase & checkout events for analytics
                        analytics.trackPurchase({
                            orderTotal: total,
                            subtotal,
                            shipping: shippingCost,
                            paymentMethod: "razorpay",
                            paymentId: paymentResponse.razorpay_payment_id,
                            itemCount: cartItems.length,
                            city: selectedAddress.city,
                        });
                        analytics.trackCheckoutComplete({
                            orderTotal: total,
                            paymentMethod: "razorpay",
                        });

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

    // Track checkout start when user arrives on checkout page
    const checkoutTrackedRef = useRef(false);
    useEffect(() => {
        if (cartItems.length > 0 && !checkoutTrackedRef.current) {
            checkoutTrackedRef.current = true;
            analytics.trackCheckoutStart({
                itemCount: cartItems.length,
                subtotal,
                total,
            });
        }
    }, [cartItems.length, subtotal, total, analytics]);

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
        <main className="min-h-screen bg-gradient-to-b from-subtle via-card to-subtle pb-28 xl:pb-10">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
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
                            subtotal={subtotal}
                        />

                        {/* ── What to Expect ──────────────────────────── */}
                        <motion.section
                            layout
                            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:rounded-[28px]"
                        >
                            <div className="flex items-center gap-2 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
                                <Sparkles
                                    size={16}
                                    className="text-muted-foreground"
                                />
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
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
                                                <h4 className="text-sm font-bold text-foreground sm:text-base">
                                                    {note.title}
                                                </h4>
                                                <p className="mt-0.5 text-xs leading-6 text-muted-foreground sm:text-sm">
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
                    className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] xl:hidden sm:px-6 sm:py-4"
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Total
                            </p>
                            <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                                ₹{total.toLocaleString("en-IN")}
                            </h3>
                            {shippingCost > 0 && (
                                <p className="text-[10px] text-muted-foreground">
                                    +₹{shippingCost.toLocaleString("en-IN")} shipping
                                </p>
                            )}
                            {shippingCost === 0 && (
                                <p className="text-[10px] text-emerald-600 font-medium">
                                    Free Shipping
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* COD button */}
                            <Button
                                type="button"
                                onClick={() => handlePay("cod")}
                                loading={paymentLoading && paymentMethod === "cod"}
                                disabled={!canPay}
                                size="md"
                                variant="outline"
                                className="rounded-xl px-3 text-xs sm:px-4 sm:text-sm"
                            >
                                COD
                            </Button>
                            {/* Pay Online button */}
                            <Button
                                type="button"
                                onClick={() => handlePay("razorpay")}
                                loading={paymentLoading && paymentMethod === "razorpay"}
                                disabled={!canPay}
                                size="lg"
                                leftIcon={<CreditCard className="h-5 w-5" />}
                                className="rounded-xl px-5 shadow-lg shadow-foreground/20 sm:rounded-2xl sm:px-7"
                            >
                                {paymentLoading ? "Processing..." : "Pay"}
                            </Button>
                        </div>
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
