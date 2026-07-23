'use client';

import {
    ArrowRight,
    TicketPercent,
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface OrderSummaryProps {
    itemCount: number;
    subtotal: number;
    total: number;
    savings: number;

    paymentLoading: boolean;
    appliedCoupon: string;
    discount: number;

    onCheckout: () => Promise<void> | void;
    onApplyCoupon: (code: string) => void;
}

export default function OrderSummary({
    itemCount,
    subtotal,
    total,
    savings,

    paymentLoading,
    appliedCoupon,
    discount,

    onCheckout,
    onApplyCoupon,
}: OrderSummaryProps) {
    const [couponInput, setCouponInput] =
        useState(appliedCoupon);

    return (
        <motion.aside
            initial={{
                opacity: 0,
                y: 12,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.35,
            }}
            className="overflow-hidden rounded-[30px] border border-neutral-200 bg-white"
        >
            <div className="p-7">

                {/* -------------------------------- */}
                {/* Header                           */}
                {/* -------------------------------- */}

                <div className="flex items-start justify-between">

                    <div>

                        <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-neutral-400">
                            SUMMARY
                        </p>

                        <h2 className="mt-2 font-serif text-[30px] font-semibold leading-none">
                            Order
                        </h2>

                    </div>

                    <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500">
                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                    </span>

                </div>

                {/* -------------------------------- */}
                {/* Pricing                          */}
                {/* -------------------------------- */}

                <div className="mt-8 space-y-5">

                    <div className="flex items-center justify-between">

                        <span className="text-[15px] text-neutral-500">
                            Subtotal
                        </span>

                        <span className="text-[15px] font-medium">
                            ₹{subtotal.toLocaleString('en-IN')}
                        </span>

                    </div>

                    {savings > 0 && (

                        <div className="flex items-center justify-between">

                            <span className="text-[15px] text-neutral-500">
                                Savings
                            </span>

                            <span className="text-[15px] font-semibold text-emerald-600">
                                −₹{savings.toLocaleString('en-IN')}
                            </span>

                        </div>

                    )}

                    <div className="flex items-center justify-between">
                        <span className="text-[15px] text-neutral-500">
                            Shipping
                        </span>

                        <span className="text-[14px] font-medium text-neutral-700">
                            Calculated at checkout
                        </span>

                    </div>

                </div>

                <div className="my-7 h-px bg-neutral-200" />

                {/* -------------------------------- */}
                {/* Coupon                           */}
                {/* -------------------------------- */}

                <div>

                    <div className="flex items-center gap-2">

                        <TicketPercent
                            size={18}
                            className="text-neutral-500"
                        />

                        <h3 className="text-sm font-semibold">
                            Discount Code
                        </h3>

                    </div>

                    <div
                        className="
        mt-4
        rounded-2xl
        border
        border-neutral-200
        p-1
        transition-all
        duration-300
        focus-within:border-black
        focus-within:shadow-sm
    "
                    >
                        <div className="flex items-center">
                            <input
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onApplyCoupon(couponInput.trim());
                                    }
                                }}
                                placeholder="Enter discount code"
                                className="
h-11
flex-1
border-0
bg-transparent
px-4
text-sm
outline-none
placeholder:text-neutral-400
"
                            />

                            <button
                                type="button"
                                onClick={() => {
                                    console.log('Calling onApplyCoupon...');
                                    onApplyCoupon(couponInput.trim());
                                }}
                                className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                            >
                                Apply
                            </button>
                        </div>

                    </div>

                    {discount > 0 && (

                        <p className="mt-3 text-xs font-medium text-emerald-600">
                            ✓ WELCOME10 applied
                        </p>
                    )}

                </div>

                <div className="my-7 h-px bg-neutral-200" />

                {/* -------------------------------- */}
                {/* Total                            */}
                {/* -------------------------------- */}

                <div className="flex items-end justify-between">

                    <div>

                        <p className="text-sm text-neutral-500">
                            You Pay
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                            Taxes included
                        </p>

                    </div>

                    <h3 className="font-serif text-[42px] font-semibold leading-none tracking-tight">
                        ₹{total.toLocaleString('en-IN')}
                    </h3>

                </div>

                <Button
                    type="button"
                    onClick={onCheckout}
                    loading={paymentLoading}
                    fullWidth
                    size="lg"
                    rightIcon={<ArrowRight size={18} />}
                    className="mt-8 h-14 text-base"
                >
                    Proceed to Checkout
                </Button>

                <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4">
                    <p className="text-center text-xs font-medium text-neutral-700">
                        Secure payment powered by Razorpay
                    </p>

                    <p className="mt-2 text-center text-[11px] leading-5 text-neutral-500">
                        ✓ Every piece is authenticated, quality checked and packed with care.
                    </p>

                </div>
            </div>

        </motion.aside>
    );
}