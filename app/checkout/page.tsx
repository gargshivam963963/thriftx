"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, CreditCard, ShoppingBag } from "lucide-react";
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

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => {
            open: () => void;
        };
    }
}

const orderNotes = [
    "Every thrift piece is individually quality checked.",
    "Items are professionally steamed and packed.",
    "Tracking ID will be shared after dispatch.",
    "Returns follow THRIFTX return policy.",
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
    return [
        address.addressLine1,
        address.addressLine2,
        address.landmark,
    ]
        .filter(Boolean)
        .join(", ");
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
        null,
    );
    const [shippingMethod, setShippingMethod] =
        useState<ShippingMethod | null>(null);

    const selectedAddress = useMemo<Address | null>(() => {
        if (!addresses.length) {
            return null;
        }

        if (selectedAddressId) {
            return (
                addresses.find((address) => address.$id === selectedAddressId) ??
                null
            );
        }

        return addresses.find((address) => address.isDefault) ?? addresses[0];
    }, [addresses, selectedAddressId]);

    const loadCart = useCallback(async () => {
        try {
            setCartLoading(true);

            if (authLoading) {
                return;
            }

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
        if (authLoading) {
            return;
        }

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

    const canPay = Boolean(
        cartItems.length > 0 && selectedAddress && shippingMethod,
    );

    const handleAddressSave = async (data: CreateAddressPayload, addressId?: string) => {
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

    const handlePay = async () => {
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

        try {
            setPaymentLoading(true);

            const sdkLoaded = await loadRazorpay();

            if (!sdkLoaded) {
                toast.error("Unable to load payment gateway.");
                return;
            }

            const response = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: total,
                }),
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
                            paymentId:
                                paymentResponse.razorpay_payment_id,
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
                theme: {
                    color: "#000000",
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error(error);
            toast.error("Unable to initiate payment.");
        } finally {
            setPaymentLoading(false);
        }
    };

    if (authLoading || cartLoading) {
        return (
            <main className="min-h-screen bg-neutral-50">
                <Container className="py-8">
                    <div className="space-y-4">
                        <div className="h-40 animate-pulse rounded-[32px] bg-neutral-200" />
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
                            <div className="space-y-4">
                                <div className="h-36 animate-pulse rounded-3xl bg-neutral-200" />
                                <div className="h-36 animate-pulse rounded-3xl bg-neutral-200" />
                                <div className="h-36 animate-pulse rounded-3xl bg-neutral-200" />
                            </div>
                            <div className="h-[480px] animate-pulse rounded-[28px] bg-neutral-200" />
                        </div>
                    </div>
                </Container>
            </main>
        );
    }

    if (!cartItems.length) {
        return (
            <main className="min-h-screen bg-neutral-50">
                <Container className="flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-neutral-100 p-6">
                        <ShoppingBag className="h-10 w-10 text-neutral-400" />
                    </div>
                    <h1 className="mt-6 font-serif text-3xl font-semibold">
                        Nothing to checkout
                    </h1>
                    <p className="mt-3 max-w-md text-neutral-500">
                        Your cart is empty. Add some curated thrift pieces
                        before completing your order.
                    </p>
                    <Link
                        href="/shop"
                        className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-black px-8 text-sm font-medium text-white transition hover:opacity-90"
                    >
                        Browse Shop
                    </Link>
                </Container>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-50 pb-28 xl:pb-10">
            <Container className="py-5 lg:py-8">
                <CheckoutHeader />

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start">
                    <div className="space-y-5">
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
                        />

                        <motion.section
                            layout
                            className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm"
                        >
                            <div className="border-b border-neutral-100 px-6 py-5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                    Before You Place Order
                                </p>
                                <h2 className="mt-2 text-xl font-bold">
                                    What to expect
                                </h2>
                            </div>

                            <div className="space-y-4 p-6">
                                {orderNotes.map((note) => (
                                    <div
                                        key={note}
                                        className="flex items-start gap-3"
                                    >
                                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                        <p className="text-sm leading-7 text-neutral-600">
                                            {note}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    </div>

                    <CheckoutOrderSummary
                        items={cartItems}
                        subtotal={subtotal}
                        shippingCost={shippingCost}
                        total={total}
                        paymentLoading={paymentLoading}
                        canPay={canPay}
                        onPay={handlePay}
                    />
                </div>

                <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 p-4 backdrop-blur-xl xl:hidden">
                    <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                                Total
                            </p>
                            <h3 className="text-2xl font-bold">
                                ₹{total.toLocaleString("en-IN")}
                            </h3>
                        </div>

                        <Button
                            type="button"
                            onClick={handlePay}
                            loading={paymentLoading}
                            disabled={!canPay}
                            size="lg"
                            leftIcon={<CreditCard className="h-5 w-5" />}
                            className="rounded-2xl px-7"
                        >
                            Pay Now
                        </Button>
                    </div>
                </div>
            </Container>
        </main>
    );
}
