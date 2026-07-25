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
    Sparkles,
} from "lucide-react";

import type { ShippingMethod } from "../CheckoutAccordion";

interface ShippingSectionProps {
    open: boolean;
    methods: ShippingMethod[];
    selectedMethod: ShippingMethod | null;
    onSelect: (method: ShippingMethod) => void;
    onOpen: () => void;
    disabled?: boolean;
    isLocalDelivery?: boolean;
}

export default function ShippingSection({
    open,
    methods,
    selectedMethod,
    onSelect,
    onOpen,
    disabled = false,
    isLocalDelivery = false,
}: ShippingSectionProps) {
    return (
        <motion.section
            layout
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-3xl ${disabled ? "border-zinc-100 opacity-60" : "border-zinc-200"
                }`}
        >
            <button
                type="button"
                onClick={disabled ? undefined : onOpen}
                disabled={disabled}
                className="flex w-full items-center justify-between px-4 py-4 sm:px-6 sm:py-5 disabled:cursor-not-allowed"
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 sm:h-12 sm:w-12 sm:rounded-2xl ${open
                            ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20"
                            : "bg-zinc-100 text-zinc-600"
                            }`}
                    >
                        <Truck size={18} className="sm:h-[20px] sm:w-[20px]" />
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white sm:h-6 sm:w-6 sm:text-xs">
                                2
                            </span>
                            <h2 className="text-sm font-semibold text-zinc-900 sm:text-base sm:text-lg">
                                Shipping Method
                            </h2>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
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
                        <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
                            {/* Delivery info banner */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs sm:rounded-2xl sm:text-sm ${isLocalDelivery
                                    ? "bg-gradient-to-r from-emerald-50 to-emerald-50/60 text-emerald-800"
                                    : "bg-gradient-to-r from-amber-50 to-amber-50/60 text-amber-800"
                                    }`}
                            >
                                <Sparkles
                                    size={16}
                                    className={`shrink-0 ${isLocalDelivery ? "text-emerald-600" : "text-amber-600"
                                        }`}
                                />
                                <span>
                                    {isLocalDelivery
                                        ? "🎉 CONGRATULATIONS! You're in Panipat — enjoy FREE same-day delivery in 30–60 mins + exclusive perks! 🚀"
                                        : "Free delivery on standard shipping. All orders include tracking &amp; insurance."}
                                </span>
                            </motion.div>

                            {methods.map((method, index) => {
                                const selected = selectedMethod?.id === method.id;
                                const isFree = method.price === 0;

                                return (
                                    <motion.button
                                        layout
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            transition: { delay: 0.08 * (index + 1) },
                                        }}
                                        whileHover={
                                            selected
                                                ? undefined
                                                : { y: -2, scale: 1.005 }
                                        }
                                        whileTap={{ scale: 0.99 }}
                                        key={method.id}
                                        type="button"
                                        onClick={() => onSelect(method)}
                                        className={`w-full overflow-hidden rounded-2xl border text-left transition-all sm:rounded-3xl ${selected
                                            ? "border-zinc-900 bg-zinc-900 text-white shadow-xl"
                                            : "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-md"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between p-4 sm:p-6">
                                            <div className="flex gap-3 sm:gap-4">
                                                <div
                                                    className={`rounded-xl p-2.5 transition-colors sm:rounded-2xl sm:p-3 ${selected
                                                        ? "bg-white/10"
                                                        : "bg-zinc-100"
                                                        }`}
                                                >
                                                    {method.id === "express" ? (
                                                        <Zap
                                                            size={18}
                                                            className={
                                                                selected
                                                                    ? "text-white"
                                                                    : "text-zinc-700"
                                                            }
                                                        />
                                                    ) : (
                                                        <Truck
                                                            size={18}
                                                            className={
                                                                selected
                                                                    ? "text-white"
                                                                    : "text-zinc-700"
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2.5 flex-wrap">
                                                        <h3 className="text-sm font-semibold sm:text-lg">
                                                            {method.name}
                                                        </h3>
                                                        {isFree && (
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${selected
                                                                    ? "bg-emerald-400/20 text-emerald-300"
                                                                    : "bg-emerald-100 text-emerald-700"
                                                                    }`}
                                                            >
                                                                {isLocalDelivery
                                                                    ? (method.id === "express" ? "🏆 INSANE SPEED" : "⚡ BLISTERING FAST")
                                                                    : "Best Value"}
                                                            </span>
                                                        )}
                                                        {method.id === "express" && (
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${selected
                                                                    ? "bg-amber-400/20 text-amber-300"
                                                                    : "bg-amber-100 text-amber-700"
                                                                    }`}
                                                            >
                                                                {isLocalDelivery
                                                                    ? "🚀 BREAKTHROUGH"
                                                                    : "Most Popular"}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div
                                                        className={`mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:mt-2 sm:text-sm ${selected
                                                            ? "text-zinc-300"
                                                            : "text-zinc-500"
                                                            }`}
                                                    >
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock size={13} />
                                                            {method.eta}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <ShieldCheck size={13} />
                                                            Insured
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="ml-4 shrink-0 text-right">
                                                <h4
                                                    className={`text-lg font-bold sm:text-2xl ${isFree
                                                        ? "text-emerald-500"
                                                        : selected
                                                            ? "text-white"
                                                            : "text-zinc-900"
                                                        }`}
                                                >
                                                    {isFree ? (
                                                        <span className="inline-flex items-center gap-1">
                                                            <PackageCheck
                                                                size={16}
                                                                className="sm:h-[20px] sm:w-[20px]"
                                                            />
                                                            FREE
                                                        </span>
                                                    ) : (
                                                        `₹${method.price}`
                                                    )}
                                                </h4>
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
                                                            size={18}
                                                            className="ml-auto mt-1 text-emerald-400 sm:mt-2"
                                                        />
                                                    </motion.div>
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
                <div className="border-t border-zinc-100 px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-600 sm:p-2">
                                <CheckCircle2
                                    size={16}
                                    className="sm:h-[18px] sm:w-[18px]"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600 sm:text-[11px]">
                                    Shipping Selected
                                </p>
                                <h4 className="mt-0.5 text-sm font-semibold text-zinc-900 sm:text-base">
                                    {selectedMethod.name}
                                </h4>
                                <p className="text-xs text-zinc-500 sm:text-sm">
                                    {selectedMethod.eta}{" "}
                                    {selectedMethod.price === 0
                                        ? "• Free"
                                        : `• ₹${selectedMethod.price}`}
                                </p>
                            </div>
                        </div>

                        <motion.button
                            type="button"
                            onClick={onOpen}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="shrink-0 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
                        >
                            Change
                        </motion.button>
                    </div>
                </div>
            )}
        </motion.section>
    );
}

