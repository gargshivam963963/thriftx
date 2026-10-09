"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingBag,
    ArrowRight,
    LockKeyhole,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import CheckoutAccordion, {
    type CheckoutStep,
} from "@/components/checkout/CheckoutAccordion";
import type { ShippingMethod } from "@/lib/shipping/checkout-options";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import CheckoutPayBar from "@/components/checkout/CheckoutPayBar";
import PanipatDeliveryPromo from "@/components/marketing/PanipatDeliveryPromo";
import { Button } from "@/components/ui/button";

import { useAddresses } from "@/hooks/useAddresses";
import { detectDeliveryZone } from "@/lib/delivery";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { useAnalytics } from "@/lib/analytics/AnalyticsContext";
import { loadRazorpay } from "@/lib/loadRazorpay";
import {
    createOrder,
    getCheckoutQuote,
    releaseCheckoutReservation,
    type CheckoutQuote,
} from "@/lib/client/orders";
import type { Address, CreateAddressPayload } from "@/lib/types/address";
import type { PaymentMethod } from "@/lib/types/order";

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => {
            open: () => void;
        };
    }
}

function parsePrice(value: number | string) {
    return Number(String(value).replace(/[^\d.]/g, ""));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * CheckoutSkeleton — mirrors the real mobile-first layout so the page does not
 * jump when data resolves (no layout shift).
 */
function CheckoutSkeleton() {
    return (
        <main
            className="min-h-screen bg-background"
            aria-busy="true"
            aria-label="Loading checkout"
        >
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                <div className="space-y-5 sm:space-y-6">
                    {/* Breadcrumb + title */}
                    <div className="space-y-3">
                        <div className="skeleton-glass h-3 w-24 rounded-full" />
                        <div className="skeleton-glass h-8 w-56 max-w-full rounded-lg" />
                        <div className="skeleton-glass h-4 w-72 max-w-full rounded" />
                    </div>

                    {/* Panipat promo */}
                    <div className="skeleton-glass h-24 rounded-2xl sm:rounded-3xl" />

                    {/* Mobile summary */}
                    <div className="skeleton-glass h-16 rounded-2xl lg:hidden" />

                    {/* Steps + desktop summary */}
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="space-y-3">
                            <div className="skeleton-glass h-20 rounded-2xl sm:rounded-3xl" />
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="skeleton-glass h-16 rounded-2xl sm:rounded-3xl"
                                />
                            ))}
                        </div>

                        <div className="skeleton-glass hidden h-96 rounded-3xl lg:block" />
                    </div>
                </div>
            </div>
        </main>
    );
}

// ─── Empty Cart ───────────────────────────────────────────────────────────────

function EmptyCheckout() {
    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                    }}
                    className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground sm:size-20"
                >
                    <ShoppingBag className="size-8 sm:size-10" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6 text-h3 font-bold text-foreground"
                >
                    Your cart is empty
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-2 text-body text-muted-foreground"
                >
                    Add a few curated thrift pieces to start your order.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-7 w-full sm:w-auto"
                >
                    <Button asChild size="lg" fullWidth>
                        <Link href="/shop">
                            Browse shop
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </motion.div>

                {/* Keep the delivery promise visible at the decision point. */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-8 w-full"
                >
                    <PanipatDeliveryPromo
                        variant="compact"
                        showCta={false}
                    />
                </motion.div>
            </div>
        </main>
    );
}

function CheckoutCartError({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <main className="min-h-screen bg-background px-4 py-12 sm:px-6">
            <section
                className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center sm:p-12"
                role="alert"
            >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-bg text-error">
                    <AlertCircle aria-hidden="true" size={26} />
                </span>
                <h1 className="mt-5 text-heading-3 font-bold text-foreground">
                    We couldn&apos;t verify your cart
                </h1>
                <p className="mt-2 max-w-md text-body-sm text-muted-foreground">
                    {message} Your items have not been confirmed as missing.
                </p>
                <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    leftIcon={<RefreshCw size={16} />}
                    onClick={onRetry}
                    className="mt-6"
                >
                    Retry
                </Button>
                <Link
                    href="/cart"
                    className="mt-4 text-body-sm font-semibold text-foreground underline underline-offset-4"
                >
                    Return to cart
                </Link>
            </section>
        </main>
    );
}

