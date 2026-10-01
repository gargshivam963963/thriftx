
"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock3,
    PackageCheck,
    PackageOpen,
    ShieldCheck,
    Sparkles,
    Truck,
    Zap,
} from "lucide-react";

import type { ShippingMethod } from "@/lib/shipping/checkout-options";

interface ShippingSectionProps {
    open: boolean;
    methods: ShippingMethod[];
    selectedMethod: ShippingMethod | null;
    onSelect: (method: ShippingMethod) => void;
    onOpen: () => void;
    disabled?: boolean;
    loading?: boolean;
    isLocalDelivery?: boolean;
}

function formatPrice(price: number) {
    return `₹${price.toLocaleString("en-IN")}`;
}

function MethodIcon({ id }: { id: string }) {
    const isExpress = id === "express";

    return (
        <div
            className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl",
                isExpress
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    : "bg-muted text-muted-foreground",
            ].join(" ")}
        >
            {isExpress ? (
                <Zap size={19} strokeWidth={1.8} aria-hidden="true" />
            ) : (
                <Truck size={19} strokeWidth={1.8} aria-hidden="true" />
            )}
        </div>
    );
}

function ShippingSkeleton() {
    return (
        <div
            className="space-y-3 p-4 sm:space-y-4 sm:p-6"
            aria-label="Loading shipping methods"
            aria-busy="true"
        >
            {[1, 2].map((item) => (
                <div
                    key={item}
                    className="flex animate-pulse items-center gap-3 rounded-2xl border border-border p-4 sm:gap-4 sm:p-5"
                >
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-muted sm:h-12 sm:w-12" />

                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-32 max-w-full rounded bg-muted sm:w-44" />
                        <div className="h-3 w-24 rounded bg-muted" />
                    </div>

                    <div className="h-5 w-12 shrink-0 rounded bg-muted" />
                </div>
            ))}
        </div>
    );
}

function EmptyShipping() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 px-5 py-10 text-center sm:px-8 sm:py-12"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <PackageOpen size={25} strokeWidth={1.6} aria-hidden="true" />
            </div>

            <div>
                <h3 className="text-sm font-semibold text-foreground">
                    No shipping options available
                </h3>

                <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    We couldn&apos;t find a delivery service for this
                    pincode. Please check your address or try another
                    delivery location.
                </p>
            </div>
        </motion.div>
    );
}

