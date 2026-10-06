
"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock3,
    PackageOpen,
    Truck,
    Zap,
} from "lucide-react";

import type { ShippingMethod } from "@/lib/shipping/checkout-options";
import { PANIPAT_DELIVERY_PROMO } from "@/lib/shipping/constants";

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

                <p className="mx-auto mt-1.5 max-w-xs text-body-sm leading-relaxed text-muted-foreground">
                    We couldn&apos;t find a delivery service for this
                    pincode. Please check your address or try another
                    delivery location.
                </p>
            </div>
        </motion.div>
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
                            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                            selectedMethod
                                ? "bg-success-bg text-success-foreground"
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
                                    "flex size-6 shrink-0 items-center justify-center rounded-full text-badge font-semibold",
                                    selectedMethod
                                        ? "bg-success-bg text-success-foreground"
                                        : "bg-muted text-muted-foreground",
                                ].join(" ")}
                            >
                                {selectedMethod ? (
                                    <Check size={12} />
                                ) : (
                                    "2"
                                )}
                            </span>

                            <h2 className="text-body font-semibold tracking-tight text-foreground">
                                Shipping
                            </h2>

                            {selectedMethod && (
                                <span className="hidden rounded-full bg-success-bg px-2 py-0.5 text-badge font-semibold uppercase tracking-wider text-success-foreground sm:inline-flex">
                                    Selected
                                </span>
                            )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-body-sm leading-relaxed text-muted-foreground">
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
                        "flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors",
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
                                    <div className="flex items-start gap-3 rounded-2xl border border-success/25 bg-success-bg/60 p-4">
                                        <span
                                            aria-hidden="true"
                                            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success text-white"
                                        >
                                            <Zap size={18} />
                                        </span>

                                        <div className="min-w-0">
                                            <p className="text-badge font-bold uppercase tracking-wider text-success-foreground">
                                                {PANIPAT_DELIVERY_PROMO.badge}
                                            </p>

                                            <p className="mt-1 text-body-sm font-semibold text-success-foreground">
                                                {PANIPAT_DELIVERY_PROMO.headline}
                                            </p>

                                            <p className="mt-1 text-body-sm leading-relaxed text-success-foreground/80">
                                                {PANIPAT_DELIVERY_PROMO.subheadline}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-body font-semibold text-foreground">
                                            Select delivery method
                                        </h3>

                                        <p className="mt-1 text-body-sm text-muted-foreground">
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
                                                        ? "border-success bg-success-bg/50 shadow-sm ring-1 ring-success/25"
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
                                                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-badge font-semibold uppercase tracking-wider text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                                                                    Express
                                                                </span>
                                                            )}

                                                            {method.price === 0 && (
                                                                <span className="rounded-full bg-success-bg px-2 py-0.5 text-badge font-semibold uppercase tracking-wider text-success-foreground">
                                                                    Free
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 text-body-sm leading-relaxed text-muted-foreground">
                                                            {method.subtitle}
                                                        </p>

                                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-small font-medium text-muted-foreground">
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
                                                                ? "border-success bg-success text-white"
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
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success-bg text-success-foreground">
                                <CheckCircle2
                                    size={18}
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="min-w-0">
                                <p className="text-badge font-semibold uppercase tracking-wider text-success-foreground sm:text-small">
                                    Shipping Method
                                </p>

                                <h3 className="mt-0.5 truncate text-sm font-semibold text-foreground sm:text-base">
                                    {selectedMethod.name}
                                </h3>

                                <p className="mt-1 text-body-sm leading-relaxed text-muted-foreground">
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