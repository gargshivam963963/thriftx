"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    ChevronRight,
    CreditCard,
    ShieldCheck,
    LockKeyhole,
    BadgeCheck,
    CheckCircle2,
    Lock,
    IndianRupee,
    Wallet,
    Smartphone,
    Banknote,
    Landmark,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "@/lib/types/order";

interface PaymentSectionProps {
    open: boolean;
    onOpen: () => void;
    onPay: (method: PaymentMethod) => void;
    paymentLoading: boolean;
    canPay: boolean;
    disabled?: boolean;
    selectedMethod: PaymentMethod | null;
}

export default function PaymentSection({
    open,
    onOpen,
    onPay,
    paymentLoading,
    canPay,
    disabled = false,
    selectedMethod,
}: PaymentSectionProps) {
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
                        <CreditCard size={20} />
                    </div>

                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] sm:text-xs font-bold text-white">
                                3
                            </span>
                            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
                                Payment
                            </h2>
                        </div>
                        <p className="mt-0.5 text-xs sm:text-sm text-zinc-500">
                            {disabled
                                ? "Select shipping first"
                                : selectedMethod === "cod"
                                    ? "Pay with cash on delivery"
                                    : "Secure checkout with Razorpay"}
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
                        <div className="space-y-4 p-5 sm:p-6">
                            {/* COD Option */}
                            <PaymentOption
                                icon={<IndianRupee size={22} />}
                                title="Cash on Delivery"
                                description="Pay when your order arrives at your doorstep. No online payment required."
                                badge="Pay Later"
                                badgeColor="bg-amber-100 text-amber-700"
                                features={[
                                    "No advance payment needed",
                                    "Pay in cash at delivery",
                                    "Inspect before you pay",
                                ]}
                                selected={selectedMethod === "cod"}
                                onClick={() => onPay("cod")}
                                loading={paymentLoading && selectedMethod === "cod"}
                                canPay={canPay}
                            />

                            {/* Razorpay Option */}
                            <PaymentOption
                                icon={<Wallet size={22} />}
                                title="Pay Online (Razorpay)"
                                description="Fast & secure payment via UPI, Cards, Net Banking, Wallets & more."
                                badge="Instant"
                                badgeColor="bg-blue-100 text-blue-700"
                                features={[
                                    "UPI • GPay • PhonePe • Paytm",
                                    "Credit & Debit Cards",
                                    "Net Banking • Wallets",
                                ]}
                                selected={selectedMethod === "razorpay"}
                                onClick={() => onPay("razorpay")}
                                loading={paymentLoading && selectedMethod === "razorpay"}
                                canPay={canPay}
                            />

                            {/* Trust Badges */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2"
                            >
                                <TrustBadge
                                    icon={<ShieldCheck size={16} />}
                                    title="100% Secure"
                                    subtitle="Encrypted checkout"
                                />
                                <TrustBadge
                                    icon={<LockKeyhole size={16} />}
                                    title="Razorpay"
                                    subtitle="Trusted gateway"
                                />
                                <TrustBadge
                                    icon={<BadgeCheck size={16} />}
                                    title="Buyer Protection"
                                    subtitle="Covered purchase"
                                />
                            </motion.div>

                            {/* Security Note */}
                            <div className="flex items-center gap-2 rounded-2xl bg-zinc-50 px-4 py-3 text-xs sm:text-sm text-zinc-500">
                                <Lock size={14} className="shrink-0 text-zinc-400" />
                                <span>
                                    Your payment information is encrypted and processed securely by Razorpay.
                                    We never store your card details.
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!open && !disabled && (
                <div className="border-t border-zinc-100 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 sm:p-2 text-emerald-600">
                                <CheckCircle2 size={16} className="sm:h-[18px] sm:w-[18px]" />
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                                    Payment Method
                                </p>
                                <h4 className="mt-0.5 font-semibold text-zinc-900 text-sm sm:text-base">
                                    {selectedMethod === "cod" ? "Cash on Delivery" : "Online Payment (Razorpay)"}
                                </h4>
                                <p className="text-xs sm:text-sm text-zinc-500">
                                    {selectedMethod === "cod"
                                        ? "Pay cash at your doorstep"
                                        : "UPI • Cards • Net Banking • Wallets"}
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

interface PaymentOptionProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    badge: string;
    badgeColor: string;
    features: string[];
    selected: boolean;
    onClick: () => void;
    loading: boolean;
    canPay: boolean;
}

function PaymentOption({
    icon,
    title,
    description,
    badge,
    badgeColor,
    features,
    selected,
    onClick,
    loading,
    canPay,
}: PaymentOptionProps) {
    return (
        <motion.button
            layout
            whileHover={selected ? undefined : { y: -2 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={onClick}
            disabled={!canPay}
            className={`w-full overflow-hidden rounded-3xl border text-left transition-all ${selected
                    ? "border-zinc-900 bg-zinc-900 text-white shadow-xl"
                    : "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-md"
                } disabled:cursor-not-allowed disabled:opacity-50`}
        >
            <div className="flex items-start justify-between p-5 sm:p-6">
                <div className="flex gap-3 sm:gap-4">
                    <div
                        className={`rounded-2xl p-2.5 sm:p-3 transition-colors ${selected ? "bg-white/10" : "bg-zinc-100"
                            }`}
                    >
                        {icon}
                    </div>

                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
                            <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${selected ? "bg-white/20 text-white" : badgeColor
                                    }`}
                            >
                                {badge}
                            </span>
                        </div>

                        <p
                            className={`mt-2 text-sm leading-6 ${selected ? "text-zinc-300" : "text-zinc-500"
                                }`}
                        >
                            {description}
                        </p>

                        {/* Features List */}
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                            {features.map((feature, i) => (
                                <span
                                    key={i}
                                    className={`inline-flex items-center gap-1 text-xs ${selected ? "text-zinc-300" : "text-zinc-500"
                                        }`}
                                >
                                    <CheckCircle2
                                        size={12}
                                        className={selected ? "text-emerald-400" : "text-emerald-500"}
                                    />
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {selected && (
                    <CheckCircle2
                        className="shrink-0 text-emerald-400"
                        size={24}
                    />
                )}
            </div>

            {/* Action Button */}
            {selected && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-white/10 bg-white/[0.03] px-5 py-4 sm:px-6 sm:py-5"
                >
                    <Button
                        type="button"
                        onClick={onClick}
                        loading={loading}
                        disabled={!canPay}
                        fullWidth
                        size="lg"
                        leftIcon={
                            title.includes("COD") ? (
                                <IndianRupee className="h-4 w-4" />
                            ) : (
                                <Lock className="h-4 w-4" />
                            )
                        }
                        className="rounded-2xl bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg"
                    >
                        {title.includes("COD")
                            ? "Place Order (Pay on Delivery)"
                            : "Continue to Payment"}
                    </Button>
                </motion.div>
            )}
        </motion.button>
    );
}

function TrustBadge({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 transition hover:border-zinc-300 hover:shadow-sm">
            <div className="mb-3 inline-flex rounded-xl bg-zinc-100 p-2.5">
                {icon}
            </div>
            <h4 className="text-sm font-semibold text-zinc-900">{title}</h4>
            <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
        </div>
    );
}

