"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Gift,
    Share2,
    Copy,
    ArrowLeft,
    Users,
    IndianRupee,
    Sparkles,
    Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import type { Referral } from "@/lib/marketing/types";
import { cn } from "@/lib/utils";

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
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-caption font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {label}
                </p>
                <p className="font-display text-heading-4 font-bold text-foreground">
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-body-sm font-bold text-background">
                {number}
            </div>
            <div>
                <h3 className="text-body-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
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
    const [referralCode, setReferralCode] = useState("THRIFTX-GUEST");
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        let active = true;
        (async () => {
            try {
                const res = await fetch("/api/marketing/referrals");
                const data = await res.json();
                if (active && data.success) {
                    setReferralCode(data.code || `THRIFTX-${user.$id.slice(0, 6).toUpperCase()}`);
                    setReferrals(data.referrals || []);
                }
            } catch (error) {
                console.error("Failed to load referral data:", error);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [user]);

    const referralLink = `https://thriftx.in/refer?code=${referralCode}`;
    const referralCount = referrals.length;
    const creditEarned = referrals
        .filter((r) => r.status === "completed")
        .reduce((sum, r) => sum + r.rewardAmount, 0);

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
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
                {/* Back */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href={user ? "/profile" : "/"}
                        className="group mb-6 inline-flex items-center gap-2 text-body-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        <div className="rounded-full border border-border bg-card p-1.5 transition group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                            <ArrowLeft size={14} />
                        </div>
                        {user ? "Profile" : "Home"}
                    </Link>
                </motion.div>

                {/* ── Hero ─────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-3xl bg-gradient-to-br from-foreground via-muted-foreground to-foreground p-8 text-center text-background shadow-float sm:p-12"
                >
                    {/* Decorative */}
                    <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-warning/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-success/10 blur-3xl" />

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 15,
                            }}
                            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning text-warning-foreground shadow-lg"
                        >
                            <Gift size={28} />
                        </motion.div>

                        <h1 className="mt-5 font-display text-heading-2 font-bold tracking-tight">
                            Refer & Earn ₹100
                        </h1>
                        <p className="mx-auto mt-3 max-w-md text-body-sm leading-7 text-background/60">
                            Invite your friends to THRIFTX. They get{" "}
                            <strong className="text-background">₹100 OFF</strong> on
                            their first order, and you get{" "}
                            <strong className="text-background">₹100 store credit</strong>.
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
                        icon={<Users size={18} className="text-background" />}
                        label="Friends Referred"
                        value={loading ? "..." : String(referralCount)}
                        color="bg-foreground text-background"
                    />
                    <ReferralStat
                        icon={<IndianRupee size={18} className="text-background" />}
                        label="Credit Earned"
                        value={loading ? "..." : `₹${creditEarned.toLocaleString("en-IN")}`}
                        color="bg-success text-background"
                    />
                </motion.div>

                {/* ── Referral Code ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card"
                >
                    <div className="border-b border-border px-6 py-4">
                        <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Your Referral Code
                        </p>
                    </div>

                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between rounded-2xl border-2 border-dashed border-border bg-muted px-5 py-4">
                            <span className="font-mono text-heading-4 font-bold tracking-wider text-foreground">
                                {referralCode}
                            </span>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCopy}
                                className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-body-sm font-medium text-background transition hover:opacity-90"
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
                    <div className="border-t border-border px-6 py-5">
                        <Button
                            fullWidth
                            size="lg"
                            leftIcon={<Share2 size={18} />}
                            onClick={handleShare}
                            className="h-13 rounded-xl text-body shadow-lg shadow-foreground/20"
                        >
                            Share with Friends
                        </Button>
                    </div>
                </motion.div>

                {/* ── Referral History ────────────────────────────────────────── */}
                {!loading && referrals.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.17 }}
                        className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card"
                    >
                        <div className="border-b border-border px-6 py-4">
                            <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Referral History
                            </p>
                        </div>
                        <div className="divide-y divide-border">
                            {referrals.map((ref, idx) => (
                                <div
                                    key={ref.id || idx}
                                    className="flex items-center justify-between gap-3 px-6 py-4"
                                >
                                    <div className="min-w-0">
                                        <p className="text-body-sm font-semibold text-foreground">
                                            {ref.referredEmail || "Friend"}
                                        </p>
                                        <p className="text-small text-muted-foreground">
                                            {ref.$createdAt
                                                ? new Intl.DateTimeFormat("en-IN", {
                                                    dateStyle: "medium",
                                                }).format(new Date(ref.$createdAt))
                                                : "Invited"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "rounded-full px-2.5 py-1 text-badge font-bold uppercase tracking-wider",
                                                ref.status === "completed"
                                                    ? "bg-success-bg text-success-foreground"
                                                    : ref.status === "pending"
                                                        ? "bg-warning-bg text-warning-foreground"
                                                        : "bg-muted text-muted-foreground",
                                            )}
                                        >
                                            {ref.status}
                                        </span>
                                        <span className="text-body-sm font-bold text-foreground">
                                            ₹{ref.rewardAmount || 0}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── How It Works ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card"
                >
                    <div className="border-b border-border px-6 py-4">
                        <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
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

                    <div className="border-t border-border bg-muted px-6 py-4">
                        <div className="flex items-center gap-2 text-small text-muted-foreground">
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
                    className="mt-6 text-center text-small text-muted-foreground"
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

