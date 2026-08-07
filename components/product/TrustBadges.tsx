"use client";

import {
    BadgeCheck,
    ShieldCheck,
    Truck,
    Lock,
} from "lucide-react";

const BADGES = [
    {
        icon: BadgeCheck,
        title: "Authentic Product",
        desc: "100% genuine",
    },
    {
        icon: ShieldCheck,
        title: "Quality Checked",
        desc: "Individually inspected",
    },
    {
        icon: Truck,
        title: "Fast Shipping",
        desc: "Pan India delivery",
    },
    {
        icon: Lock,
        title: "Secure Checkout",
        desc: "Encrypted payments",
    },
];

/**
 * TrustBadges — premium trust indicators shown under the gallery.
 */
export default function TrustBadges() {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {BADGES.map(({ icon: Icon, title, desc }) => (
                <div
                    key={title}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-bg text-success">
                        <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-body-sm font-semibold text-foreground">
                            {title}
                        </p>
                        <p className="text-small text-muted-foreground">
                            {desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
