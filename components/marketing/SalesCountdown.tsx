"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Flame } from "lucide-react";
import type { SaleEvent } from "@/lib/marketing/types";

interface Countdown {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function getTimeLeft(target: string): Countdown {
    const diff = Math.max(0, new Date(target).getTime() - Date.now());
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

export default function SalesCountdown() {
    const [sale, setSale] = useState<SaleEvent | null>(null);
    const [timeLeft, setTimeLeft] = useState<Countdown | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch("/api/marketing/sales/active");
                const data = await res.json();
                if (active && data.success && data.sale) {
                    setSale(data.sale);
                    setTimeLeft(getTimeLeft(data.sale.endsAt));
                }
            } catch (error) {
                console.error("Failed to load sale:", error);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!sale) return;
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft(sale.endsAt));
        }, 1000);
        return () => clearInterval(timer);
    }, [sale]);

    if (loading) return null;
    if (!sale || !timeLeft) return null;

    const expired = timeLeft.days <= 0 && timeLeft.hours <= 0 && timeLeft.minutes <= 0 && timeLeft.seconds <= 0;
    if (expired) return null;

    const segments = [
        { label: "Days", value: timeLeft.days },
        { label: "Hrs", value: timeLeft.hours },
        { label: "Min", value: timeLeft.minutes },
        { label: "Sec", value: timeLeft.seconds },
    ];

    return (
        <section className="relative isolate overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-12 dark:from-amber-600 dark:via-orange-700 dark:to-red-700">
            {/* Decorative */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
            </div>

            <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
                {/* Left: Message */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center lg:text-left"
                >
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                        <Flame size={12} />
                        Limited Time
                    </div>
                    <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        {sale.title}
                    </h2>
                    {sale.subtitle && (
                        <p className="mt-2 text-sm text-white/80 sm:text-base">{sale.subtitle}</p>
                    )}
                </motion.div>

                {/* Right: Countdown + CTA */}
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
                    <div className="flex items-center gap-3">
                        {segments.map((seg) => (
                            <div
                                key={seg.label}
                                className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm sm:h-20 sm:w-20"
                            >
                                <span className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
                                    {String(seg.value).padStart(2, "0")}
                                </span>
                                <span className="text-badge font-semibold uppercase tracking-wider text-white/70">
                                    {seg.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-2 sm:items-start">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                            <Clock size={11} />
                            Ends soon — don&apos;t miss out
                        </span>
                        <Link
                            href="/shop"
                            className="rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-orange-600 shadow-lg transition hover:scale-[1.03] hover:shadow-xl"
                        >
                            Shop the Sale
                        </Link>
                        {sale.couponCode && (
                            <span className="rounded-lg bg-black/20 px-2 py-1 font-mono text-[10px] font-bold tracking-widest text-white">
                                CODE: {sale.couponCode}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
