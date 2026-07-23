"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Truck,
    Zap,
    ShieldCheck,
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
            transition={{ duration: 0.35 }}
            className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${
                disabled
                    ? "border-neutral-100 opacity-60"
                    : "border-neutral-200"
            }`}
        >
            <button
                type="button"
                onClick={disabled ? undefined : onOpen}
                disabled={disabled}
                className="flex w-full items-center justify-between px-6 py-5 disabled:cursor-not-allowed"
            >
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
                            open
                                ? "bg-black text-white"
                                : "bg-neutral-100 text-neutral-600"
                        }`}
                    >
                        <Truck size={20} />
                    </div>

                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                                2
                            </span>
                            <h2 className="text-lg font-semibold">
                                Shipping Method
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-neutral-500">
                            {disabled
                                ? "Add an address first"
                                : selectedMethod
                                  ? selectedMethod.name
                                  : "Select delivery speed"}
                        </p>
                    </div>
                </div>

                {open ? (
                    <ChevronDown size={22} className="text-neutral-500" />
                ) : (
                    <ChevronRight size={22} className="text-neutral-500" />
                )}
            </button>

            <AnimatePresence initial={false}>
                {open && !disabled && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-neutral-100"
                    >
                        <div className="space-y-4 p-6">
                            {methods.map((method) => {
                                const selected =
                                    selectedMethod?.id === method.id;

                                return (
                                    <motion.button
                                        layout
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.99 }}
                                        key={method.id}
                                        type="button"
                                        onClick={() => onSelect(method)}
                                        className={`w-full overflow-hidden rounded-3xl border text-left transition-all ${
                                            selected
                                                ? "border-black bg-black text-white shadow-xl"
                                                : "border-neutral-200 bg-white hover:border-black"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between p-6">
                                            <div className="flex gap-4">
                                                <div
                                                    className={`rounded-2xl p-3 ${
                                                        selected
                                                            ? "bg-white/10"
                                                            : "bg-neutral-100"
                                                    }`}
                                                >
                                                    {method.id === "express" ? (
                                                        <Zap
                                                            size={20}
                                                            className={
                                                                selected
                                                                    ? "text-white"
                                                                    : "text-neutral-700"
                                                            }
                                                        />
                                                    ) : (
                                                        <Truck
                                                            size={20}
                                                            className={
                                                                selected
                                                                    ? "text-white"
                                                                    : "text-neutral-700"
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {method.name}
                                                    </h3>

                                                    <p
                                                        className={`mt-1 text-sm ${
                                                            selected
                                                                ? "text-neutral-300"
                                                                : "text-neutral-500"
                                                        }`}
                                                    >
                                                        {method.subtitle}
                                                    </p>

                                                    <div
                                                        className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                                                            selected
                                                                ? "bg-white/10"
                                                                : "bg-neutral-100"
                                                        }`}
                                                    >
                                                        <ShieldCheck size={14} />
                                                        Secure Delivery
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <h4 className="text-xl font-bold">
                                                    {method.price === 0
                                                        ? "FREE"
                                                        : `₹${method.price}`}
                                                </h4>

                                                <p
                                                    className={`mt-2 text-sm ${
                                                        selected
                                                            ? "text-neutral-300"
                                                            : "text-neutral-500"
                                                    }`}
                                                >
                                                    {method.eta}
                                                </p>

                                                {selected && (
                                                    <CheckCircle2
                                                        size={22}
                                                        className="ml-auto mt-5 text-emerald-400"
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
                <div className="border-t border-neutral-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-600">
                                Shipping Selected
                            </p>

                            <h4 className="mt-1 font-semibold">
                                {selectedMethod.name}
                            </h4>

                            <p className="mt-1 text-sm text-neutral-500">
                                {selectedMethod.eta}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onOpen}
                            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium transition hover:border-black hover:bg-black hover:text-white"
                        >
                            Change
                        </button>
                    </div>
                </div>
            )}
        </motion.section>
    );
}
