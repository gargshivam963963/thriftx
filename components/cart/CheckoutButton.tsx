'use client';

import { CreditCard, Loader2, Lock } from 'lucide-react';

interface CheckoutButtonProps {
    loading: boolean;
    disabled?: boolean;
    total: number;
    onCheckout: () => Promise<void> | void;
}

export default function CheckoutButton({
    loading,
    disabled = false,
    total,
    onCheckout,
}: CheckoutButtonProps) {
    return (
        <div className="rounded-[32px] border border-neutral-200 bg-white p-8 shadow-sm">

            <div className="rounded-2xl bg-neutral-50 p-5">

                <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-black p-3 text-white">
                        <CreditCard className="h-5 w-5" />
                    </div>

                    <div>

                        <p className="font-semibold">
                            Ready to Checkout
                        </p>

                        <p className="text-sm text-neutral-500">
                            Secure payment powered by Razorpay.
                        </p>

                    </div>

                </div>

            </div>

            <button
                type="button"
                disabled={loading || disabled}
                onClick={onCheckout}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 py-5 text-lg font-semibold text-white transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Pay ₹{total.toLocaleString('en-IN')}
                        <Lock className="h-5 w-5" />
                    </>
                )}
            </button>

            <div className="mt-6 space-y-3 text-sm text-neutral-500">

                <div className="flex items-center justify-between">
                    <span>SSL Encrypted Checkout</span>
                    <Lock className="h-4 w-4" />
                </div>

                <div className="flex items-center justify-between">
                    <span>100% Secure Payments</span>
                    <CreditCard className="h-4 w-4" />
                </div>

            </div>

        </div>
    );
}