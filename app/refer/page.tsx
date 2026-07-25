"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Gift,
    Share2,
    Copy,
    CheckCircle2,
    ArrowLeft,
    Users,
    IndianRupee,
    Sparkles,
    Heart,
    PartyPopper,
    Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

// ─── Referral Stats ──────────────────────────────────────────────────────────

function ReferralStat({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                    {label}
                </p>
                <p className="font-serif text-xl font-bold text-zinc-900">
                    {value}
                </p>
            </div>
        </div>
    );
}

// ─── Step Card ───────────────────────────────────────────────────────────────

function StepCard({
    number,
    title,
    description,
}: {
    number: number;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white">
                {number}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

// ─── Main Referral Page ──────────────────────────────────────────────────────

export default function ReferPage() {
    const { user } = useAuth();

    const [copied, setCopied] = useState(false);

    const referralCode = user?.$id
        ? `THRIFTX-${user.$id.slice(0, 6).toUpperCase()}`
        : "THRIFTX-GUEST";
    const referralLink = `https://thriftx.in/refer?code=${referralCode}`;
    const referralCount = 0; // placeholder - will integrate with backend later

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            toast.success("Referral link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Could not copy link.");
        }
    };

    const handleShare = async () => {
        const text = `🎉 Get ₹100 OFF on your first premium thrift order!\n\nUse my referral code: ${referralCode}\n\nShop now → ${referralLink}\n\nTHRIFTX — Premium Thrift Fashion. Quality checked. Fast delivery.`;

        if (navigator.share) {
            await navigator.share({
                title: "THRIFTX - Refer & Earn",
                text,
            });
        } else {
            await navigator.clipboard.writeText(text);
            toast.success("Referral message copied!");
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50">
            <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
                {/* Back */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href={user ? "/profile" : "/"}
                        className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-900"
                    >
                        <div className="rounded-full border border-zinc-200 bg-white p-1.5 transition group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
                            <ArrowLeft size={14} />
                        </div>
                        {user ? "Profile" : "Home"}
                    </Link>
                </motion.div>

                {/* ── Hero ─────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-center text-white shadow-2xl sm:p-12"
                >
                    {/* Decorative */}
                    <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 15,
                            }}
                            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-zinc-900 shadow-lg"
                        >
                            <Gift size={28} />
                        </motion.div>

                        <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                            Refer & Earn ₹100
                        </h1>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/60">
                            Invite your friends to THRIFTX. They get{" "}
                            <strong className="text-white">₹100 OFF</strong> on
                            their first order, and you get{" "}
                            <strong className="text-white">₹100 store credit</strong>.
                        </p>
                    </div>
                </motion.div>

                {/* ── Stats ──────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6 grid grid-cols-2 gap-3"
                >
                    <ReferralStat
                        icon={<Users size={18} className="text-white" />}
                        label="Friends Referred"
                        value={String(referralCount)}
                        color="bg-zinc-900 text-white"
                    />
                    <ReferralStat
                        icon={<IndianRupee size={18} className="text-white" />}
                        label="Credit Earned"
                        value={`₹${referralCount * 100}`}
                        color="bg-emerald-600 text-white"
                    />
                </motion.div>

                {/* ── Referral Code ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                >
                    <div className="border-b border-zinc-100 px-6 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                            Your Referral Code
                        </p>
                    </div>

                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-5 py-4">
                            <span className="font-mono text-lg font-bold tracking-wider text-zinc-900 sm:text-xl">
                                {referralCode}
                            </span>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCopy}
                                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                            >
                                {copied ? (
                                    <>
                                        <Check size={16} />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy size={16} />
                                        Copy
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="border-t border-zinc-100 px-6 py-5">
                        <Button
                            fullWidth
                            size="lg"
                            leftIcon={<Share2 size={18} />}
                            onClick={handleShare}
                            className="h-13 rounded-xl text-base shadow-lg shadow-zinc-900/20"
                        >
                            Share with Friends
                        </Button>
                    </div>
                </motion.div>

                {/* ── How It Works ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                >
                    <div className="border-b border-zinc-100 px-6 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                            How It Works
                        </p>
                    </div>

                    <div className="space-y-6 px-6 py-6">
                        <StepCard
                            number={1}
                            title="Share your referral code"
                            description="Send your unique referral link or code to your friends via WhatsApp, Instagram, or any platform."
                        />
                        <StepCard
                            number={2}
                            title="Friend signs up & orders"
                            description="They enter your code at checkout and get ₹100 OFF on their first order."
                        />
                        <StepCard
                            number={3}
                            title="You earn ₹100 credit"
                            description="Once their order is delivered, ₹100 store credit is added to your account."
                        />
                    </div>

                    <div className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Sparkles size={12} />
                            <span>No limit on referrals. Earn unlimited credit!</span>
                        </div>
                    </div>
                </motion.div>

                {/* ── Terms ───────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 text-center text-xs text-zinc-400"
                >
                    <p>
                        Terms apply. ₹100 OFF for first-time customers on minimum
                        order of ₹499. Store credit valid for 6 months.
                    </p>
                </motion.div>
            </div>
        </main>
    );
}

