"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ShieldCheck,
    Truck,
    ChevronDown,
    Package,
    CreditCard,
    Gem,
    Zap,
} from "lucide-react";

export default function CheckoutHeader() {
    const [statsOpen, setStatsOpen] = useState(false);

    return (
        <motion.header
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-5 sm:mb-8"
        >
            {/* Back Link */}
            <Link
                href="/cart"
                className="group mb-4 inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-400 transition hover:text-zinc-900"
            >
                <div className="rounded-full border border-zinc-200 bg-white p-1.5 transition group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
                    <ArrowLeft size={14} />
                </div>
                Back to Cart
            </Link>

            {/* Header Card - Dark Premium */}
            <div className="relative overflow-hidden rounded-3xl sm:rounded-[32px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 sm:p-8 md:p-10 text-white shadow-2xl">
                {/* Decorative elements */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="pointer-events-none absolute right-1/4 top-1/3 h-px w-32 rotate-45 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left Content */}
                    <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm border border-white/10">
                                <Gem size={12} />
                                Checkout
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1.5 text-[10px] sm:text-xs font-medium text-emerald-300 border border-emerald-500/20">
                                <ShieldCheck size={12} />
                                Secure
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3.5 py-1.5 text-[10px] sm:text-xs font-medium text-amber-300 border border-amber-500/20">
                                <Zap size={12} />
                                Express Available
                            </span>
                        </div>

                        <h1 className="mt-4 sm:mt-6 font-serif text-3xl sm:text-4xl md:text-[3.2rem] font-bold tracking-tight text-white leading-[1.1]">
                            Almost there!
                        </h1>

                        <p className="mt-3 sm:mt-4 max-w-xl text-sm sm:text-[15px] leading-6 sm:leading-7 text-white/60">
                            You&apos;re just a few steps away from owning curated premium thrift
                            pieces. Every item is quality checked and packed with care.
                        </p>
                    </div>

                    {/* Desktop Stats */}
                    <div className="hidden lg:grid grid-cols-3 gap-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 xl:p-5 min-w-[340px] xl:min-w-[380px]">
                        <Stat title="Dispatch" value="24 Hours" icon={Package} />
                        <Stat title="Delivery" value="2–5 Days" icon={Truck} />
                        <Stat title="Payment" value="Razorpay" icon={CreditCard} />
                    </div>

                    {/* Mobile Stats Toggle */}
                    <div className="mt-4 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setStatsOpen(!statsOpen)}
                            className="flex w-full items-center justify-between rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 text-left text-white/80"
                        >
                            <div className="flex items-center gap-2">
                                <Package size={16} className="text-white/60" />
                                <span className="text-sm font-medium">Delivery &amp; Payment Info</span>
                            </div>
                            <motion.div
                                animate={{ rotate: statsOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={18} className="text-white/60" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {statsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-3">
                                        <Stat title="Dispatch" value="24h" icon={Package} compact />
                                        <Stat title="Delivery" value="2–5d" icon={Truck} compact />
                                        <Stat title="Payment" value="Secure" icon={CreditCard} compact />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Info Badges - Desktop */}
                    <div className="mt-4 sm:mt-6 sm:flex sm:flex-wrap gap-2.5 hidden">
                        <InfoBadge icon={<Package size={14} />} title="Verified Products" subtitle="Quality checked" />
                        <InfoBadge icon={<Truck size={14} />} title="Fast Shipping" subtitle="Live tracking" />
                        <InfoBadge icon={<CreditCard size={14} />} title="Secure Payment" subtitle="UPI • Cards • Wallet" />
                    </div>

                    {/* Mobile Compact Stats */}
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
                        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-2.5 text-center">
                            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Dispatch</p>
                            <p className="mt-0.5 text-sm font-bold text-white">24h</p>
                        </div>
                        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-2.5 text-center">
                            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Delivery</p>
                            <p className="mt-0.5 text-sm font-bold text-white">2–5d</p>
                        </div>
                        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-2.5 text-center">
                            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Pay</p>
                            <p className="mt-0.5 text-sm font-bold text-white">Secure</p>
                        </div>
                    </div>
                </motion.header>
                );
}

                // --- Sub-components ---

                interface StatProps {
                    title: string;
                value: string;
                icon?: React.ComponentType<{ size ?: number; className?: string }>;
                compact?: boolean;
}

                function Stat({title, value, icon: Icon, compact }: StatProps) {
  return (
                <div className={`${compact ? "text-center" : ""}`}>
                    <div className={`flex items-center ${compact ? "justify-center" : ""} gap-1.5`}>
                        {Icon && <Icon size={compact ? 11 : 13} className="text-white/50" />}
                        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                            {title}
                        </p>
                    </div>
                    <p className={`mt-0.5 sm:mt-1 font-serif font-bold text-white ${compact ? "text-sm" : "text-lg"}`}>
                        {value}
                    </p>
                </div>
                );
}

                function InfoBadge({
                    icon,
                    title,
                    subtitle,
}: {
                    icon: React.ReactNode;
                title: string;
                subtitle: string;
}) {
  return (
                <div className="flex flex-1 items-start gap-2.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-3">
                    <div className="rounded-xl bg-white/10 p-2 shrink-0">{icon}</div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white">{title}</h4>
                        <p className="mt-0.5 text-xs leading-5 text-white/50">{subtitle}</p>
                    </div>
                    );
}