function ShippingBenefits() {
    const benefits = [
        {
            icon: ShieldCheck,
            title: "Tracked Shipment",
            description: "Delivery updates",
        },
        {
            icon: PackageCheck,
            title: "Secure Packing",
            description: "Carefully packed",
        },
        {
            icon: Sparkles,
            title: "Quality Check",
            description: "Inspected before dispatch",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                    <div
                        key={benefit.title}
                        className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:block sm:rounded-2xl sm:p-4"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground sm:mb-3">
                            <Icon size={17} aria-hidden="true" />
                        </div>

                        <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-foreground sm:text-sm">
                                {benefit.title}
                            </h4>

                            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                                {benefit.description}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function ShippingSection({
    open,
    methods,
    selectedMethod,
    onSelect,
    onOpen,
    disabled = false,
    loading = false,
    isLocalDelivery = false,
}: ShippingSectionProps) {
    const selectedPrice = selectedMethod
        ? selectedMethod.price === 0
            ? "Free"
            : formatPrice(selectedMethod.price)
        : null;

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
            {/* Accessible, neutral section header */}
            <button
                type="button"
                onClick={disabled ? undefined : onOpen}
                disabled={disabled}
                aria-expanded={open}
                aria-controls="checkout-shipping-content"
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
                                strokeWidth={1.9}
                                aria-hidden="true"
                            />
                        ) : (
                            <Truck
                                size={19}
                                strokeWidth={1.8}
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
                                    "2"
                                )}
                            </span>

                            <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                                Shipping
                            </h2>

                            {selectedMethod && (
                                <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 sm:inline-flex">
                                    Selected
                                </span>
                            )}
                        </div>

                        <p className="mt-1 max-w-[220px] truncate text-xs leading-relaxed text-muted-foreground sm:max-w-md sm:text-sm">
                            {disabled
                                ? "Select an address first"
                                : loading
                                    ? "Checking available delivery options..."
                                    : selectedMethod
                                        ? `${selectedMethod.name} · ${selectedPrice}`
                                        : isLocalDelivery
                                            ? "Available local delivery options"
                                            : "Choose a delivery method"}
                        </p>
                    </div>
                </div>

                <span
                    className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors sm:h-9 sm:w-9",
                        disabled
                            ? ""
                            : "group-hover:border-foreground/20 group-hover:text-foreground",
                    ].join(" ")}
                >
                    {open ? (
                        <ChevronDown size={17} aria-hidden="true" />
                    ) : (
                        <ChevronRight size={17} aria-hidden="true" />
                    )}
                </span>
            </button>

            {/* Expanded shipping options */}
            <AnimatePresence initial={false}>
                {open && !disabled && (
                    <motion.div
                        id="checkout-shipping-content"
                        key="shipping-body"
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
                        {loading ? (
                            <ShippingSkeleton />
                        ) : methods.length === 0 ? (
                            <EmptyShipping />
                        ) : (
                            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
                                {/* Local delivery announcement */}
                                {isLocalDelivery && (
                                    <div className="flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:rounded-2xl sm:p-4">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                                            <Zap
                                                size={17}
                                                aria-hidden="true"
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                                                Panipat Local Delivery
                                            </p>

                                            <p className="mt-1 text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
                                                Eligible orders receive free
                                                same-day home delivery, with
                                                an estimated 2–3 hour
                                                delivery window.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Select delivery method
                                        </h3>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Choose the option that works
                                            best for you.
                                        </p>
                                    </div>

                                    {methods.map((method) => {
                                        const selected =
                                            selectedMethod?.id === method.id;

                                        const isExpress =
                                            method.id === "express";

                                        return (
                                            <motion.button
                                                key={method.id}
                                                type="button"
                                                layout
                                                onClick={() =>
                                                    onSelect(method)
                                                }
                                                whileHover={{
                                                    y: -1,
                                                }}
                                                whileTap={{
                                                    scale: 0.995,
                                                }}
                                                aria-pressed={selected}
                                                className={[
                                                    "relative w-full rounded-2xl border p-4 text-left transition-all duration-200 sm:rounded-3xl sm:p-5",
                                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                                                    selected
                                                        ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20 dark:bg-emerald-950/20"
                                                        : "border-border bg-card hover:border-foreground/25 hover:bg-muted/20 hover:shadow-sm",
                                                ].join(" ")}
                                            >
                                                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                                                    <MethodIcon id={method.id} />

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="text-sm font-semibold leading-snug text-foreground sm:text-base">
                                                                {method.name}
                                                            </h4>

                                                            {isExpress && (
                                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                                                                    Express
                                                                </span>
                                                            )}

                                                            {method.price === 0 && (
                                                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                                                                    Free
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                                            {method.subtitle}
                                                        </p>

                                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                                                <Clock3
                                                                    size={12}
                                                                    aria-hidden="true"
                                                                />
                                                                {method.eta}
                                                            </span>

                                                            {method.price > 0 && (
                                                                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                                                                    {formatPrice(
                                                                        method.price,
                                                                    )}
                                                                </span>
                                                            )}
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
                                                            <Check
                                                                size={12}
                                                                strokeWidth={3}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <ShippingBenefits />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsed selected method */}
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
                                    Shipping Method
                                </p>

                                <h3 className="mt-0.5 truncate text-sm font-semibold text-foreground sm:text-base">
                                    {selectedMethod.name}
                                </h3>

                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                    {selectedMethod.eta}
                                    {selectedMethod.price === 0
                                        ? " · Free"
                                        : ` · ${formatPrice(selectedMethod.price)}`}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onOpen}
                            className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:rounded-xl sm:px-4 sm:text-sm"
                        >
                            Change
                        </button>
                    </div>
                </div>
            )}
        </motion.section>
    );
}