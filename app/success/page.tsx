import Link from "next/link";
import { ArrowRight, CheckCircle2, Package } from "lucide-react";

export default function SuccessPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] flex items-center justify-center px-5 py-10">
            <div className="w-full max-w-md rounded-3xl bg-white border border-neutral-200 p-6 sm:p-10 shadow-sm">

                <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 animate-in zoom-in duration-500">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                </div>

                <h1 className="mt-6 text-center font-serif text-3xl sm:text-4xl font-bold">
                    Order Confirmed
                </h1>

                <p className="mt-3 text-center text-neutral-600">
                    Your payment has been received successfully.
                </p>

                <p className="text-center text-neutral-500 text-sm mt-1">
                    Thank you for shopping with THRIFTX.
                </p>

                <div className="my-8 border-t border-neutral-200" />

                <div className="space-y-4">

                    <div className="rounded-2xl bg-neutral-50 p-4">
                        <p className="text-xs uppercase tracking-widest text-neutral-500">
                            Order Status
                        </p>

                        <div className="mt-2 flex items-center gap-2 font-semibold">
                            <Package className="h-5 w-5" />
                            Confirmed
                        </div>
                    </div>

                    <div className="rounded-2xl bg-neutral-50 p-4">
                        <p className="text-xs uppercase tracking-widest text-neutral-500">
                            Estimated Delivery
                        </p>

                        <p className="mt-2 font-semibold">
                            3–5 Business Days
                        </p>
                    </div>

                </div>

                <div className="mt-8 space-y-3">

                    <Link
                        href="/orders"
                        className="flex h-12 items-center justify-center rounded-xl bg-black text-white font-medium transition active:scale-[0.98] hover:bg-neutral-800"
                    >
                        View Orders
                    </Link>

                    <Link
                        href="/shop"
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-300 font-medium transition active:scale-[0.98] hover:bg-neutral-100"
                    >
                        Continue Shopping
                        <ArrowRight className="h-5 w-5" />
                    </Link>

                </div>

            </div>
        </main>
    );
}