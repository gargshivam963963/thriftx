"use client";


import { Button } from '@/components/ui/button';import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Truck,
    Zap,
    ShieldCheck,
    Clock,
    PackageCheck,
    Sparkles,
    Loader2,
    PackageOpen,
} from "lucide-react";

import type { ShippingMethod } from "../CheckoutAccordion";

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

function MethodIcon({ id }: { id: string }) {
    if (id === "express") {
        return (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 sm:h-12 sm:w-12 sm:rounded-2xl">
                <Zap size={18} className="sm:h-[20px] sm:w-[20px]" />
            </div>
        );
    }
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground sm:h-12 sm:w-12 sm:rounded-2xl">
            <Truck size={18} className="sm:h-[20px] sm:w-[20px]" />
        </div>
    );
}

function ShippingSkeleton() {
    return (
        <div className="space-y-3 p-4 sm:p-6">
            {[1, 2].map((i) => (
                <div
                    key={i}
                    className="flex animate-pulse items-center gap-4 rounded-2xl border border-border p-4 sm:rounded-3xl sm:p-5"
                >
                    <div className="h-10 w-10 rounded-xl bg-muted sm:h-12 sm:w-12 sm:rounded-2xl" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-36 rounded bg-muted sm:w-48" />
                        <div className="h-3 w-24 rounded bg-muted" />
                    </div>
                    <div className="h-6 w-16 rounded-lg bg-muted" />
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
            className="flex flex-col items-center gap-3 px-4 py-10 text-center sm:px-6"
        >
            <div className="rounded-full bg-muted p-4">
                <PackageOpen size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
                No shipping options available
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
                We couldn&apos;t find courier services for this pincode. Please check your
                delivery address.
            </p>
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
    return (
        <motion.section
            layout
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`overflow-hidden rounded-2xl border bg-card shadow-sm sm:rounded-3xl ${disabled ? "border-border opacity-60" : "border-border"
                }`}
        >
            {/* ── Header ──────────────────────────────────────────────────────── */}
            <Button
                type="button"
                onClick={disabled ? undefined : onOpen}
                disabled={disabled}
                className="flex w-full items-center justify-between px-4 py-4 sm:px-6 sm:py-5 disabled:cursor-not-allowed"
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 sm:h-12 sm:w-12 sm:rounded-2xl ${open
                                ? "bg-foreground text-white shadow-lg shadow-foreground/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                    >
                        <Truck size={18} className="sm:h-[20px] sm:w-[20px]" />
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white sm:h-6 sm:w-6 sm:text-xs">
                                2
                            </span>
                            <h2 className="text-sm font-semibold text-foreground sm:text-base sm:text-lg">
                                Shipping
                            </h2>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                            {disabled
                                ? "Select an address first"
                                : isLocalDelivery
                                    ? "Same-day local delivery"
                                    : loading
                                        ? "Fetching courier rates..."
                                        : selectedMethod
                                            ? `${selectedMethod.name} — ₹${selectedMethod.price}`
                                            : "Choose a delivery method"}
                        </p>
                    </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {open ? (
                        <ChevronDown size={18} className="text-muted-foreground" />
                    ) : (
                        <ChevronRight size={18} className="text-muted-foreground" />
                    )}
                </div>
            </Button>

            {/* ── Body ────────────────────────────────────────────────────────── */}
            <AnimatePresence initial={false}>
                {open && !disabled && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-border"
                    >
                        {loading ? (
                            <ShippingSkeleton />
                        ) : methods.length === 0 ? (
                            <EmptyShipping />
                        ) : (
                            <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
                                {methods.map((method) => {
                                    const selected = selectedMethod?.id === method.id;
                                    return (
                                        <motion.button
                                            key={method.id}
                                            layout
                                            whileHover={
                                                selected ? undefined : { y: -2, scale: 1.005 }
                                            }
                                            whileTap={{ scale: 0.99 }}
                                            type="button"
                                            onClick={() => onSelect(method)}
                                            className={`w-full overflow-hidden rounded-2xl border text-left transition-all sm:rounded-3xl ${selected
                                                    ? "border-foreground bg-foreground text-white shadow-xl"
                                                    : "border-border bg-card hover:border-foreground hover:shadow-md"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between p-4 sm:p-6">
                                                <div className="flex gap-3 sm:gap-4">
                                                    <MethodIcon id={method.id} />

                                                    <div>
                                                        <div className="flex items-center gap-2.5 flex-wrap">
                                                            <h3 className="text-sm font-semibold sm:text-base">
                                                                {method.name}
                                                            </h3>
                                                            {method.id === "express" && (
                                                                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                                                                    Faster
                                                                </span>
                                                            )}
                                                            {method.price === 0 && (
                                                                <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                                                                    Free
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p
                                                            className={`mt-1 text-xs leading-5 sm:mt-1.5 sm:text-sm sm:leading-6 ${selected ? "text-muted-foreground" : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            {method.subtitle}
                                                        </p>

                                                        {/* Delivery ETA Badge */}
                                                        <div className="mt-2 flex items-center gap-3">
                                                            <span
                                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${selected
                                                                        ? "bg-card/10 text-muted-foreground"
                                                                        : "bg-muted text-muted-foreground"
                                                                    }`}
                                                            >
                                                                <Clock size={11} />
                                                                {method.eta}
                                                            </span>

                                                            {method.price > 0 && (
                                                                <span
                                                                    className={`text-[11px] font-semibold ${selected
                                                                            ? "text-muted-foreground"
                                                                            : "text-muted-foreground"
                                                                        }`}
                                                                >
                                                                    ₹{method.price}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {selected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 300,
                                                            damping: 15,
                                                        }}
                                                    >
                                                        <CheckCircle2
                                                            className="shrink-0 text-emerald-400"
                                                            size={22}
                                                        />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}

                                {/* Trust badges */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3"
                                >
                                    <div className="rounded-xl border border-border bg-card p-3 transition hover:border-border hover:shadow-sm sm:rounded-2xl sm:p-4">
                                        <div className="mb-2 inline-flex rounded-lg bg-muted p-2 sm:rounded-xl sm:p-2.5">
                                            <ShieldCheck size={15} className="text-muted-foreground" />
                                        </div>
                                        <h4 className="text-xs font-semibold text-foreground sm:text-sm">
                                            Tracked Shipment
                                        </h4>
                                        <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                                            Real-time tracking
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-card p-3 transition hover:border-border hover:shadow-sm sm:rounded-2xl sm:p-4">
                                        <div className="mb-2 inline-flex rounded-lg bg-muted p-2 sm:rounded-xl sm:p-2.5">
                                            <PackageCheck size={15} className="text-muted-foreground" />
                                        </div>
                                        <h4 className="text-xs font-semibold text-foreground sm:text-sm">
                                            Secure Packing
                                        </h4>
                                        <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                                            Bubble-wrapped
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-card p-3 transition hover:border-border hover:shadow-sm sm:rounded-2xl sm:p-4">
                                        <div className="mb-2 inline-flex rounded-lg bg-muted p-2 sm:rounded-xl sm:p-2.5">
                                            <Sparkles size={15} className="text-muted-foreground" />
                                        </div>
                                        <h4 className="text-xs font-semibold text-foreground sm:text-sm">
                                            Quality Check
                                        </h4>
                                        <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                                            Inspected before ship
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Collapsed State Summary ──────────────────────────────────────── */}
            {!open && !disabled && selectedMethod && (
                <div className="border-t border-border px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-600 sm:p-2">
                                <CheckCircle2 size={16} className="sm:h-[18px] sm:w-[18px]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600 sm:text-[11px]">
                                    Shipping Method
                                </p>
                                <h4 className="mt-0.5 text-sm font-semibold text-foreground sm:text-base">
                                    {selectedMethod.name}
                                </h4>
                                <p className="text-xs text-muted-foreground sm:text-sm">
                                    {selectedMethod.eta}
                                    {selectedMethod.price === 0
                                        ? " • Free"
                                        : ` • ₹${selectedMethod.price}`}
                                </p>
                            </div>
                        </div>

                        <motion.button
                            type="button"
                            onClick={onOpen}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="shrink-0 rounded-xl border border-border px-3 py-1.5 text-xs font-medium transition hover:border-foreground hover:bg-foreground hover:text-white sm:px-4 sm:py-2 sm:text-sm"
                        >
                            Change
                        </motion.button>
                    </div>
                </div>
            )}
        </motion.section>
    );
}

