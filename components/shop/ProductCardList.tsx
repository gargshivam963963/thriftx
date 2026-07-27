"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart, Ruler, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import PremiumImage from "@/components/ui/PremiumImage";
import { isWishlisted, toggleWishlist } from "@/lib/services/wishlist";

const TOPWEAR_KEYWORDS = [
    "t-shirt", "shirt", "hoodie", "jacket", "blazer",
    "sweater", "top", "blouse", "cardigan", "vest", "jersey",
];

function getMeasurement(category: string, chest?: string, waist?: string): string | null {
    const cat = category.toLowerCase();
    const isTopwear = TOPWEAR_KEYWORDS.some(k => cat.includes(k));
    if (isTopwear && chest) return `Chest ${chest}`;
    if (!isTopwear && waist) return `Waist ${waist}`;
    return null;
}

interface ProductCardListProps {
    id: string;
    brand: string;
    title: string;
    price: number;
    retailPrice?: number;
    image: string;
    category?: string;
    chest?: string;
    waist?: string;
    material?: string;
    description?: string;
    onlyOneLeft?: boolean;
}

export default function ProductCardList({
    id,
    brand,
    title,
    price,
    retailPrice,
    image,
    category = "",
    chest,
    waist,
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

    const measurement = getMeasurement(category, chest, waist);
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
            <Link
                href={`/product/${id}`}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5 dark:bg-neutral-900 sm:flex-row"
            >
                {/* ── Image — Uniform Height ──────────────────────────────── */}
                <div className="relative h-[200px] w-full sm:h-[220px] sm:w-[240px] md:w-[260px] shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <PremiumImage
                        src={image || "/images/placeholder.jpg"}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, 240px"
                        className="object-cover transition-all duration-1000 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.08]"
                    />

                    {onlyOneLeft && (
                        <span className="absolute left-3 top-3 z-10 rounded-lg bg-amber-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow">
                            Last Piece
                        </span>
                    )}

                    {discount && discount > 0 && (
                        <span className="absolute left-3 top-3 z-10 rounded-lg bg-white/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-red-600 shadow-sm">
                            -{discount}%
                        </span>
                    )}

                    <motion.button
                        type="button"
                        onClick={handleWishlist}
                        disabled={wishlistLoading}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-xl shadow-lg transition-colors hover:bg-white"
                        aria-label="Wishlist"
                    >
                        <Heart
                            size={15}
                            className={`transition-all duration-200 ${wishlisted ? "fill-red-500 text-red-500" : "text-neutral-700"
                                }`}
                        />
                    </motion.button>
                </div>

                {/* ── Content ──────────────────────────────────────────────── */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500">
                        {brand}
                    </p>

                    <h3 className="mt-1.5 text-lg font-bold leading-tight text-neutral-900 dark:text-neutral-100 sm:text-xl">
                        {title}
                    </h3>

                    {description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {description}
                        </p>
                    )}

                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {measurement && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                                <Ruler size={12} className="text-neutral-500" />
                                {measurement}
                            </span>
                        )}
                        {material && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                                {material}
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                                Price
                            </p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    ₹{Number(price || 0).toLocaleString("en-IN")}
                                </span>
                                {retailPrice && retailPrice > price && (
                                    <span className="text-sm text-neutral-400 line-through">
                                        ₹{retailPrice.toLocaleString("en-IN")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
