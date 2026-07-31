"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PremiumImage from "@/components/ui/PremiumImage";
import { isWishlisted, toggleWishlist } from "@/lib/services/wishlist";

const TOPWEAR_KEYWORDS = [
    "t-shirts", "shirt", "hoodie", "jacket", "blazer",
    "sweater", "top", "blouse", "cardigan", "vest", "jersey",
];

const LOWER_KEYWORDS = [
    "jeans", "cargo", "trouser", "short", "skirt", "lower",
    "pant", "chino", "jogger", "legging",
];

function getMeasurementDisplay(category: string, chest?: string, waist?: string, length?: string): { primary: string | null; length_: string | null } {
    const cat = category.toLowerCase();
    const isTopwear = TOPWEAR_KEYWORDS.some(k => cat.includes(k));
    const isLower = LOWER_KEYWORDS.some(k => cat.includes(k));

    let primary: string | null = null;
    if (isTopwear && chest) primary = `Chest ${chest}″`;
    else if (isLower && waist) primary = `Waist ${waist}″`;
    else if (chest) primary = `Chest ${chest}″`;
    else if (waist) primary = `Waist ${waist}″`;

    const length_: string | null = length ? `Length ${length}″` : null;

    return { primary, length_ };
}

interface ProductCardGridProps {
    id: string;
    slug: string;
    brand: string;
    title: string;
    price: number;
    retailPrice?: number;
    image: string;
    category?: string;
    chest?: string;
    waist?: string;
    length?: string;
    onlyOneLeft?: boolean;
}

export default function ProductCardGrid({
    id,
    slug,
    brand,
    title,
    price,
    retailPrice,
    image,
    category = "",
    chest,
    waist,
    length,
    onlyOneLeft = false,
}: ProductCardGridProps) {
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        isWishlisted(id).then(setWishlisted).catch(() => { });
    }, [id]);

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlistLoading(true);
        try {
            const state = await toggleWishlist(id);
            setWishlisted(state);
            toast.success(state ? "Added to wishlist ❤️" : "Removed from wishlist");
        } catch {
            toast.error("Please sign in to wishlist");
        } finally {
            setWishlistLoading(false);
        }
    };

    const { primary: measurement, length_: lengthDisplay } = getMeasurementDisplay(category, chest, waist, length);
    const discount =
        retailPrice && retailPrice > price
            ? Math.round(((retailPrice - price) / retailPrice) * 100)
            : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            <Link href={`/product/${slug}`} className="group block">
                <Card className="overflow-hidden border-neutral-200/80 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-700/60 dark:bg-neutral-900">
                    {/* ── Image — Uniform Fixed Height ──────────────── */}
                    <div className="relative h-[200px] xs:h-[220px] sm:h-[260px] md:h-[280px] xl:h-[320px] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        <PremiumImage
                            src={image || "/images/placeholder.jpg"}
                            alt={title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className="object-cover transition-all duration-500 group-hover:scale-105"
                        />

                        {onlyOneLeft && (
                            <Badge variant="warning" size="xs" rounded="md" className="absolute left-2 top-2 z-10">
                                Only 1
                            </Badge>
                        )}

                        {discount && discount > 0 && (
                            <Badge variant="error" size="xs" rounded="md" className="absolute left-2 top-2 z-10 bg-white/90 text-red-600 dark:bg-white/90">
                                -{discount}%
                            </Badge>
                        )}

                        <button
                            type="button"
                            onClick={handleWishlist}
                            disabled={wishlistLoading}
                            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm transition-all hover:bg-white hover:scale-110 active:scale-90"
                        >
                            <Heart
                                size={13}
                                className={`transition-all duration-200 ${wishlisted ? "fill-red-500 text-red-500" : "text-neutral-700"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* ── Info — using shadcn CardContent ──────────── */}
                    <CardContent className="p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500 truncate">
                            {brand}
                        </p>

                        <h3 className="mt-1 text-sm font-semibold leading-tight text-neutral-900 dark:text-neutral-200 line-clamp-1">
                            {title}
                        </h3>

                        {/* Measurements - chest/waist left, length right */}
                        {(measurement || lengthDisplay) && (
                            <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                                    {measurement}
                                </span>
                                {lengthDisplay && (
                                    <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                                        {lengthDisplay}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                ₹{Number(price || 0).toLocaleString("en-IN")}
                            </span>
                            {retailPrice && retailPrice > price && (
                                <span className="text-[11px] text-neutral-400 line-through">
                                    ₹{retailPrice.toLocaleString("en-IN")}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}
