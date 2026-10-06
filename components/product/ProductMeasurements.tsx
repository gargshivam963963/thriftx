"use client";

import {
    Ruler,
    MoveHorizontal,
    MoveVertical,
    Gauge,
    Scissors,
} from "lucide-react";
import type { Product } from "@/lib/services/products";
import { cn } from "@/lib/utils";

interface MeasurementDef {
    key: "chest" | "waist" | "length" | "inseam";
    label: string;
    icon: typeof Ruler;
}

const MEASUREMENTS: MeasurementDef[] = [
    { key: "chest", label: "Chest", icon: MoveHorizontal },
    { key: "waist", label: "Waist", icon: Gauge },
    { key: "length", label: "Length", icon: MoveVertical },
    { key: "inseam", label: "Inseam", icon: Scissors },
];

/**
 * ProductMeasurements — clean measurement cards with icons.
 * Empty fields are hidden automatically.
 */
export default function ProductMeasurements({
    product,
}: {
    product: Product;
}) {
    const available = MEASUREMENTS.filter(
        (m) => Boolean(product[m.key]),
    );

    if (!available.length) return null;

    return (
        <div>
            <h3 className="mb-4 flex items-center gap-2 text-caption font-semibold uppercase tracking-caps text-muted-foreground">
                <Ruler className="h-4 w-4" />
                Measurements
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {available.map((m) => {
                    const Icon = m.icon;
                    return (
                        <div
                            key={m.key}
                            className={cn(
                                "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3",
                            )}
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-caption text-muted-foreground">
                                    {m.label}
                                </p>
                                <p className="text-body font-semibold text-foreground">
                                    {product[m.key]}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
