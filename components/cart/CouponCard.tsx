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
            className="overflow-hidden rounded-[30px] border border-border bg-card shadow-card"
        >
            <div className="border-b border-border px-6 py-5">

                <div className="flex items-center gap-3">

                    <div className="rounded-2xl bg-muted p-3">
                        <Tag className="h-5 w-5" />
                    </div>

                    <div>

                        <h2 className="font-display text-heading-4 font-semibold text-foreground">
                            Coupon
                        </h2>

                        <p className="mt-1 text-body-sm text-muted-foreground">
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
                        className="flex-1 rounded-2xl border border-border bg-card px-5 py-4 text-body-sm outline-none transition focus:border-foreground placeholder:text-muted"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            onApplyCoupon(coupon)
                        }
                        className="rounded-2xl bg-foreground px-6 py-4 text-body-sm font-semibold text-background transition hover:bg-muted-foreground"
                    >
                        Apply
                    </button>

                </div>

                {appliedCoupon && (
                    <div className="rounded-2xl border border-success-bg bg-success-bg p-5">

                        <div className="flex items-start gap-3">

                            <CheckCircle2
                                className="mt-0.5 text-success-foreground"
                                size={20}
                            />

                            <div>

                                <p className="font-semibold text-success-foreground">
                                    {appliedCoupon} Applied
                                </p>

                                <p className="mt-1 text-body-sm text-success-foreground/80">
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