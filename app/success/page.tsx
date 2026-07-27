"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowRight,
    CheckCircle2,
    Package,
    Sparkles,
    ShoppingBag,
    Heart,
    Share2,
    Clock,
    MapPin,
    Truck,
    Gem,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { getDeliveryInfo } from "@/lib/delivery";

// ─── Animated Checkmark ──────────────────────────────────────────────────────

function AnimatedCheckmark() {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative mx-auto flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28"
        >
            {/* Outer ring */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="absolute inset-0 rounded-full border-2 border-emerald-200"
            />
            {/* Inner glow */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="absolute inset-4 rounded-full bg-emerald-100"
            />
            {/* Check */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"
            >
                <CheckCircle2 size={36} className="text-white" />
            </motion.div>
            {/* Sparkle */}
            <motion.div
                initial={{ opacity: 0, rotate: -45, scale: 0 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="absolute -right-2 -top-2"
            >
                <Sparkles size={20} className="text-amber-400" />
            </motion.div>
        </motion.div>
    );
}

// ─── Delivery Timeline ───────────────────────────────────────────────────────

function DeliveryTimeline({
    steps,
}: {
    steps: { title: string; subtitle: string; completed?: boolean }[];
}) {
    return (
        <div className="space-y-4">
            {steps.map((step, i) => (
                <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.25 }}
                    className="flex items-start gap-3"
                >
                    <div className="flex flex-col items-center">
                        <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step.completed
                                ? "bg-emerald-500 text-white"
                                : "bg-neutral-100 text-neutral-400"
                                }`}
                        >
                            {step.completed ? (
                                <CheckCircle2 size={14} />
                            ) : (
                                i + 1
                            )}
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                className={`mt-1 h-8 w-px ${step.completed
                                    ? "bg-emerald-200"
                                    : "bg-neutral-200"
                                    }`}
                            />
                        )}
                    </div>
                    <div className="pb-4">
                        <h4
                            className={`text-sm font-semibold ${step.completed
                                ? "text-emerald-700"
                                : "text-neutral-900"
                                }`}
                        >
                            {step.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-neutral-500">
                            {step.subtitle}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// ─── Main Success Page ───────────────────────────────────────────────────────

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-pulse text-center">
                    <div className="h-8 w-48 rounded bg-neutral-200 mx-auto mb-4" />
                    <div className="h-4 w-64 rounded bg-neutral-200 mx-auto" />
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const [deliveryInfo, setDeliveryInfo] = useState(() =>
        getDeliveryInfo("", ""),
    );
    const [timeline, setTimeline] = useState<
        { title: string; subtitle: string; completed?: boolean }[]
    >([]);

    const [orderId, setOrderId] = useState("");
    const city = searchParams.get("city") || "";
    const pincode = searchParams.get("pincode") || "";
    const items = searchParams.get("items") || "1";

    useEffect(() => {
        // Generate order ID only on client to prevent hydration mismatch
        setOrderId(searchParams.get("orderId") || "THRIFTX" + Date.now().toString(36).toUpperCase());
    }, [searchParams]);

    useEffect(() => {
        const info = getDeliveryInfo(city || "Panipat", pincode);
        setDeliveryInfo(info);

        // Build timeline
        const zoneSteps =
            info.zone === "local"
                ? [
                    {
                        title: "Order Confirmed",
                        subtitle: "Your order is placed",
                        completed: true,
                    },
                    {
                        title: "Item Packed",
                        subtitle: "Being prepared for delivery",
                    },
                    {
                        title: "Out for Delivery",
                        subtitle: "On its way to you",
                    },
                    {
                        title: "Delivered",
                        subtitle: "Enjoy your thrift piece!",
                    },
                ]
                : [
                    {
                        title: "Order Confirmed",
                        subtitle: "Your order is placed",
                        completed: true,
                    },
                    {
                        title: "Item Packed",
                        subtitle: "Quality checked & packed",
                    },
                    {
                        title: "Shipped",
                        subtitle: "Dispatched via courier",
                    },
                    {
                        title: "Out for Delivery",
                        subtitle: "Reaching your city",
                    },
                    {
                        title: "Delivered",
                        subtitle: "Enjoy your thrift piece!",
                    },
                ];
        setTimeline(zoneSteps);
    }, [city, pincode]);

    const handleShare = async () => {
        const text = `🎉 Just scored amazing thrift fashion from THRIFTX! 🔥\n\nPremium thrift, quality checked, delivered to my doorstep.\n\nShop now → thriftx.in`;
        if (navigator.share) {
            await navigator.share({ title: "THRIFTX", text });
        } else {
            await navigator.clipboard.writeText(text);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50">
            <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
                >
                    {/* ─── Hero Section ──────────────────────────────── */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400 px-6 pb-8 pt-10 text-center sm:px-8 sm:pt-14">
                        {/* Decorative */}
                        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-300/20 blur-3xl" />

                        <div className="relative z-10">
                            <AnimatedCheckmark />

                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.35 }}
                                className="mt-6 font-serif text-3xl font-bold tracking-tight text-white sm:mt-8 sm:text-4xl"
                            >
                                Order Confirmed! 🎉
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.35 }}
                                className="mt-3 text-sm leading-6 text-white/80 sm:text-base"
                            >
                                Thank you for shopping with THRIFTX. Your order is being
                                processed with care.
                            </motion.p>
                        </div>
                    </div>

                    {/* ─── Order ID ───────────────────────────────────── */}
                    <div className="border-b border-neutral-100 px-6 py-5 sm:px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                                    Order ID
                                </p>
                                <p className="mt-1 font-mono text-sm font-semibold text-neutral-900">
                                    #{orderId}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2">
                                <Package size={14} className="text-neutral-500" />
                                <span className="text-xs font-semibold text-neutral-600">
                                    {items} {Number(items) === 1 ? "Item" : "Items"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ─── Delivery Info ──────────────────────────────── */}
                    <div className="px-6 py-5 sm:px-8">
                        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-50/60 p-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-xl">
                                    {deliveryInfo.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600">
                                        Estimated Delivery
                                    </p>
                                    <h3 className="mt-1 font-serif text-xl font-bold text-amber-900">
                                        {deliveryInfo.label}
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-amber-700/80">
                                        {deliveryInfo.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Delivery Timeline ──────────────────────────── */}
                    {timeline.length > 0 && (
                        <div className="border-t border-neutral-100 px-6 py-5 sm:px-8">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                Order Progress
                            </p>
                            <div className="mt-4">
                                <DeliveryTimeline steps={timeline} />
                            </div>
                        </div>
                    )}

                    {/* ─── Actions ────────────────────────────────────── */}
                    <div className="border-t border-neutral-100 px-6 py-6 sm:px-8">
                        <div className="space-y-3">
                            <Link href="/orders">
                                <Button
                                    fullWidth
                                    size="lg"
                                    variant="primary"
                                    leftIcon={<Package size={18} />}
                                    rightIcon={<ArrowRight size={18} />}
                                    className="h-13 rounded-xl text-base shadow-lg shadow-neutral-900/20"
                                >
                                    View My Orders
                                </Button>
                            </Link>

                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/shop">
                                    <Button
                                        fullWidth
                                        size="md"
                                        variant="outline"
                                        leftIcon={<ShoppingBag size={16} />}
                                        className="rounded-xl"
                                    >
                                        Shop More
                                    </Button>
                                </Link>

                                <Button
                                    fullWidth
                                    size="md"
                                    variant="outline"
                                    leftIcon={<Share2 size={16} />}
                                    onClick={handleShare}
                                    className="rounded-xl"
                                >
                                    Share
                                </Button>
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-neutral-400">
                                <Gem size={12} />
                                <span>
                                    Premium Thrift Fashion &mdash; THRIFTX
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ─── Referral CTA ────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.35 }}
                    className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 text-center shadow-sm"
                >
                    <div className="flex items-center justify-center gap-2">
                        <Heart size={16} className="text-red-400" />
                        <p className="text-sm text-neutral-600">
                            Love THRIFTX?{" "}
                            <Link
                                href="/refer"
                                className="font-semibold text-neutral-900 underline underline-offset-2 transition hover:text-neutral-700"
                            >
                                Refer a friend & get ₹100 off
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

