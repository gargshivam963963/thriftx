"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import PremiumImage from "@/components/ui/PremiumImage";
import { isWishlisted, toggleWishlist } from "@/lib/services/wishlist";

const TOPWEAR_KEYWORDS = [
  "t-shirts", "shirt", "hoodie", "jacket", "blazer",
  "sweater", "top", "blouse", "cardigan", "vest", "jersey",
];

function getMeasurement(category: string, chest?: string, waist?: string): string | null {
  const cat = category.toLowerCase();
  const isTopwear = TOPWEAR_KEYWORDS.some(k => cat.includes(k));
  if (isTopwear && chest) return `Chest ${chest}`;
  if (!isTopwear && waist) return `Waist ${waist}`;
  return null;
}

interface ProductCardProps {
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
  onlyOneLeft?: boolean;
}

export default function ProductCard({
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
  onlyOneLeft = false,
}: ProductCardProps) {
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Link
        href={`/product/${slug}`}
        className="group relative flex h-full flex-col"
      >
        {/* ── Image — Uniform Fixed Height ──────────────────────── */}
        <div className="relative h-[200px] xs:h-[220px] sm:h-[260px] md:h-[280px] xl:h-[320px] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
          <PremiumImage
            src={image || "/images/placeholder.jpg"}
            alt={title}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
          />

          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-110 active:scale-90 hover:bg-white"
          >
            <Heart
              size={14}
              className={`transition-all duration-200 ${wishlisted ? "fill-red-500 text-red-500" : "text-neutral-700"
                }`}
            />
          </button>

          {/* Discount */}
          {discount && discount > 0 && (
            <div className="absolute left-2 top-2 z-20">
              <span className="rounded-lg bg-white/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-red-600 shadow-sm">
                -{discount}%
              </span>
            </div>
          )}

          {/* Only 1 left */}
          {onlyOneLeft && (
            <div className="absolute left-2 top-2 z-20">
              <span className="rounded-lg bg-amber-500/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                Only 1
              </span>
            </div>
          )}
        </div>

        {/* ── Info — Minimal ────────────────────────────────────── */}
        <div className="mt-2.5 space-y-0.5 px-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">
            {brand}
          </p>

          <h3 className="text-sm font-semibold leading-tight text-neutral-900 dark:text-neutral-100 line-clamp-1">
            {title}
          </h3>

          {measurement && (
            <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              {measurement}
            </p>
          )}

          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              ₹{Number(price || 0).toLocaleString("en-IN")}
            </span>
            {retailPrice && retailPrice > price && (
              <span className="text-[11px] text-neutral-400 line-through">
                ₹{retailPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

