"use client";

import { Truck, RotateCcw, PackageCheck } from "lucide-react";
import { getDeliveryInfo } from "@/lib/delivery";

/**
 * DeliveryEstimate — dynamic delivery estimate + return policy info.
 * Uses the shared delivery strategy (Panipat same-day vs. courier).
 */
export default function DeliveryEstimate() {
    const delivery = getDeliveryInfo("Panipat");

    return (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-bg text-info">
                    <Truck className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-body-sm font-semibold text-foreground">
                        {delivery.label}
                    </p>
                    <p className="text-small text-muted-foreground">
                        {delivery.eta} • {delivery.free ? "FREE" : "Charged"} delivery
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning-bg text-warning">
                    <RotateCcw className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-body-sm font-semibold text-foreground">
                        7-Day Returns
                    </p>
                    <p className="text-small text-muted-foreground">
                        Easy return within 7 days
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-bg text-success">
                    <PackageCheck className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-body-sm font-semibold text-foreground">
                        Secure Packaging
                    </p>
                    <p className="text-small text-muted-foreground">
                        Steamed, folded &amp; packed with care
                    </p>
                </div>
            </div>
        </div>
    );
}
