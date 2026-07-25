"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import PremiumImage from "@/components/ui/PremiumImage";

interface ProductCardGridProps {
    id: string;
    brand: string;
    title: string;
    price: number;
    condition: string;
    image: string;
    onlyOneLeft?: boolean;
    size?: string;
}

export default function ProductCardGrid({
    id,
    brand,
    title,
    price,
    condition,
    image,
    onlyOneLeft = false,
    size,
}: ProductCardGridProps) {
    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toast.success("Added to wishlist");
    };

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toast.success("Added to bag");
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="group"
        >
            <Link
                href={`/product/${id}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-500"
            >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 dark:bg-neutral-800">
                    <PremiumImage
                        src={image || "/images/placeholder.jpg"}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition-all duration-700 group-hover:scale-[1.05]"
                    />

                    {onlyOneLeft && (
                        <span className="absolute left-2 top-2 z-10 rounded-full bg-amber-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
                            Last
                        </span>
                    )}

                    {condition && (
                        <span className="absolute left-2 bottom-2 z-10 rounded-full bg-white/90 px-2.5 py-0.5 text-[9px] font-semibold text-neutral-700 shadow-sm backdrop-blur-sm dark:bg-neutral-800/90 dark:text-neutral-300">
                            {condition}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={handleWishlist}
                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm transition-all hover:bg-white hover:text-red-500 dark:bg-neutral-800/80 dark:hover:bg-neutral-700"
                    >
                        <Heart size={14} />
                    </button>
                </div>

                {/* Content - compact */}
                <div className="flex flex-col gap-1.5 p-3.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                        {brand}
                    </span>
                    <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {title}
                    </h3>

                    <div className="flex items-center justify-between mt-1">
                        <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            ₹{Number(price || 0).toLocaleString("en-IN")}
                        </span>
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-all hover:bg-neutral-900 hover:text-white dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
                        >
                            <ShoppingBag size={13} />
                        </button>
                    </div>

                    {size && (
                        <span className="text-[9px] font-medium text-neutral-400 dark:text-neutral-500">
                            Size {size}
                        </span>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}

