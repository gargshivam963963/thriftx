"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    ShoppingBag,
    Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { getUserOrder } from "@/lib/client/orders";
import type { Order } from "@/lib/types/order";

function formatCurrency(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Main Success Page ───────────────────────────────────────────────────────

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-center">
                    <div className="h-8 w-48 rounded bg-muted mx-auto mb-4" />
                    <div className="h-4 w-64 rounded bg-muted mx-auto" />
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const {
        user,
        loading: authLoading,
        refreshUser,
    } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [orderLoading, setOrderLoading] = useState(true);
    const [orderError, setOrderError] = useState("");
    const [retryCount, setRetryCount] = useState(0);
    const [authWaitExpired, setAuthWaitExpired] = useState(false);

    const documentId = searchParams.get("id")?.trim() ?? "";
    useEffect(() => {
        if (!authLoading) {
            setAuthWaitExpired(false);
            return;
        }

        const timeoutId = setTimeout(() => setAuthWaitExpired(true), 10_000);
        return () => clearTimeout(timeoutId);
    }, [authLoading]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            const redirect = documentId
                ? `/success?id=${encodeURIComponent(documentId)}`
                : "/success";
            router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
            return;
        }

        let active = true;
        if (!documentId) {
            setOrder(null);
            setOrderError("No order reference was provided.");
            setOrderLoading(false);
            return () => {
                active = false;
            };
        }

        setOrderLoading(true);
        setOrderError("");
        void getUserOrder(documentId)
            .then((verifiedOrder) => {
                if (active) setOrder(verifiedOrder);
            })
            .catch((error: unknown) => {
                if (!active) return;
                console.error("Order confirmation lookup failed:", error);
                setOrder(null);
                setOrderError(
                    error instanceof Error
                        ? error.message
                        : "Unable to verify this order.",
                );
            })
            .finally(() => {
                if (active) setOrderLoading(false);
            });

        return () => {
            active = false;
        };
    }, [authLoading, documentId, retryCount, router, user]);

    if (authWaitExpired && authLoading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
                <section
                    className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center sm:p-10"
                    role="alert"
                >
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-bg text-warning-foreground">
                        <Clock size={26} aria-hidden="true" />
                    </span>
                    <h1 className="mt-5 text-heading-3 font-bold text-foreground">
                        Sign-in check is taking longer than expected
                    </h1>
                    <p className="mt-2 text-body-sm text-muted-foreground">
                        We haven&apos;t confirmed your order yet. Retry the
                        sign-in check or open your orders after signing in.
                    </p>
                    <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        leftIcon={<RefreshCw size={16} />}
                        onClick={() => {
                            setAuthWaitExpired(false);
                            void refreshUser().catch((error: unknown) => {
                                console.error(
                                    "Session refresh failed on confirmation page:",
                                    error,
                                );
                                setAuthWaitExpired(true);
                            });
                        }}
                        className="mt-6"
                    >
                        Retry sign-in check
                    </Button>
                    <div>
                        <Link
                            href="/login?redirect=%2Forders"
                            className="mt-5 inline-block text-body-sm font-semibold text-foreground underline underline-offset-4"
                        >
                            Sign in to view orders
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    if (authLoading || orderLoading) {
        return (
            <main
                className="flex min-h-[70vh] items-center justify-center bg-background px-4"
                role="status"
                aria-live="polite"
            >
                <div className="w-full max-w-lg space-y-4">
                    <div className="skeleton-glass mx-auto h-24 w-24 rounded-full" />
                    <div className="skeleton-glass mx-auto h-8 w-56 rounded-xl" />
                    <div className="skeleton-glass mx-auto h-5 w-72 max-w-full rounded-lg" />
                    <p className="text-center text-body-sm text-muted-foreground">
                        Verifying your order…
                    </p>
                </div>
            </main>
        );
    }

    if (!order) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
                <section
                    className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center sm:p-10"
                    role="alert"
                >
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-bg text-error">
                        <AlertCircle size={26} aria-hidden="true" />
                    </span>
                    <h1 className="mt-5 text-heading-3 font-bold text-foreground">
                        We couldn&apos;t verify your order
                    </h1>
                    <p className="mt-2 text-body-sm text-muted-foreground">
                        {orderError || "This order could not be found."} No order
                        has been confirmed on this page.
                    </p>
                    {documentId && (
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            leftIcon={<RefreshCw size={16} />}
                            onClick={() => setRetryCount((count) => count + 1)}
                            className="mt-6"
                        >
                            Try again
                        </Button>
                    )}
                    <div>
                        <Link
                            href="/orders"
                            className="mt-5 inline-block text-body-sm font-semibold text-foreground underline underline-offset-4"
                        >
                            View my orders
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <section className="w-full bg-background px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl border border-border bg-card p-6 text-center shadow-card sm:p-8"
                >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-bg text-success">
                        <CheckCircle2 size={30} aria-hidden="true" />
                    </div>
                    <h1 className="font-display text-heading-2 font-bold text-foreground">
                        Order confirmed
                    </h1>
                    <p className="mx-auto mt-2 max-w-sm text-body-sm text-muted-foreground">
                        Thanks, {order.firstName}. Your one-of-a-kind find is secured.
                    </p>

                    <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-muted px-4 py-3 text-left">
                        <div className="min-w-0">
                            <p className="text-small text-muted-foreground">Order number</p>
                            <p className="mt-0.5 truncate font-mono text-body-sm font-semibold text-foreground">
                                #{order.orderId}
                            </p>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-small text-muted-foreground">Total</p>
                            <p className="mt-0.5 text-body-sm font-semibold text-foreground">
                                {formatCurrency(order.total)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <Button
                            asChild
                            size="lg"
                            variant="primary"
                            className="rounded-xl"
                        >
                            <Link href={`/orders/${encodeURIComponent(order.$id)}`}>
                                View order
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Link href="/shop">
                                <ShoppingBag size={16} aria-hidden="true" />
                                Continue shopping
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
