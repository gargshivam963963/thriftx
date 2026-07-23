'use client';

import {
    Lock,
    ShieldCheck,
    Sparkles,
    Truck,
} from 'lucide-react';

export default function TrustCard() {
    return (
        <div className="rounded-[32px] border border-neutral-200 bg-white p-8 shadow-sm">

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