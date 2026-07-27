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
    Sparkles,
    Clock,
} from "lucide-react";

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatProps {
    title: string;
    value: string;
    Icon?: React.ComponentType<{ size?: number; className?: string }>;
    compact?: boolean;
}

function Stat({ title, value, Icon, compact }: StatProps) {
    return (
        <div className={compact ? "text-center" : ""}>
            <div
                className={`flex items-center ${compact ? "justify-center" : ""} gap-1.5`}
            >
                {Icon && (
                    <Icon
                        size={compact ? 11 : 13}
                        className="text-white/50"
                    />
                )}
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                    {title}
                </p>
            </div>
            <p
                className={`mt-0.5 sm:mt-1 font-bold text-white ${compact ? "text-sm" : "text-lg"
                    }`}
            >
                {value}
            </p>
        </div>
    );
}

interface InfoBadgeProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}

function InfoBadge({ icon, title, subtitle }: InfoBadgeProps) {
    return (
        <div className="flex flex-1 items-start gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <div className="shrink-0 rounded-xl bg-white/10 p-2">{icon}</div>
            <div>
                <h4 className="text-xs font-bold text-white sm:text-sm">
                    {title}
                </h4>
                <p className="mt-0.5 text-xs leading-5 text-white/50">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
                className="group mb-4 inline-flex items-center gap-2 text-xs font-medium text-neutral-400 transition-all hover:text-neutral-900 sm:text-sm"
            >
                <motion.div
                    whileHover={{ x: -2 }}
                    className="flex items-center gap-2"
                >
                    <div className="rounded-full border border-neutral-200 bg-white p-1.5 shadow-sm transition group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                        <ArrowLeft size={14} />
                    </div>
                    Back to Cart
                </motion.div>
            </Link>

            {/* ─── Premium Header Card ───────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-6 text-white shadow-2xl sm:rounded-[32px] sm:p-8 md:p-10">
                {/* Decorative Glows */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="pointer-events-none absolute right-1/4 top-1/3 h-px w-32 rotate-45 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="pointer-events-none absolute bottom-1/4 right-10 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl" />

                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* ── Left Content ────────────────────────────────── */}
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="flex flex-wrap items-center gap-2 sm:gap-3"
                        >
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm sm:text-[11px]">
                                <Gem size={12} />
                                Checkout
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/20 px-3.5 py-1.5 text-[10px] font-medium text-emerald-300 sm:text-xs">
                                <ShieldCheck size={12} />
                                Secure
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/20 px-3.5 py-1.5 text-[10px] font-medium text-amber-300 sm:text-xs">
                                <Zap size={12} />
                                Express Available
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.4 }}
                            className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-white sm:mt-6 sm:text-4xl md:text-[3.2rem]"
                        >
                            Almost there!
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="mt-3 max-w-xl text-sm leading-6 text-white/60 sm:mt-4 sm:text-[15px] sm:leading-7"
                        >
                            You&apos;re just a few steps away from owning curated premium
                            thrift pieces. Every item is quality checked and packed with
                            care.
                        </motion.p>

                        {/* Info Badges – Desktop only */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.4 }}
                            className="mt-4 hidden flex-wrap gap-2.5 sm:mt-6 sm:flex"
                        >
                            <InfoBadge
                                icon={<Package size={14} />}
                                title="Verified Products"
                                subtitle="Quality checked"
                            />
                            <InfoBadge
                                icon={<Truck size={14} />}
                                title="Fast Shipping"
                                subtitle="Live tracking"
                            />
                            <InfoBadge
                                icon={<CreditCard size={14} />}
                                title="Secure Payment"
                                subtitle="UPI • Cards • Wallet"
                            />
                        </motion.div>
                    </div>

                    {/* ── Right Stats – Desktop ──────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.45 }}
                        className="hidden min-w-[340px] grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl xl:min-w-[380px] xl:p-5 lg:grid"
                    >
                        <Stat title="Dispatch" value="24 Hours" Icon={Package} />
                        <Stat title="Delivery" value="2–5 Days" Icon={Truck} />
                        <Stat title="Payment" value="Razorpay" Icon={CreditCard} />
                    </motion.div>

                    {/* ── Mobile Stats Toggle ────────────────────────── */}
                    <div className="mt-4 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setStatsOpen(!statsOpen)}
                            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white/80 backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-white/60" />
                                <span className="text-sm font-medium">
                                    Delivery &amp; Payment Info
                                </span>
                            </div>
                            <motion.div
                                animate={{ rotate: statsOpen ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
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
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                                        <Stat
                                            title="Dispatch"
                                            value="24h"
                                            Icon={Package}
                                            compact
                                        />
                                        <Stat
                                            title="Delivery"
                                            value="2–5d"
                                            Icon={Truck}
                                            compact
                                        />
                                        <Stat
                                            title="Payment"
                                            value="Secure"
                                            Icon={CreditCard}
                                            compact
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Mobile Compact Stats (always visible) ──────── */}
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center backdrop-blur-sm">
                            <Clock size={12} className="mx-auto text-white/50" />
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                                Dispatch
                            </p>
                            <p className="text-sm font-bold text-white">24h</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center backdrop-blur-sm">
                            <Truck size={12} className="mx-auto text-white/50" />
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                                Delivery
                            </p>
                            <p className="text-sm font-bold text-white">2–5d</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center backdrop-blur-sm">
                            <ShieldCheck size={12} className="mx-auto text-white/50" />
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                                Pay
                            </p>
                            <p className="text-sm font-bold text-white">Secure</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
