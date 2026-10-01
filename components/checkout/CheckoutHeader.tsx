"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    Clock3,
    CreditCard,
    PackageCheck,
    ShieldCheck,
    Sparkles,
    Truck,
} from "lucide-react";

function TrustItem({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 sm:rounded-2xl sm:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon size={17} aria-hidden="true" />
            </div>

            <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                    {title}
                </p>

                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default function CheckoutHeader() {
    const [detailsOpen, setDetailsOpen] = useState(false);

    return (
        <motion.header
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.25,
                ease: "easeOut",
            }}
            className="mb-5 min-w-0 sm:mb-7"
        >
            {/* Back navigation */}
            <Link
                href="/cart"
                className="group mb-4 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4"
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card transition-colors group-hover:border-foreground/25 group-hover:bg-muted">
                    <ArrowLeft
                        size={15}
                        aria-hidden="true"
                    />
                </span>

                Back to Cart
            </Link>

            {/* Compact checkout heading */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:rounded-3xl sm:p-7 lg:p-8">
                <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-500/[0.06] blur-3xl" />

                <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-foreground/[0.035] blur-3xl" />

                <div className="relative">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            <ShoppingBagIcon />
                            THRIFTX Checkout
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <ShieldCheck
                                size={12}
                                aria-hidden="true"
                            />
                            Secure Checkout
                        </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.12] tracking-tight text-foreground">
                                Complete your order
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                                Confirm your delivery details, choose a
                                shipping method, and complete your
                                purchase securely.
                            </p>
                        </div>

                        <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 sm:inline-flex">
                            <CheckCircle2
                                size={16}
                                className="text-emerald-600 dark:text-emerald-400"
                                aria-hidden="true"
                            />

                            <span className="text-xs font-medium text-muted-foreground">
                                Your order is almost ready
                            </span>
                        </div>
                    </div>

                    {/* Trust information */}
                    <div className="mt-5 grid grid-cols-1 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3">
                        <TrustItem
                            icon={PackageCheck}
                            title="Quality Checked"
                            description="Carefully inspected before dispatch"
                        />

                        <TrustItem
                            icon={Truck}
                            title="Delivery Options"
                            description="Local and courier delivery"
                        />

                        <TrustItem
                            icon={CreditCard}
                            title="Secure Payments"
                            description="Razorpay and available payment options"
                        />
                    </div>

                    {/* Expandable delivery information */}
                    <div className="mt-4 border-t border-border pt-4">
                        <button
                            type="button"
                            onClick={() =>
                                setDetailsOpen((current) => !current)
                            }
                            aria-expanded={detailsOpen}
                            aria-controls="checkout-delivery-details"
                            className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:text-sm"
                        >
                            <span className="flex min-w-0 items-center gap-2">
                                <Clock3
                                    size={15}
                                    className="shrink-0"
                                    aria-hidden="true"
                                />

                                <span>
                                    Delivery and payment information
                                </span>
                            </span>

                            <motion.span
                                animate={{
                                    rotate: detailsOpen ? 180 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                                className="shrink-0"
                            >
                                <ChevronDown
                                    size={17}
                                    aria-hidden="true"
                                />
                            </motion.span>
                        </button>

                        <AnimatePresence initial={false}>
                            {detailsOpen && (
                                <motion.div
                                    id="checkout-delivery-details"
                                    initial={{
                                        opacity: 0,
                                        height: 0,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        height: "auto",
                                    }}
                                    exit={{
                                        opacity: 0,
                                        height: 0,
                                    }}
                                    transition={{
                                        duration: 0.22,
                                        ease: "easeInOut",
                                    }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 gap-2 pt-3 sm:grid-cols-2">
                                        <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
                                            <Truck
                                                size={16}
                                                className="mt-0.5 shrink-0 text-muted-foreground"
                                                aria-hidden="true"
                                            />

                                            <div>
                                                <p className="text-xs font-semibold text-foreground">
                                                    Delivery estimate
                                                </p>

                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                    Your available delivery
                                                    estimate is shown in the
                                                    shipping options below.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
                                            <ShieldCheck
                                                size={16}
                                                className="mt-0.5 shrink-0 text-muted-foreground"
                                                aria-hidden="true"
                                            />

                                            <div>
                                                <p className="text-xs font-semibold text-foreground">
                                                    Payment security
                                                </p>

                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                    Online payments are
                                                    processed through
                                                    Razorpay.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

function ShoppingBagIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M6 7h12l1 14H5L6 7Z" />
            <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </svg>
    );
}