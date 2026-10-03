"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    Banknote,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    CreditCard,
    LockKeyhole,
    Wallet,
} from "lucide-react";

import type { PaymentMethod } from "@/lib/types/order";

interface PaymentSectionProps {
    open: boolean;
    onOpen: () => void;
    onPaymentMethodChange: (method: PaymentMethod) => void;
    paymentLoading: boolean;
    canPay: boolean;
    disabled?: boolean;
    selectedMethod: PaymentMethod | null;
}

function PaymentOption({
    method,
    title,
    description,
    badge,
    features,
    selected,
    loading,
    canPay,
    onSelect,
}: {
    method: PaymentMethod;
    title: string;
    description: string;
    badge: string;
    features: string[];
    selected: boolean;
    loading: boolean;
    canPay: boolean;
    onSelect: () => void;
}) {
    const isCod = method === "cod";

    const Icon = isCod ? Banknote : Wallet;

    return (
        <motion.button
            type="button"
            layout
            onClick={onSelect}
            disabled={!canPay || loading}
            aria-pressed={selected}
            whileHover={
                canPay && !loading
                    ? { y: -1 }
                    : undefined
            }
            whileTap={
                canPay && !loading
                    ? { scale: 0.995 }
                    : undefined
            }
            className={[
                "relative w-full min-w-0 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 sm:rounded-3xl sm:p-5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                selected
                    ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20 dark:bg-emerald-950/20"
                    : "border-border bg-card hover:border-foreground/25 hover:bg-muted/20 hover:shadow-sm",
                !canPay || loading
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer",
            ].join(" ")}
        >
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div
                    className={[
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-12 sm:w-12 sm:rounded-2xl",
                        selected
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground",
                    ].join(" ")}
                >
                    <Icon
                        size={21}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold leading-snug text-foreground sm:text-base">
                            {title}
                        </h3>

                        <span
                            className={[
                                "rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                                isCod
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
                            ].join(" ")}
                        >
                            {badge}
                        </span>
                    </div>

                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                        {features.map((feature) => (
                            <span
                                key={feature}
                                className="inline-flex items-center gap-1.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs"
                            >
                                <Check
                                    size={12}
                                    className="shrink-0 text-emerald-600 dark:text-emerald-400"
                                    aria-hidden="true"
                                />
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>

                <div
                    className={[
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        selected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-border bg-background",
                    ].join(" ")}
                    aria-hidden="true"
                >
                    {selected && (
                        <Check size={12} strokeWidth={3} />
                    )}
                </div>
            </div>

            {selected && (
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 5,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="mt-4 flex items-center gap-2 border-t border-emerald-200/70 pt-3 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:text-emerald-300"
                >
                    <CheckCircle2
                        size={15}
                        aria-hidden="true"
                    />
                    Selected payment method
                </motion.div>
            )}

            {loading && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-[2px]"
                    role="status"
                    aria-live="polite"
                >
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                        Processing...
                    </span>
                </div>
            )}
        </motion.button>
    );
}

export default function PaymentSection({
    open,
    onOpen,
    onPaymentMethodChange,
    paymentLoading,
    canPay,
    disabled = false,
    selectedMethod,
}: PaymentSectionProps) {
    const paymentLabel =
        selectedMethod === "cod"
            ? "Cash on Delivery"
            : selectedMethod === "razorpay"
                ? "Online Payment (Razorpay)"
                : "Choose a payment method";

    const paymentDescription =
        selectedMethod === "cod"
            ? "Pay when your order arrives"
            : selectedMethod === "razorpay"
                ? "UPI · Cards · Net Banking · Wallets"
                : "Select how you would like to pay";

    return (
        <motion.section
            layout
            transition={{
                duration: 0.28,
                ease: "easeOut",
            }}
            className={[
                "min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-200 sm:rounded-3xl",
                disabled
                    ? "border-border/70 opacity-70"
                    : "border-border hover:shadow-md",
            ].join(" ")}
        >
            {/* Payment section header */}
            <button
                type="button"
                onClick={disabled ? undefined : onOpen}
                disabled={disabled}
                aria-expanded={open}
                aria-controls="checkout-payment-content"
                className={[
                    "group flex w-full min-w-0 items-center justify-between gap-3",
                    "bg-card px-4 py-4 text-left transition-colors sm:px-6 sm:py-5",
                    "hover:bg-muted/30 focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground",
                    "disabled:cursor-not-allowed disabled:hover:bg-card",
                ].join(" ")}
            >
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div
                        className={[
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-12 sm:w-12 sm:rounded-2xl",
                            selectedMethod
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : open
                                    ? "bg-foreground text-background"
                                    : "bg-muted text-muted-foreground",
                        ].join(" ")}
                    >
                        {selectedMethod ? (
                            <CheckCircle2
                                size={20}
                                aria-hidden="true"
                            />
                        ) : (
                            <CreditCard
                                size={19}
                                aria-hidden="true"
                            />
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={[
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold sm:h-6 sm:w-6 sm:text-xs",
                                    selectedMethod
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                        : "bg-muted text-muted-foreground",
                                ].join(" ")}
                            >
                                {selectedMethod ? (
                                    <Check size={12} />
                                ) : (
                                    "3"
                                )}
                            </span>

                            <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                                Payment
                            </h2>

                            {selectedMethod && (
                                <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 sm:inline-flex">
                                    Selected
                                </span>
                            )}
                        </div>

                        <p className="mt-1 truncate text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            {disabled
                                ? "Select shipping first"
                                : selectedMethod
                                    ? paymentDescription
                                    : "Choose a secure payment method"}
                        </p>
                    </div>
                </div>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors group-hover:border-foreground/20 group-hover:text-foreground sm:h-9 sm:w-9">
                    {open ? (
                        <ChevronDown size={17} aria-hidden="true" />
                    ) : (
                        <ChevronRight size={17} aria-hidden="true" />
                    )}
                </span>
            </button>

            {/* Payment options */}
            <AnimatePresence initial={false}>
                {open && !disabled && (
                    <motion.div
                        id="checkout-payment-content"
                        key="payment-body"
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
                            duration: 0.25,
                            ease: "easeInOut",
                        }}
                        className="overflow-hidden border-t border-border"
                    >
                        <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    Choose payment method
                                </h3>

                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                    Select how you want to complete your
                                    THRIFTX order.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <PaymentOption
                                    method="cod"
                                    title="Cash on Delivery"
                                    description="Pay when your order arrives at your doorstep. No online payment is needed."
                                    badge="Pay Later"
                                    features={[
                                        "No advance payment",
                                        "Pay at delivery",
                                    ]}
                                    selected={selectedMethod === "cod"}
                                    onSelect={() => onPaymentMethodChange("cod")}
                                    loading={
                                        paymentLoading &&
                                        selectedMethod === "cod"
                                    }
                                    canPay={canPay}
                                />

                                <PaymentOption
                                    method="razorpay"
                                    title="Pay Online (Razorpay)"
                                    description="Secure online payment using UPI, cards, net banking, or supported wallets."
                                    badge="Online"
                                    features={[
                                        "UPI · GPay · PhonePe",
                                        "Credit & Debit Cards",
                                        "Net Banking · Wallets",
                                    ]}
                                    selected={
                                        selectedMethod === "razorpay"
                                    }
                                    onSelect={() => onPaymentMethodChange("razorpay")}
                                    loading={
                                        paymentLoading &&
                                        selectedMethod === "razorpay"
                                    }
                                    canPay={canPay}
                                />
                            </div>

                            {/* Security information */}
                            <div className="rounded-2xl border border-border bg-muted/30 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground">
                                        <LockKeyhole
                                            size={17}
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <h4 className="text-sm font-semibold text-foreground">
                                            Secure Checkout
                                        </h4>

                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Online payments are processed
                                            through Razorpay. THRIFTX does
                                            not store your card details.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!canPay && (
                                <p
                                    role="status"
                                    className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
                                >
                                    Complete your address and shipping
                                    selection before continuing.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsed selected payment */}
            {!open && !disabled && selectedMethod && (
                <div className="border-t border-border px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                <CheckCircle2
                                    size={18}
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400 sm:text-[11px]">
                                    Payment Method
                                </p>

                                <h3 className="mt-0.5 truncate text-sm font-semibold text-foreground sm:text-base">
                                    {paymentLabel}
                                </h3>

                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                    {paymentDescription}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onOpen}
                            className="min-h-10 shrink-0 rounded-xl border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:px-4 sm:text-sm"
                        >
                            Change
                        </button>
                    </div>
                </div>
            )}
        </motion.section>
    );
}