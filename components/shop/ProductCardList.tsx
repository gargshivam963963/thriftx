"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
    Card,
    CardContent,
} from "@/components/ui/Card";
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

interface ProductCardListProps {
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
    material?: string;
    description?: string;
    onlyOneLeft?: boolean;
}

export default function ProductCardList({
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
    material,
    description,
    onlyOneLeft = false,
}: ProductCardListProps) {
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="group"
        >
            <Link href={`/product/${slug}`} className="block">
                <Card className="overflow-hidden border-border bg-card shadow-card transition-all hover:shadow-md">
                    <div className="flex flex-col sm:flex-row">
                        {/* ── Image ──────────────────────────────────── */}
                        <div className="relative h-[200px] w-full sm:h-[220px] sm:w-[240px] md:w-[260px] shrink-0 overflow-hidden bg-muted">
                            <PremiumImage
                                src={image || "/images/placeholder.jpg"}
                                alt={title}
                                fill
                                sizes="(max-width: 640px) 100vw, 240px"
                                className="object-cover transition-all duration-1000 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.08]"
                            />

                            {onlyOneLeft && (
                                <Badge variant="warning" size="xs" rounded="md" className="absolute left-3 top-3 z-10">
                                    Last Piece
                                </Badge>
                            )}

                            {discount && discount > 0 && (
                                <Badge variant="error" size="xs" rounded="md" className="absolute left-3 top-3 z-10 bg-white/90 text-red-600 dark:bg-white/90">
                                    -{discount}%
                                </Badge>
                            )}

                            <button
                                type="button"
                                onClick={handleWishlist}
                                disabled={wishlistLoading}
                                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-xl shadow-lg transition-colors hover:bg-white"
                                aria-label="Wishlist"
                            >
                                <Heart
                                    size={15}
                                    className={`transition-all duration-200 ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
                                        }`}
                                />
                            </button>
                        </div>

                        {/* ── Content ────────────────────────────────── */}
                        <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
                            <p className="text-badge font-bold uppercase tracking-widest text-muted-foreground">
                                {brand}
                            </p>

                            <h3 className="mt-1.5 text-heading-4 font-bold leading-tight text-foreground">
                                {title}
                            </h3>

                            {description && (
                                <p className="mt-2 line-clamp-2 text-body leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            )}

                            {/* Measurements - chest/waist left, length right */}
                            {(measurement || lengthDisplay) && (
                                <div className="mt-3 flex items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {measurement && (
                                            <Badge variant="secondary" size="sm" rounded="full">
                                                {measurement}
                                            </Badge>
                                        )}
                                        {material && (
                                            <Badge variant="secondary" size="sm" rounded="full">
                                                {material}
                                            </Badge>
                                        )}
                                    </div>
                                    {lengthDisplay && (
                                        <Badge variant="outline" size="sm" rounded="full">
                                            {lengthDisplay}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* If no measurements but material exists */}
                            {!measurement && !lengthDisplay && material && (
                                <div className="mt-3">
                                    <Badge variant="secondary" size="sm" rounded="full">
                                        {material}
                                    </Badge>
                                </div>
                            )}

                            {/* Price */}
                            <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                                <div>
                                    <p className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                        Price
                                    </p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-heading-3 font-bold tracking-tight text-foreground">
                                            ₹{Number(price || 0).toLocaleString("en-IN")}
                                        </span>
                                        {retailPrice && retailPrice > price && (
                                            <span className="text-body-sm text-muted-foreground line-through">
                                                ₹{retailPrice.toLocaleString("en-IN")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
}
