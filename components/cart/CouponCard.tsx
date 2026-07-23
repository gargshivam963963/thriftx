'use client';

import { useState } from 'react';
import { CheckCircle2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface CouponCardProps {
    appliedCoupon?: string;
    discount?: number;
    onApplyCoupon: (code: string) => void;
}

export default function CouponCard({
    appliedCoupon,
    discount = 0,
    onApplyCoupon,
}: CouponCardProps) {
    const [coupon, setCoupon] = useState('');

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-sm"
        >
            <div className="border-b border-neutral-200 px-6 py-5">

                <div className="flex items-center gap-3">

                    <div className="rounded-2xl bg-neutral-100 p-3">
                        <Tag className="h-5 w-5" />
                    </div>

                    <div>

                        <h2 className="font-serif text-xl font-semibold">
                            Coupon
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                            Apply a discount code if you have one.
                        </p>

                    </div>

                </div>

            </div>

            <div className="space-y-5 p-6">

                <div className="flex gap-3">

                    <input
                        type="text"
                        value={coupon}
                        placeholder="Coupon Code"
                        onChange={(e) =>
                            setCoupon(
                                e.target.value.toUpperCase()
                            )
                        }
                        className="flex-1 rounded-2xl border border-neutral-300 px-5 py-4 outline-none transition focus:border-black"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            onApplyCoupon(coupon)
                        }
                        className="rounded-2xl bg-black px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        Apply
                    </button>

                </div>

                {appliedCoupon && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                        <div className="flex items-start gap-3">

                            <CheckCircle2
                                className="mt-0.5 text-emerald-600"
                                size={20}
                            />

                            <div>

                                <p className="font-semibold text-emerald-700">
                                    {appliedCoupon} Applied
                                </p>

                                <p className="mt-1 text-sm text-emerald-700/80">
                                    You saved ₹
                                    {discount.toLocaleString(
                                        'en-IN'
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>
                )}

            </div>

        </motion.section>
    );
}