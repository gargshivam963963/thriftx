"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard,
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
import { Button } from "@/components/ui/button";

import { useAddresses } from "@/hooks/useAddresses";
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

function CheckoutSkeleton() {
    return (
        <main className="min-h-screen bg-subtle">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
                <div className="space-y-4 sm:space-y-6">
                    <div className="skeleton-glass h-36 rounded-2xl sm:h-44 sm:rounded-[32px]" />
                    <div className="hidden sm:flex gap-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="skeleton-glass h-8 w-24 rounded-full"
                            />
                        ))}
                    </div>
                    <div className="grid gap-5 sm:gap-6 xl:grid-cols-[1fr_380px]">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="skeleton-glass h-28 rounded-2xl sm:h-36 sm:rounded-3xl"
                                />
                            ))}
                        </div>
                        <div className="skeleton-glass hidden h-[500px] rounded-[28px] xl:block" />
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
                    <Button
                        asChild
                        size="lg"
                        rounded="xl"
                        variant="primary"
                        className="mt-8 px-8"
                    >
                        <Link href="/shop">
                            Browse Shop
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
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
        <main className="min-h-screen bg-background pb-[calc(12rem+env(safe-area-inset-bottom))] md:pb-32 lg:pb-12">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                <header className="mb-6 border-b border-border pb-5 sm:mb-8 sm:pb-6">
                    <div className="flex flex-wrap items-center gap-2 text-caption font-medium text-muted-foreground">
                        <Link href="/cart" className="transition-colors hover:text-foreground">
                            Your cart
                        </Link>
                        <span aria-hidden="true">/</span>
                        <span className="text-foreground">Checkout</span>
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-heading-2 font-bold tracking-tight text-foreground">
                                Secure checkout
                            </h1>
                            <p className="mt-1 max-w-2xl text-body-sm text-muted-foreground">
                                Confirm your delivery details and payment. Your final total is calculated securely.
                            </p>
                        </div>
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-caption font-medium text-muted-foreground">
                            <LockKeyhole className="h-4 w-4 text-success" aria-hidden="true" />
                            Secure payment
                        </div>
                    </div>
                </header>

                <div className="grid items-start gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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
                            paymentMethod={paymentMethod}
                            onPaymentMethodChange={setPaymentMethod}
                            subtotal={subtotal}
                        />
                        {quoteError && (
                            <div
                                role="alert"
                                className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <p className="text-body-sm text-destructive">{quoteError}</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuoteRefresh((value) => value + 1)}
                                    disabled={quoteLoading}
                                    className="shrink-0"
                                >
                                    Try again
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ── Right Column – Order Summary (Desktop) ──────── */}
                    <div className="hidden lg:block">
                        <CheckoutOrderSummary
                            items={cartItems}
                            subtotal={checkoutQuote?.subtotal ?? 0}
                            shippingCost={shippingCost}
                            total={total}
                            discount={checkoutQuote?.discount ?? 0}
                            discountReason={checkoutQuote?.discountReason ?? ""}
                            pricingLoading={quoteLoading}
                            paymentLoading={paymentLoading}
                            canPay={canPay}
                            selectedMethod={paymentMethod}
                            onPay={handlePay}
                        />
                    </div>
                </div>

                {/* ── Mobile Bottom Bar ────────────────────────────────── */}
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed inset-x-0 bottom-[var(--mobile-nav-height)] z-50 border-t border-border bg-card/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl md:bottom-0 lg:hidden sm:px-6 sm:py-4"
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Total
                            </p>
                            <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                                {quoteLoading || !checkoutQuote || quoteError
                                    ? "—"
                                    : `₹${total.toLocaleString("en-IN")}`}
                            </h3>
                            {checkoutQuote && checkoutQuote.discount > 0 && (
                                <p className="text-xs font-medium text-emerald-600">
                                    {checkoutQuote.discountReason}: −₹
                                    {checkoutQuote.discount.toLocaleString("en-IN")}
                                </p>
                            )}
                            {checkoutQuote && shippingCost > 0 && (
                                <p className="text-[10px] text-muted-foreground">
                                    +₹{shippingCost.toLocaleString("en-IN")} shipping
                                </p>
                            )}
                            {checkoutQuote && shippingCost === 0 && (
                                <p className="text-[10px] text-emerald-600 font-medium">
                                    Free Shipping
                                </p>
                            )}
                            {quoteLoading && (
                                <p className="text-[10px] text-muted-foreground">
                                    Confirming total…
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* COD button */}
                            <Button
                                type="button"
                                onClick={() => handlePay("cod")}
                                loading={paymentLoading && paymentMethod === "cod"}
                                disabled={!canPay || paymentLoading}
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
                                disabled={!canPay || paymentLoading}
                                size="lg"
                                leftIcon={<CreditCard className="h-5 w-5" />}
                                className="rounded-xl px-5 shadow-lg shadow-foreground/20 sm:rounded-2xl sm:px-7"
                            >
                                {paymentLoading
                                    ? "Processing…"
                                    : `Pay${checkoutQuote ? ` ₹${total.toLocaleString("en-IN")}` : ""}`}
                            </Button>
                        </div>
                    </div>

                    {!canPay && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 text-center text-[11px] text-amber-600"
                        >
                            {quoteError
                                ? "We could not confirm your total. Retry before placing your order."
                                : "Complete your address and delivery selection to continue."}
                        </motion.p>
                    )}
                    {quoteError && (
                        <p
                            role="alert"
                            className="mt-2 text-center text-xs text-destructive"
                        >
                            {quoteError}
                        </p>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
