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
} from "lucide-react";
import { toast } from "sonner";

import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutAccordion, {
    type CheckoutStep,
    type ShippingMethod,
} from "@/components/checkout/CheckoutAccordion";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";

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
        icon: Check,
        title: "Tracking Included",
        description: "Tracking ID will be shared via email/SMS after dispatch.",
    },
    {
        icon: ShieldCheck,
        title: "Easy Returns",
        description: "Returns follow THRIFTX return policy within 7 days.",
    },
];

function parsePrice(value: number | string) {
    return Number(String(value).replace(/[^\d.]/g, ""));
}

function splitFullName(fullName: string) {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");
    return { firstName, lastName };
}

function formatDeliveryAddress(address: Address) {
    return [address.addressLine1, address.addressLine2, address.landmark]
        .filter(Boolean)
        .join(", ");
}

// Skeleton component for loading state
function CheckoutSkeleton() {
    return (
        <main className="min-h-screen bg-zinc-50">
            <Container className="py-5 sm:py-8">
                <div className="space-y-4 sm:space-y-6">
                    {/* Header skeleton */}
                    <div className="h-32 sm:h-48 animate-pulse rounded-2xl sm:rounded-[32px] bg-zinc-200" />

                    {/* Step indicator skeleton */}
                    <div className="hidden sm:flex gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-zinc-200" />
                        ))}
                    </div>

                    {/* Content skeleton */}
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-28 sm:h-36 animate-pulse rounded-3xl bg-zinc-200" />
                            ))}
                        </div>
                        <div className="hidden xl:block h-[520px] animate-pulse rounded-[28px] bg-zinc-200" />
                    </div>
                </div>
            </Container>
        </main>
    );
}

// Empty cart UI
function EmptyCheckout() {
    return (
        <main className="min-h-screen bg-zinc-50">
            <Container className="flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-zinc-100 p-5 sm:p-6">
                    <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-400" />
                </div>
                <h1 className="mt-5 sm:mt-6 font-serif text-2xl sm:text-3xl font-semibold text-zinc-900">
                    Nothing to checkout
                </h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
                    Your cart is empty. Add some curated thrift pieces before completing
                    your order.
                </p>
                <Link
                    href="/shop"
                    className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-zinc-900 px-8 text-sm font-medium text-white transition hover:opacity-90 shadow-lg shadow-zinc-900/20"
                >
                    Browse Shop
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Container>
        </main>
    );
}

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
        null
    );
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(
        null
    );
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
        null
    );

    const selectedAddress = useMemo<Address | null>(() => {
        if (!addresses.length) return null;
        if (selectedAddressId) {
            return addresses.find((address) => address.$id === selectedAddressId) ?? null;
        }
        return addresses.find((address) => address.isDefault) ?? addresses[0];
    }, [addresses, selectedAddressId]);

    const loadCart = useCallback(async () => {
        try {
            setCartLoading(true);
            if (authLoading) return;
            if (!user) {
                setCartItems([]);
                return;
            }
            const products = await getCartProducts();
            setCartItems(products);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load cart.");
        } finally {
            setCartLoading(false);
        }
    }, [authLoading, user]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login?redirect=/checkout");
        }
    }, [authLoading, user, router]);

    const subtotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            return total + parsePrice(item.price) * item.quantity;
        }, 0);
    }, [cartItems]);

    const shippingCost = shippingMethod?.price ?? 0;
    const total = subtotal + shippingCost;
    const canPay = Boolean(cartItems.length > 0 && selectedAddress && shippingMethod);

    const handleAddressSave = async (
        data: CreateAddressPayload,
        addressId?: string
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
                }))
            );

            const { firstName, lastName } = splitFullName(selectedAddress.fullName);

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
            toast.success("Order placed successfully! Pay on delivery.");
            router.push("/success");
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
            const { firstName, lastName } = splitFullName(selectedAddress.fullName);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "THRIFTX",
                description: "Premium Thrift Fashion",
                order_id: razorpayOrder.id,
                handler: async (paymentResponse: Record<string, string>) => {
                    try {
                        const verifyResponse = await fetch("/api/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(paymentResponse),
                        });

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
                            }))
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
                        router.push("/success");
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
        <main className="min-h-screen bg-zinc-50 pb-28 xl:pb-10">
            <Container className="py-4 sm:py-5 lg:py-8">
                <CheckoutHeader />

                <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start">
                    {/* Left Column - Checkout Flow */}
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

                        {/* What to Expect Section */}
                        <motion.section
                            layout
                            className="overflow-hidden rounded-2xl sm:rounded-[28px] border border-zinc-200 bg-white shadow-sm"
                        >
                            <div className="border-b border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                                    Before You Place Order
                                </p>
                                <h2 className="mt-1.5 sm:mt-2 font-serif text-lg sm:text-xl font-bold text-zinc-900">
                                    What to expect
                                </h2>
                            </div>

                            <div className="space-y-3 sm:space-y-4 p-5 sm:p-6">
                                {orderNotes.map((note) => {
                                    const Icon = note.icon;
                                    return (
                                        <div
                                            key={note.title}
                                            className="flex items-start gap-3 sm:gap-4"
                                        >
                                            <div className="mt-0.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-100">
                                                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm sm:text-base font-semibold text-zinc-900">
                                                    {note.title}
                                                </h4>
                                                <p className="mt-0.5 text-xs sm:text-sm leading-6 text-zinc-500">
                                                    {note.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.section>
                    </div>

                    {/* Right Column - Order Summary (Desktop) */}
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

                {/* Mobile Bottom Bar */}
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 p-4 backdrop-blur-xl xl:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
                >
                    <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                Total
                            </p>
                            <h3 className="font-serif text-xl sm:text-2xl font-bold text-zinc-900">
                                ₹{total.toLocaleString("en-IN")}
                            </h3>
                            {shippingCost > 0 && (
                                <p className="text-[10px] text-zinc-400">
                                    +₹{shippingCost.toLocaleString("en-IN")} shipping
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
                            className="rounded-2xl px-6 sm:px-7 shadow-lg shadow-zinc-900/20"
                        >
                            {paymentLoading ? "Processing..." : "Pay Now"}
                        </Button>
                    </div>

                    {!canPay && (
                        <p className="mt-2 text-center text-[11px] text-amber-600">
                            Please complete address and shipping details to proceed
                        </p>
                    )}
                </motion.div>
            </Container>
        </main>
    );
}

