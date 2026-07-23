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
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaymentSectionProps {
    open: boolean;
    onOpen: () => void;
    onPay: () => void;
    paymentLoading: boolean;
    canPay: boolean;
    disabled?: boolean;
}

export default function PaymentSection({
    open,
    onOpen,
    onPay,
    paymentLoading,
    canPay,
    disabled = false,
}: PaymentSectionProps) {
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
                        <CreditCard size={20} />
                    </div>

                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                                3
                            </span>
                            <h2 className="text-lg font-semibold text-neutral-900">
                                Payment
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-neutral-500">
                            {disabled
                                ? "Select shipping first"
                                : "Secure payment powered by Razorpay"}
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
                        <div className="p-6">
                            <motion.div
                                layout
                                whileHover={{ y: -2 }}
                                className="overflow-hidden rounded-3xl border border-black bg-black text-white"
                            >
                                <div className="flex items-start justify-between p-6">
                                    <div className="flex gap-4">
                                        <div className="rounded-2xl bg-white/10 p-3">
                                            <CreditCard size={22} />
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-semibold">
                                                Razorpay Secure Checkout
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-neutral-300">
                                                Pay securely using UPI, Credit
                                                Card, Debit Card, Net Banking or
                                                Wallets.
                                            </p>

                                            <div className="mt-5 flex flex-wrap gap-2">
                                                <Badge
                                                    icon={
                                                        <ShieldCheck size={14} />
                                                    }
                                                    text="256-bit Encryption"
                                                />
                                                <Badge
                                                    icon={
                                                        <LockKeyhole size={14} />
                                                    }
                                                    text="PCI DSS Secure"
                                                />
                                                <Badge
                                                    icon={
                                                        <BadgeCheck size={14} />
                                                    }
                                                    text="Trusted Payments"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <CheckCircle2
                                        className="text-emerald-400"
                                        size={24}
                                    />
                                </div>

                                <div className="border-t border-white/10 bg-white/[0.03] px-6 py-5">
                                    <Button
                                        type="button"
                                        onClick={onPay}
                                        loading={paymentLoading}
                                        disabled={!canPay}
                                        fullWidth
                                        size="lg"
                                        leftIcon={<Lock className="h-4 w-4" />}
                                        className="rounded-2xl bg-white text-black hover:bg-neutral-100"
                                    >
                                        Continue to Payment
                                    </Button>
                                </div>
                            </motion.div>

                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                <TrustCard
                                    icon={<ShieldCheck size={18} />}
                                    title="Secure"
                                    subtitle="Encrypted payments"
                                />
                                <TrustCard
                                    icon={<LockKeyhole size={18} />}
                                    title="Safe Checkout"
                                    subtitle="Powered by Razorpay"
                                />
                                <TrustCard
                                    icon={<BadgeCheck size={18} />}
                                    title="Trusted"
                                    subtitle="100% buyer protection"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!open && !disabled && (
                <div className="border-t border-neutral-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-600">
                                Payment Gateway
                            </p>

                            <h4 className="mt-1 font-semibold text-neutral-900">
                                Razorpay
                            </h4>

                            <p className="mt-1 text-sm text-neutral-500">
                                UPI • Cards • Wallets • Net Banking
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onOpen}
                            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium transition hover:border-black hover:bg-black hover:text-white"
                        >
                            View
                        </button>
                    </div>
                </div>
            )}
        </motion.section>
    );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium">
            {icon}
            {text}
        </div>
    );
}

function TrustCard({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="rounded-2xl border border-neutral-200 p-5">
            <div className="mb-4 inline-flex rounded-xl bg-neutral-100 p-3">
                {icon}
            </div>
            <h4 className="font-semibold text-neutral-900">{title}</h4>
            <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        </div>
    );
}
