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
        <div className="rounded-[32px] border border-border bg-card p-8 shadow-card">

            {/* ⚡ Panipat Local Delivery Banner */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-success-bg bg-gradient-to-br from-success-bg to-success-bg/60 p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success text-white shadow-lg">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-body-sm font-bold text-success-foreground">
                            🎉 Free Same-Day Delivery in Panipat!
                        </h3>
                        <p className="mt-0.5 text-small leading-5 text-success-foreground">
                            Order before 2 PM and get it delivered today — absolutely FREE. 🚀
                        </p>
                    </div>
                </div>
            </div>

            <h2 className="font-display text-heading-4 font-semibold text-foreground">
                Why Shop With THRIFTX
            </h2>

            <div className="mt-8 space-y-6">

                <div className="flex gap-4">

                    <div className="rounded-2xl bg-foreground p-3 text-background">
                        <Truck className="h-5 w-5" />
                    </div>

                    <div>

                        <h3 className="font-semibold text-foreground">
                            Fast Dispatch
                        </h3>

                        <p className="mt-1 text-body-sm text-muted-foreground">
                            Orders are packed within 24 hours.
                        </p>

                    </div>

                </div>

                <div className="flex gap-4">

                    <div className="rounded-2xl bg-success-bg p-3 text-success-foreground">
                        <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>

                        <h3 className="font-semibold text-foreground">
                            Quality Checked
                        </h3>

                        <p className="mt-1 text-body-sm text-muted-foreground">
                            Every item is individually inspected.
                        </p>

                    </div>

                </div>

                <div className="flex gap-4">

                    <div className="rounded-2xl bg-info-bg p-3 text-info-foreground">
                        <Sparkles className="h-5 w-5" />
                    </div>

                    <div>

                        <h3 className="font-semibold text-foreground">
                            Premium Packaging
                        </h3>

                        <p className="mt-1 text-body-sm text-muted-foreground">
                            Clean, protected and ready to wear.
                        </p>

                    </div>

                </div>

                <div className="flex gap-4">

                    <div className="rounded-2xl bg-muted p-3 text-foreground">
                        <Lock className="h-5 w-5" />
                    </div>

                    <div>

                        <h3 className="font-semibold text-foreground">
                            Secure Payment
                        </h3>

                        <p className="mt-1 text-body-sm text-muted-foreground">
                            Razorpay encrypted checkout.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}