function CheckoutSessionError({
    onRetry,
}: {
    onRetry: () => void;
}) {
    return (
        <main className="min-h-screen bg-background px-4 py-12 sm:px-6">
            <section
                className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center sm:p-12"
                role="alert"
            >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-bg text-warning-foreground">
                    <LockKeyhole aria-hidden="true" size={26} />
                </span>
                <h1 className="mt-5 text-heading-3 font-bold text-foreground">
                    Sign-in check is taking longer than expected
                </h1>
                <p className="mt-2 max-w-md text-body-sm text-muted-foreground">
                    We need to verify your account before loading checkout. Your
                    order has not been placed.
                </p>
                <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    leftIcon={<RefreshCw size={16} />}
                    onClick={onRetry}
                    className="mt-6"
                >
                    Retry sign-in check
                </Button>
                <Link
                    href="/login?redirect=/checkout"
                    className="mt-4 text-body-sm font-semibold text-foreground underline underline-offset-4"
                >
                    Sign in
                </Link>
            </section>
        </main>
    );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
    const router = useRouter();
    const {
        user,
        loading: authLoading,
        refreshUser,
    } = useAuth();
    const {
        cartItems,
        loading: cartLoading,
        error: cartError,
        refreshCart,
        clearCart,
    } = useCart();
    const analytics = useAnalytics();

    const {
        addresses,
        loading: addressesLoading,
        createNewAddress,
        updateExistingAddress,
        deleteExistingAddress,
        setDefault,
    } = useAddresses(user?.id ?? "");

    const [paymentLoading, setPaymentLoading] = useState(false);
    const [authWaitExpired, setAuthWaitExpired] = useState(false);
    const [checkoutQuote, setCheckoutQuote] =
        useState<CheckoutQuote | null>(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState("");
    const [quoteRefresh, setQuoteRefresh] = useState(0);
    const [couponCode, setCouponCode] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const quoteRequestRef = useRef(0);
    const codIdempotencyKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            setAuthWaitExpired(false);
            return;
        }

        const timeoutId = setTimeout(() => setAuthWaitExpired(true), 10_000);
        return () => clearTimeout(timeoutId);
    }, [authLoading]);

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
        setCouponCode(
            window.sessionStorage.getItem("thriftx:checkout-coupon") ?? "",
        );
        setReferralCode(
            window.localStorage.getItem("thriftx:referral-code") ?? "",
        );
    }, []);

    useEffect(() => {
        const requestId = ++quoteRequestRef.current;
        setCheckoutQuote(null);
        setQuoteError("");

        if (!selectedAddress || !shippingMethod) {
            setQuoteLoading(false);
            return;
        }

        setQuoteLoading(true);
        void getCheckoutQuote({
            addressId: selectedAddress.$id,
            deliveryMethod: shippingMethod.name,
            ...(couponCode ? { couponCode } : {}),
            ...(referralCode ? { referralCode } : {}),
        })
            .then((quote) => {
                if (requestId === quoteRequestRef.current) {
                    setCheckoutQuote(quote);
                }
            })
            .catch((error: unknown) => {
                if (requestId === quoteRequestRef.current) {
                    setQuoteError(
                        error instanceof Error
                            ? error.message
                            : "Unable to confirm current pricing.",
                    );
                }
            })
            .finally(() => {
                if (requestId === quoteRequestRef.current) {
                    setQuoteLoading(false);
                }
            });

        return () => {
            quoteRequestRef.current += 1;
        };
    }, [selectedAddress, shippingMethod, couponCode, referralCode, quoteRefresh]);

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

    const serverSubtotal = checkoutQuote?.subtotal ?? 0;
    const shippingCost = checkoutQuote?.shipping ?? 0;
    const total = checkoutQuote?.total ?? 0;
    const canPay = Boolean(
        cartItems.length > 0 &&
        selectedAddress &&
        shippingMethod &&
        checkoutQuote &&
        !quoteLoading &&
        !quoteError,
    );

    // Whether the selected address qualifies for THRIFTX self-delivery.
    // The Panipat promo banner only renders for local addresses —
    // non-Panipat customers go straight to courier, no banner noise.
    const isLocalAddress =
        selectedAddress != null &&
        detectDeliveryZone(
            selectedAddress.city,
            selectedAddress.pincode,
        ) === "local";
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

            codIdempotencyKeyRef.current ??= crypto.randomUUID();

            const order = await createOrder({
                paymentMethod: "cod",
                addressId: selectedAddress.$id,
                deliveryMethod: shippingMethod.name,
                ...(couponCode ? { couponCode } : {}),
                ...(referralCode ? { referralCode } : {}),
                idempotencyKey: codIdempotencyKeyRef.current,
            });

            codIdempotencyKeyRef.current = null;
            try {
                await clearCart();
            } catch (error) {
                console.error("Order created, but cart cleanup failed:", error);
                toast.error(
                    "Your order is confirmed, but your cart could not be cleared.",
                );
            }
            window.sessionStorage.removeItem("thriftx:checkout-coupon");
            window.localStorage.removeItem("thriftx:referral-code");
            toast.success("Order placed! Pay on delivery.");

            // Track purchase event for analytics
            analytics.trackPurchase({
                orderTotal: total,
                subtotal: serverSubtotal,
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
                `/success?id=${encodeURIComponent(order.$id)}`,
            );
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to place COD order.",
            );
        } finally {
            setPaymentLoading(false);
        }
    }

    async function handleRazorpayPayment() {
        if (!user || !selectedAddress || !shippingMethod) return;

        let paymentModalOpened = false;
        let reservationId = "";
        let razorpayOrderId = "";
        let paymentConfirmed = false;
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
                    addressId: selectedAddress.$id,
                    deliveryMethod: shippingMethod.name,
                    ...(couponCode ? { couponCode } : {}),
                    ...(referralCode ? { referralCode } : {}),
                }),
            });

            const razorpayOrder = await response.json();
            if (!response.ok) {
                throw new Error(
                    razorpayOrder.error || "Failed to create payment order.",
                );
            }

            if (typeof razorpayOrder.reservationId === "string") {
                reservationId = razorpayOrder.reservationId;
            }
            if (typeof razorpayOrder.id === "string") {
                razorpayOrderId = razorpayOrder.id;
            }
            const authoritativeQuote =
                razorpayOrder.quote as CheckoutQuote | undefined;
            if (
                !authoritativeQuote ||
                !checkoutQuote ||
                authoritativeQuote.total !== checkoutQuote.total ||
                authoritativeQuote.subtotal !== checkoutQuote.subtotal ||
                authoritativeQuote.shipping !== checkoutQuote.shipping ||
                authoritativeQuote.discount !== checkoutQuote.discount
            ) {
                if (authoritativeQuote) setCheckoutQuote(authoritativeQuote);
                throw new Error(
                    "Your order total changed. Please review it and try again.",
                );
            }
            if (!reservationId) {
                throw new Error("Unable to reserve your item for checkout.");
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "THRIFTX",
                description: "Premium Thrift Fashion",
                order_id: razorpayOrder.id,
                handler: async (paymentResponse: Record<string, string>) => {
                    paymentConfirmed = true;
                    try {
                        const order = await createOrder({
                            paymentMethod: "razorpay",
                            paymentId: paymentResponse.razorpay_payment_id,
                            orderId: paymentResponse.razorpay_order_id,
                            signature: paymentResponse.razorpay_signature,
                        });

                        try {
                            await clearCart();
                        } catch (error) {
                            console.error(
                                "Order created, but cart cleanup failed:",
                                error,
                            );
                            toast.error(
                                "Your order is confirmed, but your cart could not be cleared.",
                            );
                        }
                        window.sessionStorage.removeItem("thriftx:checkout-coupon");
                        window.localStorage.removeItem("thriftx:referral-code");
                        toast.success("Order placed successfully!");

                        // Track purchase & checkout events for analytics
                        analytics.trackPurchase({
                            orderTotal: total,
                            subtotal: serverSubtotal,
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
                            `/success?id=${encodeURIComponent(order.$id)}`,
                        );
                    } catch (error) {
                        console.error(error);
                        toast.error(
                            "Payment may have completed, but we could not confirm your order. Do not pay again; contact support with your payment reference.",
                        );
                    }
                },
                prefill: {
                    name: selectedAddress.fullName,
                    email: user.email ?? "",
                    contact: selectedAddress.phone,
                },
                theme: { color: "#000000" },
                modal: {
                    ondismiss: () => {
                        if (reservationId && !paymentConfirmed) {
                            void releaseCheckoutReservation(
                                razorpayOrderId,
                                reservationId,
                            ).catch(
                                (error: unknown) => {
                                    console.error(
                                        "Failed to release payment reservation:",
                                        error,
                                    );
                                },
                            );
                        }
                        setPaymentLoading(false);
                    },
                },
                // Fires when Razorpay itself reports the payment as failed
                // (e.g. BAD_REQUEST_ERROR / payment_risk_check_failed website
                // mismatch, card declined, UPI timeout). Without this, a
                // blocked payment leaves inventory reserved and the shopper
                // staring at a closed modal with no message.
                payment_failed: (
                    failureResponse: Record<string, unknown>,
                ) => {
                    const nested = failureResponse.error as
                        | Record<string, unknown>
                        | undefined;
                    const code =
                        typeof nested?.code === "string"
                            ? nested.code
                            : "unknown";
                    setPaymentLoading(false);
                    // Secret-free diagnostic: Razorpay error code only.
                    console.error("[checkout] Razorpay payment failed:", {
                        code,
                    });
                    toast.error(
                        code === "BAD_REQUEST_ERROR"
                            ? "This payment was blocked. Please try another method or contact support."
                            : "Your payment failed. No money was deducted — please try again.",
                    );
                    if (reservationId && !paymentConfirmed) {
                        void releaseCheckoutReservation(
                            razorpayOrderId,
                            reservationId,
                        ).catch(() => {
                            // Inventory auto-expires server-side; a
                            // failed release here is non-fatal.
                        });
                    }
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
            paymentModalOpened = true;
        } catch (error) {
            console.error(error);
            if (reservationId && !paymentConfirmed) {
                void releaseCheckoutReservation(
                    razorpayOrderId,
                    reservationId,
                ).catch(
                    (releaseError: unknown) => {
                        console.error(
                            "Failed to release checkout reservation:",
                            releaseError,
                        );
                    },
                );
            }
            setPaymentLoading(false);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to initiate payment.",
            );
        } finally {
            if (!paymentModalOpened) setPaymentLoading(false);
        }
    }

    // Track checkout start when user arrives on checkout page
    const checkoutTrackedRef = useRef(false);
    useEffect(() => {
        if (cartItems.length > 0 && !checkoutTrackedRef.current) {
            checkoutTrackedRef.current = true;
            analytics.trackCheckoutStart({
                itemCount: cartItems.length,
                subtotal: serverSubtotal,
                total,
            });
        }
    }, [cartItems.length, serverSubtotal, total, analytics]);

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

        if (quoteLoading || !checkoutQuote || quoteError) {
            toast.error(
                quoteError ||
                "Please wait while we confirm your order total.",
            );
            return;
        }

        setPaymentMethod(method);

        if (method === "cod") {
            await handleCODOrder();
        } else {
            await handleRazorpayPayment();
        }
    };

    if (authWaitExpired && authLoading) {
        return (
            <CheckoutSessionError
                onRetry={() => {
                    setAuthWaitExpired(false);
                    void refreshUser().catch((error: unknown) => {
                        console.error("Checkout session refresh failed:", error);
                        setAuthWaitExpired(true);
                    });
                }}
            />
        );
    }

    if (authLoading || cartLoading) {
        return <CheckoutSkeleton />;
    }

    if (!user) {
        return <CheckoutSkeleton />;
    }

    if (cartError) {
        return (
            <CheckoutCartError
                message={cartError}
                onRetry={() => void refreshCart()}
            />
        );
    }

    if (!cartItems.length) {
        return <EmptyCheckout />;
    }

    return (
        <main className="min-h-screen bg-background pb-40 lg:pb-12">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                {/* ── Page header ─────────────────────────────────── */}
                <header className="mb-5 sm:mb-8">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center gap-2 text-caption text-muted-foreground"
                    >
                        <Link
                            href="/cart"
                            className="rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            Cart
                        </Link>

                        <span aria-hidden="true">/</span>

                        <span aria-current="page" className="text-foreground">
                            Checkout
                        </span>
                    </nav>

                    <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-h2 font-bold tracking-tight text-foreground">
                                Secure checkout
                            </h1>

                            <p className="mt-1.5 max-w-xl text-subtitle text-muted-foreground">
                                {cartItems.length}{" "}
                                {cartItems.length === 1
                                    ? "item"
                                    : "items"}
                                {" · "}
                                {addresses.length > 0
                                    ? `Delivering to ${selectedAddress?.fullName ?? "your saved address"}`
                                    : "Add a delivery address to continue"}
                            </p>
                        </div>

                        <p className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-label text-muted-foreground">
                            <LockKeyhole
                                className="size-3.5 text-success"
                                aria-hidden="true"
                            />
                            Secure
                        </p>
                    </div>
                </header>

                {/* ── Panipat marketing (locals only) ─────────── */}
                {isLocalAddress && (
                    <div className="mb-5 sm:mb-6">
                        <PanipatDeliveryPromo
                            variant="compact"
                            showCta={false}
                        />
                    </div>
                )}

                {/* ── Mobile order summary (collapsible) ─────────── */}
                <div className="mb-5 lg:hidden">
                    <CheckoutOrderSummary
                        items={cartItems}
                        subtotal={serverSubtotal}
                        shippingCost={shippingCost}
                        total={total}
                        discount={checkoutQuote?.discount ?? 0}
                        discountReason={checkoutQuote?.discountReason ?? ""}
                        pricingLoading={quoteLoading}
                        canPay={canPay}
                    />
                </div>
                {/* ── Checkout flow ─────────────────────────────── */}
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0 space-y-4">
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
                            paymentMethod={paymentMethod}
                            onPaymentMethodChange={setPaymentMethod}
                            subtotal={subtotal}
                        />

                        {quoteError && (
                            <div
                                role="alert"
                                className="flex flex-col gap-3 rounded-2xl border border-error/25 bg-error/5 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <p className="text-body-sm text-error">
                                    {quoteError}
                                </p>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setQuoteRefresh(
                                            (value) => value + 1,
                                        )
                                    }
                                    disabled={quoteLoading}
                                    className="shrink-0"
                                >
                                    Try again
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ── Desktop summary + single CTA ────────────── */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24">
                            <CheckoutOrderSummary
                                items={cartItems}
                                subtotal={serverSubtotal}
                                shippingCost={shippingCost}
                                total={total}
                                discount={
                                    checkoutQuote?.discount ?? 0
                                }
                                discountReason={
                                    checkoutQuote?.discountReason ?? ""
                                }
                                pricingLoading={quoteLoading}
                                canPay={canPay}
                            />

                            <Button
                                type="button"
                                onClick={() =>
                                    handlePay(
                                        paymentMethod ?? "razorpay",
                                    )
                                }
                                disabled={!canPay || paymentLoading}
                                loading={paymentLoading}
                                loadingText="Placing your order…"
                                size="lg"
                                fullWidth
                                leftIcon={
                                    <LockKeyhole
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                }
                                className="mt-4"
                            >
                                {paymentMethod === "cod"
                                    ? "Place order — pay on delivery"
                                    : quoteLoading || !checkoutQuote
                                        ? "Confirming total…"
                                        : `Pay ₹${total.toLocaleString("en-IN")}`}
                            </Button>

                            {!canPay && !quoteError && (
                                <p
                                    role="status"
                                    className="mt-3 text-center text-small text-muted-foreground"
                                >
                                    {paymentMethod
                                        ? "Confirming your total…"
                                        : "Choose a payment method to continue."}
                                </p>
                            )}

                            {quoteError && (
                                <p
                                    role="alert"
                                    className="mt-3 text-center text-small text-error"
                                >
                                    {quoteError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Single mobile payment action ─────────────────── */}
            <CheckoutPayBar
                total={total}
                discount={checkoutQuote?.discount ?? 0}
                discountReason={checkoutQuote?.discountReason ?? ""}
                loading={quoteLoading}
                error={quoteError}
                canPay={canPay}
                paymentLoading={paymentLoading}
                selectedMethod={paymentMethod}
                onPay={handlePay}
            />
        </main>
    );
}
