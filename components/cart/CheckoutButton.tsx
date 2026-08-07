'use client';

import { CreditCard, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div className="rounded-[32px] border border-border bg-card p-8 shadow-card">

            <div className="rounded-2xl bg-muted p-5">

                <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-foreground p-3 text-background">
                        <CreditCard className="h-5 w-5" />
                    </div>

                    <div>

                        <p className="font-semibold text-foreground">
                            Ready to Checkout
                        </p>

                        <p className="text-body-sm text-muted-foreground">
                            Secure payment powered by Razorpay.
                        </p>

                    </div>

                </div>

            </div>

            <Button
                type="button"
                onClick={onCheckout}
                disabled={loading || disabled}
                fullWidth
                variant="primary"
                size="lg"
                className="mt-6"
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
            </Button>

            <div className="mt-6 space-y-3 text-body-sm text-muted-foreground">

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