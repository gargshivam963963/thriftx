"use client";

import { Ruler, Shirt, CircleSlash, MoveVertical, Footprints } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/services/products";
import { cn } from "@/lib/utils";

interface Measurement {
    label: string;
    value: string;
    icon: React.ElementType;
    hint?: string;
}

const ICONS = {
    chest: Shirt,
    waist: CircleSlash,
    length: MoveVertical,
    inseam: Footprints,
    shoulder: MoveVertical,
    sleeve: MoveVertical,
};

/**
 * MeasurementsCard — clean, icon-led measurement cards.
 * Only renders measurements that exist (dynamic, hides empty fields).
 */
export default function MeasurementsCard({ product }: { product: Product }) {
    const measurements: Measurement[] = [];

    if (product.chest) {
        measurements.push({ label: "Chest", value: product.chest, icon: ICONS.chest });
    }
    if (product.waist) {
        measurements.push({ label: "Waist", value: product.waist, icon: ICONS.waist });
    }
    if (product.length) {
        measurements.push({ label: "Length", value: product.length, icon: ICONS.length });
    }
    if (product.inseam) {
        measurements.push({ label: "Inseam", value: `${product.inseam}"`, icon: ICONS.inseam });
    }

    if (measurements.length === 0) return null;

    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Measurements
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {measurements.map((m, i) => {
                    const Icon = m.icon;
                    return (
                        <motion.div
                            key={m.label}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className={cn(
                                "flex flex-col items-start gap-2 rounded-xl border border-border bg-background p-4",
                                "transition-all duration-200 hover:border-foreground/40 hover:shadow-sm",
                            )}
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                <Icon className="h-4 w-4 text-foreground" />
                            </span>
                            <div>
                                <p className="text-small text-muted-foreground">{m.label}</p>
                                <p className="text-body font-semibold text-foreground">{m.value}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
