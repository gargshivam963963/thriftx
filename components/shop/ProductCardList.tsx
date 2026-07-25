"use client";

import Link from "next/link";
import {
    Heart,
    ShoppingBag,
    Ruler,
    ShieldCheck,
    RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import PremiumImage from "@/components/ui/PremiumImage";

interface ProductCardListProps {
    id: string;
    brand: string;
    title: string;
    price: number;
    condition: string;
    image: string;
    onlyOneLeft?: boolean;
    size?: string;
    chest?: string;
    waist?: string;
    material?: string;
    description?: string;
}

export default function ProductCardList({
    id,
    brand,
    title,
    price,
    condition,
    image,
    onlyOneLeft = false,
    size,
    chest,
    waist,
    material,
    description,
}: ProductCardListProps) {
    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toast.success("Added to wishlist", {
            description: `${title} — ${brand}`,
            icon: "❤️",
        });
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toast.success("Added to bag", {
            description: `${title}`,
            icon: "🛍️",
        });
    };

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
                className="flex flex-col overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-500 sm:flex-row"
            >
                {/* ── IMAGE ─────────────────────────────────────────────── */}
                <div className="relative aspect-[4/5] w-full sm:aspect-[3/4] sm:w-[300px] sm:shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <PremiumImage
                        src={image || "/images/placeholder.jpg"}
                        rounded
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, 300px"
                        className="object-cover transition-all duration-1000 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.08]"
                    />

                    {/* Overlay gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Badges */}
                    <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                        {onlyOneLeft && (
                            <span className="rounded-full bg-gradient-to-r from-amber-600 to-amber-500 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-lg">
                                Last Piece
                            </span>
                        )}
                        {condition && (
                            <span className="rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-700 shadow-sm dark:bg-neutral-800/80 dark:text-neutral-300">
                                {condition}
                            </span>
                        )}
                    </div>

                    {/* Wishlist */}
                    <motion.button
                        type="button"
                        onClick={handleWishlist}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-xl shadow-lg transition-colors hover:bg-white hover:text-red-500 dark:bg-neutral-800/80 dark:hover:bg-neutral-700"
                        aria-label="Wishlist"
                    >
                        <Heart className="h-[16px] w-[16px]" />
                    </motion.button>
                </div>

                {/* ── CONTENT ─────────────────────────────────────────────── */}
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                    {/* Brand */}
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500">
                        {brand}
                    </span>

                    {/* Title */}
                    <h3 className="mt-1.5 text-xl font-bold leading-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
                        {title}
                    </h3>

                    {/* Description */}
                    {description && (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {description}
                        </p>
                    )}

                    {/* Specs badges */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {condition && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[10px] font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                                <ShieldCheck size={12} className="text-emerald-500" />
                                {condition}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[10px] font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                            <RotateCcw size={12} className="text-amber-500" />
                            7-Day Returns
                        </span>
                        {material && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[10px] font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                                {material}
                            </span>
                        )}
                    </div>

                    {/* Measurements grid */}
                    {(chest || waist || size) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {size && (
                                <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[10px] font-semibold text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                                    <Ruler size={10} />
                                    Fit: {size}
                                </span>
                            )}
                            {chest && (
                                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    Chest {chest}″
                                </span>
                            )}
                            {waist && (
                                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    Waist {waist}″
                                </span>
                            )}
                        </div>
                    )}

                    {/* Price + CTA */}
                    <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                                Price
                            </p>
                            <p className="mt-0.5 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                ₹{Number(price || 0).toLocaleString("en-IN")}
                            </p>
                        </div>
                        <motion.button
                            type="button"
                            onClick={handleAddToCart}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex h-12 items-center gap-2.5 rounded-2xl bg-black px-6 text-sm font-bold text-white shadow-lg transition-all hover:bg-neutral-800 hover:shadow-xl dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                        >
                            <ShoppingBag size={16} />
                            Add to Bag
                        </motion.button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

