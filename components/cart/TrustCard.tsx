'use client';

import {
    Lock,
    ShieldCheck,
    Sparkles,
    Truck,
    Zap,
} from 'lucide-react';

export default function TrustCard() {
    return (
        <div className="rounded-[32px] border border-neutral-200 bg-white p-8 shadow-sm">

            {/* ⚡ Panipat Local Delivery Banner */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-emerald-900">
                            🎉 Free Same-Day Delivery in Panipat!
                        </h3>
                        <p className="mt-0.5 text-xs leading-5 text-emerald-700">
                            Order before 2 PM and get it delivered today — absolutely FREE. 🚀
                        </p>
                    </div>
                </div>
            </div>

            <h2 className="font-serif text-2xl font-semibold">
                Why Shop With THRIFTX
            </h2>

            <div className="mt-8 space-y-6">

                <div className="flex gap-4">

                    <div className="rounded-2xl bg-black p-3 text-white">
                        <Truck className="h-5 w-5" />
                    </div>

                    <div>

                        <h3 className="font-semibold">
                            Fast Dispatch
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            Orders are packed within 24 hours.
                        </p>

                    </div>

                </div>

                <div className="flex gap-4">

                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                        <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>

                        <h3 className="font-semibold">
                            Quality Checked
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            Every item is individually inspected.
                        </p>

                    </div>

                </div>

                <div className="flex gap-4">

                    <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                        <Sparkles className="h-5 w-5" />
                    </div>

                    <div>

                        <h3 className="font-semibold">
                            Premium Packaging
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            Clean, protected and ready to wear.
                        </p>

                    </div>

                </div>

                <div className="flex gap-4">

                    <div className="rounded-2xl bg-neutral-900 p-3 text-white">
                        <Lock className="h-5 w-5" />
                    </div>

                    <div>

                        <h3 className="font-semibold">
                            Secure Payment
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            Razorpay encrypted checkout.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}
