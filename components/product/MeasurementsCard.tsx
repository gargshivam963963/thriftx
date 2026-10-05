
"use client";

import {
    Ruler,
    Shirt,
    CircleSlash,
    MoveVertical,
    Footprints,
} from "lucide-react";
import type { ElementType } from "react";
import type { Product } from "@/lib/services/products";

interface Measurement {
    label: string;
    value: string;
    icon: ElementType;
}

const ICONS = {
    chest: Shirt,
    waist: CircleSlash,
    length: MoveVertical,
    inseam: Footprints,
};

export default function MeasurementsCard({
    product,
}: {
    product: Product;
}) {
    const measurements: Measurement[] = [];

    if (product.chest) {
        measurements.push({
            label: "Chest",
            value: product.chest,
            icon: ICONS.chest,
        });
    }

    if (product.waist) {
        measurements.push({
            label: "Waist",
            value: product.waist,
            icon: ICONS.waist,
        });
    }

    if (product.length) {
        measurements.push({
            label: "Length",
            value: product.length,
            icon: ICONS.length,
        });
    }

    if (product.inseam) {
        measurements.push({
            label: "Inseam",
            value: `${product.inseam}"`,
            icon: ICONS.inseam,
        });
    }

    if (measurements.length === 0) return null;

    return (
        <section aria-labelledby="product-measurements-title">
            <div className="mb-4 flex items-center gap-2.5">
                <Ruler
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                />

                <h3
                    id="product-measurements-title"
                    className="text-sm font-semibold tracking-tight text-foreground"
                >
                    Measurements
                </h3>

                <span className="text-xs text-muted-foreground">
                    Actual garment measurements
                </span>
            </div>

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                {measurements.map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="
              flex min-w-0 items-center gap-3
              rounded-xl
              border border-border/60
              bg-muted/30
              px-3.5 py-3
              transition-colors
              hover:bg-muted/50
            "
                    >
                        <span
                            className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-lg
                bg-background
                text-muted-foreground
              "
                        >
                            <Icon
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </span>

                        <div className="min-w-0">
                            <dt className="text-xs text-muted-foreground">
                                {label}
                            </dt>

                            <dd className="mt-0.5 break-words text-lg font-semibold leading-tight text-foreground">
                                {value}
                            </dd>
                        </div>
                    </div>
                ))}
            </dl>

            <p className="mt-3 rounded-xl bg-muted/30 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                For the best fit, compare these measurements with a
                similar garment you already own. Measurements are of
                the garment, not body measurements.
            </p>
        </section>
    );
}
