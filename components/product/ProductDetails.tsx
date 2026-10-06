"use client";

import {
    Tag,
    Shapes,
    UserRound,
    Palette,
    Layers,
    Ruler,
    BadgeCheck,
    Sparkles,
    PackageCheck,
} from "lucide-react";
import type { Product } from "@/lib/services/products";

interface DetailRowProps {
    icon: typeof Tag;
    label: string;
    value: string;
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <span className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
            </span>
            <span className="text-body-sm font-semibold text-foreground text-right">
                {value}
            </span>
        </div>
    );
}

/**
 * ProductDetails — professional specification table.
 * Every field rendered conditionally so empty values are hidden.
 */
export default function ProductDetails({
    product,
}: {
    product: Product;
}) {
    const rows: DetailRowProps[] = [];

    if (product.brand)
        rows.push({ icon: Tag, label: "Brand", value: product.brand });
    if (product.category)
        rows.push({ icon: Shapes, label: "Category", value: product.category });
    if (product.gender)
        rows.push({ icon: UserRound, label: "Gender", value: product.gender });
    if (product.color)
        rows.push({ icon: Palette, label: "Color", value: product.color });
    if (product.material)
        rows.push({ icon: Layers, label: "Material", value: product.material });
    if (product.size)
        rows.push({ icon: Ruler, label: "Fit / Size", value: product.size });
    if (product.condition)
        rows.push({ icon: BadgeCheck, label: "Condition", value: product.condition });

    // Authenticity & availability are always relevant for thrift pieces
    rows.push({
        icon: Sparkles,
        label: "Authenticity",
        value: "100% Genuine",
    });
    rows.push({
        icon: PackageCheck,
        label: "Availability",
        value: "Only 1 Piece",
    });

    return (
        <div>
            <h3 className="mb-4 text-caption font-semibold uppercase tracking-caps text-muted-foreground">
                Product Details
            </h3>
            <div className="divide-y divide-border">
                {rows.map((row) => (
                    <DetailRow key={row.label} {...row} />
                ))}
            </div>
        </div>
    );
}
