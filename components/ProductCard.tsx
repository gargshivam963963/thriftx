"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import PremiumImage from "@/components/ui/PremiumImage";
import { isWishlisted, toggleWishlist } from "@/lib/services/wishlist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/Card";

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
      <Card className="group relative h-full overflow-hidden border-border/70 bg-card/80 shadow-sm">
        <Link href={`/product/${slug}`} className="flex h-full flex-col">
          {/* ── Image — Uniform Fixed Height ──────────────────────── */}
          <div className="relative h-[220px] w-full overflow-hidden bg-muted sm:h-[260px] md:h-[280px] xl:h-[320px]">
            <PremiumImage
              src={image || "/images/placeholder.jpg"}
              alt={title}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
            />

            {/* Wishlist */}
            <Button
              type="button"
              onClick={handleWishlist}
              disabled={wishlistLoading}
              variant="ghost"
              size="iconSm"
              rounded="full"
              className="absolute right-2 top-2 z-20 border border-border/70 bg-background/80 backdrop-blur-md shadow-sm"
            >
              <Heart
                size={14}
                className={`transition-all duration-200 ${wishlisted ? "fill-red-500 text-red-500" : "text-foreground"}`}
              />
            </Button>

            {/* Discount */}
            {discount && discount > 0 && (
              <div className="absolute left-2 top-2 z-20">
                <Badge variant="error" size="xs" rounded="md" className="bg-red-500/90 text-white">
                  -{discount}%
                </Badge>
              </div>
            )}

            {/* Only 1 left */}
            {onlyOneLeft && (
              <div className="absolute left-2 top-2 z-20">
                <Badge variant="warning" size="xs" rounded="md" className="bg-amber-500/90 text-white">
                  Only 1
                </Badge>
              </div>
            )}
          </div>

          {/* ── Info — Minimal ────────────────────────────────────── */}
          <CardContent className="mt-2.5 flex-1 space-y-1.5 px-3 pb-4 pt-0">
            <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {brand}
            </p>

            <h3 className="text-h4 font-semibold leading-tight text-foreground line-clamp-1">
              {title}
            </h3>

            {measurement && (
              <p className="text-small text-muted-foreground">
                {measurement}
              </p>
            )}

            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-body font-semibold tracking-tight text-foreground">
                ₹{Number(price || 0).toLocaleString("en-IN")}
              </span>
              {retailPrice && retailPrice > price && (
                <span className="text-small text-muted-foreground line-through">
                  ₹{retailPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}

