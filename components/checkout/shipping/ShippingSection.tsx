"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Truck,
    Zap,
    ShieldCheck,
    Clock,
    PackageCheck,
} from "lucide-react";

import type { ShippingMethod } from "../CheckoutAccordion";

interface ShippingSectionProps {
    open: boolean;
    methods: ShippingMethod[];
    selectedMethod: ShippingMethod | null;
    onSelect: (method: ShippingMethod) => void;
    onOpen: () => void;
    disabled?: boolean;
}

export default function ShippingSection({
    open,
    methods,
    selectedMethod,
    onSelect,
    onOpen,
    disabled = false,
}: ShippingSectionProps) {
    return (
        <motion.section
            layout
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${disabled
                    ? "border-zinc-100 opacity-60"
                    : "border-zinc-200"
                }`}
        >
            <button
                type="button"
                onClick={disabled ? undefined : onOpen}
                disabled={disabled}
                className="flex w-full items-center justify-between px-5 py-4 sm:px-6 sm:py-5 disabled:cursor-not-allowed"
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <div
                        className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl transition-all duration-300 ${open
                                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                    >
                        <Truck size={20} />
                    </div>

                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] sm:text-xs font-bold text-white">
                                2
                            </span>
                            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
                                Shipping Method
                            </h2>
                        </div>
                        <p className="mt-0.5 text-xs sm:text-sm text-zinc-500">
                            {disabled
                                ? "Add an address first"
                                : selectedMethod
                                    ? `${selectedMethod.name} — ${selectedMethod.eta}`
                                    : "Select delivery speed"}
                        </p>
                    </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100">
                    {open ? (
                        <ChevronDown size={18} className="text-zinc-500" />
                    ) : (
                        <ChevronRight size={18} className="text-zinc-500" />
                    )}
                </div>
            </button>

            <AnimatePresence initial={false}>
                {open && !disabled && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-zinc-100"
                    >
                        <div className="space-y-3 p-5 sm:p-6">
                            {/* Delivery info banner */}
                            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-800">
                                <PackageCheck size={16} className="shrink-0 text-amber-600" />
                                <span>
                                    Free delivery available on standard shipping. All orders include
                                    tracking and insurance.
                                </span>
                            </div>

                            {methods.map((method) => {
                                const selected = selectedMethod?.id === method.id;
                                const isFree = method.price === 0;

                                return (
                                    <motion.button
                                        layout
                                        whileHover={selected ? undefined : { y: -2 }}
                                        whileTap={{ scale: 0.99 }}
                                        key={method.id}
                                        type="button"
                                        onClick={() => onSelect(method)}
                                        className={`w-full overflow-hidden rounded-3xl border text-left transition-all ${selected
                                                ? "border-zinc-900 bg-zinc-900 text-white shadow-xl"
                                                : "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-md"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between p-5 sm:p-6">
                                            <div className="flex gap-3 sm:gap-4">
                                                {/* Icon */}
                                                <div
                                                    className={`rounded-2xl p-2.5 sm:p-3 transition-colors ${selected ? "bg-white/10" : "bg-zinc-100"
                                                        }`}
                                                >
                                                    {method.id === "express" ? (
                                                        <Zap size={20} className={selected ? "text-white" : "text-zinc-700"} />
                                                    ) : (
                                                        <Truck size={20} className={selected ? "text-white" : "text-zinc-700"} />
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div>
                                                    <div className="flex items-center gap-2.5 flex-wrap">
                                                        <h3 className="text-base sm:text-lg font-semibold">
                                                            {method.name}
                                                        </h3>
                                                        {isFree && (
                                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${selected ? "bg-emerald-400/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                                                                }`}>
                                                                Best Value
                                                            </span>
                                                        )}
                                                        {method.id === "express" && (
                                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${selected ? "bg-amber-400/20 text-amber-300" : "bg-amber-100 text-amber-700"
                                                                }`}>
                                                                Most Popular
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${selected ? "text-zinc-300" : "text-zinc-500"
                                                        }`}>
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock size={14} />
                                                            {method.eta}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <ShieldCheck size={14} />
                                                            Insured Delivery
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right shrink-0 ml-4">
                                                <h4 className={`text-xl sm:text-2xl font-bold ${isFree ? "text-emerald-500" : ""}`}>
                                                    {isFree ? "FREE" : `₹${method.price}`}
                                                </h4>
                                                {selected && (
                                                    <CheckCircle2
                                                        size={20}
                                                        className="ml-auto mt-2 text-emerald-400"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!open && selectedMethod && (
                <div className="border-t border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 sm:p-2 text-emerald-600">
                                <CheckCircle2 size={16} className="sm:h-[18px] sm:w-[18px]" />
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                                    Shipping Selected
                                </p>
                                <h4 className="mt-0.5 font-semibold text-zinc-900 text-sm sm:text-base">
                                    {selectedMethod.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-zinc-500">
                                    {selectedMethod.eta} {selectedMethod.price === 0 ? "• Free" : `• ₹${selectedMethod.price}`}
                                </p>
                            </div>
                        </div>

                        <motion.button
                            type="button"
                            onClick={onOpen}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="shrink-0 rounded-xl border border-zinc-200 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                        >
                            Change
                        </motion.button>
                    </div>
                </div>
            )}
        </motion.section>
    );
}

