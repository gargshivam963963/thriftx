// components/checkout/CheckoutHeader.tsx

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ShieldCheck,
    Truck,
    Sparkles,
} from "lucide-react";

export default function CheckoutHeader() {
    return (
        <motion.header
            initial={{
                opacity: 0,
                y: -15,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.35,
            }}
            className="mb-8"
        >
            <Link
                href="/cart"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-black"
            >
                <ArrowLeft size={16} />
                Back to Cart
            </Link>

            <div className="mt-6 rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                                Checkout
                            </span>

                            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-700">
                                <Sparkles size={14} />
                                Premium Thrift
                            </span>

                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700">
                                <ShieldCheck size={14} />
                                Secure Checkout
                            </span>
                        </div>

                        <h1 className="mt-6 text-4xl font-bold tracking-tight text-black md:text-5xl">
                            Complete your order
                        </h1>

                        <p className="mt-4 max-w-xl text-[15px] leading-7 text-zinc-500">
                            Every THRIFTX item is individually inspected,
                            professionally packed and securely delivered to
                            your doorstep.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-5 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 lg:min-w-[420px]">
                        <Stat
                            title="Dispatch"
                            value="24 Hours"
                        />

                        <Stat
                            title="Delivery"
                            value="2–5 Days"
                        />

                        <Stat
                            title="Payment"
                            value="Razorpay"
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4 rounded-2xl bg-zinc-100 p-5">
                    <Info
                        title="Verified Products"
                        subtitle="Every item is quality checked."
                    />

                    <Info
                        title="Fast Shipping"
                        subtitle="Live order tracking included."
                    />

                    <Info
                        title="Secure Payment"
                        subtitle="UPI • Cards • Wallet • Net Banking"
                    />
                </div>
            </div>
        </motion.header>
    );
}

interface StatProps {
    title: string;
    value: string;
}

function Stat({
    title,
    value,
}: StatProps) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {title}
            </p>

            <p className="mt-2 text-lg font-semibold text-black">
                {value}
            </p>
        </div>
    );
}

interface InfoProps {
    title: string;
    subtitle: string;
}

function Info({
    title,
    subtitle,
}: InfoProps) {
    return (
        <div className="flex flex-1 items-start gap-3 rounded-2xl bg-white p-4">
            <div className="rounded-xl bg-black p-2 text-white">
                <Truck size={16} />
            </div>

            <div>
                <h4 className="text-sm font-semibold text-black">
                    {title}
                </h4>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}