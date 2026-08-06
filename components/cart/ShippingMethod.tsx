'use client';

import {
    Clock3,
    MapPin,
    Truck,
    Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

export type ShippingMethodType =
    | 'standard'
    | 'express';

interface ShippingMethodProps {
    value: ShippingMethodType;
    onChange: (
        value: ShippingMethodType
    ) => void;
}

export default function ShippingMethod({
    value,
    onChange,
}: ShippingMethodProps) {
    const methods = [
        {
            id: 'standard' as const,
            title: 'Standard Delivery',
            subtitle: '3–5 Business Days',
            price: 'FREE',
            icon: Truck,
        },
        {
            id: 'express' as const,
            title: 'Express Delivery',
            subtitle: '1–2 Business Days',
            price: '₹99',
            icon: Zap,
        },
    ];

    return (
        <motion.section
            initial={{
                opacity: 0,
                y: 16,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.25,
            }}
            className="overflow-hidden rounded-[30px] border border-border bg-card shadow-card"
        >
            <div className="border-b border-border px-6 py-5">

                <div className="flex items-center gap-3">

                    <div className="rounded-2xl bg-muted p-3">
                        <Truck className="h-5 w-5" />
                    </div>

                    <div>

                        <h2 className="font-display text-heading-4 font-semibold text-foreground">
                            Delivery Method
                        </h2>

                        <p className="mt-1 text-body-sm text-muted-foreground">
                            Select your preferred shipping option.
                        </p>

                    </div>

                </div>

            </div>

            <div className="space-y-4 p-6">

                {methods.map((method) => {
                    const Icon = method.icon;

                    const selected =
                        value === method.id;

                    return (
                        <button
                            key={method.id}
                            type="button"
                            onClick={() =>
                                onChange(method.id)
                            }
                            className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${selected
                                ? 'border-foreground bg-foreground text-background'
                                : 'border-border hover:border-foreground'
                                }`}
                        >
                            <div className="flex items-start justify-between">

                                <div className="flex gap-4">

                                    <div
                                        className={`rounded-2xl p-3 ${selected
                                            ? 'bg-background text-foreground'
                                            : 'bg-muted'
                                            }`}
                                    >
                                        <Icon size={20} />
                                    </div>

                                    <div>

                                        <h3 className="font-semibold text-foreground">
                                            {method.title}
                                        </h3>

                                        <p
                                            className={`mt-1 text-body-sm ${selected
                                                ? 'text-background/70'
                                                : 'text-muted-foreground'
                                                }`}
                                        >
                                            {method.subtitle}
                                        </p>

                                    </div>

                                </div>

                                <span className="text-body-lg font-bold text-foreground">
                                    {method.price}
                                </span>

                            </div>
                        </button>
                    );
                })}

                <div className="rounded-2xl border border-warning-bg bg-warning-bg p-5">

                    <div className="flex items-start gap-3">

                        <Clock3
                            size={18}
                            className="mt-0.5 text-warning-foreground"
                        />

                        <div>

                            <p className="font-semibold text-warning-foreground">
                                Estimated Delivery
                            </p>

                            <p className="mt-1 text-body-sm leading-6 text-warning-foreground/80">
                                Delivery time depends on your city and courier availability.
                            </p>

                        </div>

                    </div>

                </div>

                <div className="rounded-2xl border border-border bg-muted p-5">

                    <div className="flex items-start gap-3">

                        <MapPin
                            size={18}
                            className="mt-0.5 text-muted-foreground"
                        />

                        <div>

                            <p className="font-semibold text-foreground">
                                Shipping Address
                            </p>

                            <p className="mt-1 text-body-sm leading-6 text-muted-foreground">
                                Your selected delivery address will be used for this order.
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        </motion.section>
    );
}