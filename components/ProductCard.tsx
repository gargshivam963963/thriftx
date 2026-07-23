"use client";

import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

import PremiumImage from "@/components/ui/PremiumImage";

interface ProductCardProps {
  id: string;
  brand: string;
  title: string;
  price: number;
  condition: string;
  image: string;
  onlyOneLeft?: boolean;
}

export default function ProductCard({
  id,
  brand,
  title,
  price,
  condition,
  image,
  onlyOneLeft = false,
}: ProductCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      whileHover={{
        y: -10,
        scale: 1.01,
      }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      <Link
        href={`/product/${id}`}
        className="
          group
          flex
          h-full
          flex-col
          overflow-hidden
          rounded-[24px]
          border
          border-neutral-200
          bg-white
          shadow-[0_6px_20px_rgba(0,0,0,.04)]
hover:shadow-[0_30px_60px_rgba(0,0,0,.12)]
          transition-all
          duration-300
          hover:border-neutral-300
        "
      >
        {/* IMAGE */}
        <div
          className="
    relative
    aspect-[4/5]
    overflow-hidden
    rounded-t-[24px]
    bg-neutral-100
  "
        >
          <PremiumImage
            src={image || "/images/placeholder.jpg"}
            rounded
            alt={title}
            fill
            sizes="(max-width:768px)50vw,(max-width:1200px)33vw,25vw"
            className="
object-cover
transition-all
duration-1000
ease-[cubic-bezier(.22,1,.36,1)]
group-hover:scale-[1.1]
"
          />

          {onlyOneLeft && (
            <div className="absolute left-3 top-3 z-20">
              <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
                Last Piece
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="
              absolute
              right-3
              top-3
              z-20
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white/90
              backdrop-blur-xl
              shadow-lg
             hover:scale-110
active:scale-95
hover:bg-white
hover:text-red-500
transition-all
duration-300
            "
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>

          <div
            className="
              absolute
              inset-x-3
              bottom-3
              translate-y-5
              opacity-0
              transition-all
              duration-300
              group-hover:translate-y-0
              group-hover:opacity-100
            "
          >
            <div className="rounded-xl bg-black/85 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur-xl">
              View Details →
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col p-5">
          <span className="text-[11px] font-semibold uppercase text-neutral-400
tracking-[0.3em]">
            {brand}
          </span>

          <h3 className="mt-2 line-clamp-2 min-h-[56px] text-lg font-semibold leading-7 text-neutral-900">
            {title}
          </h3>

          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              {condition.charAt(0).toUpperCase() + condition.slice(1)}
            </span>

            {onlyOneLeft && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                Only 1 Left
              </span>
            )}
          </div>

          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                  Price
                </p>

                <p className="mt-1 font-bold tracking-tight text-neutral-900">
                  ₹{Number(price || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border
                border-neutral-100
hover:border-neutral-300
                  transition-all
                 group-hover:bg-black
group-hover:text-white
group-hover:rotate-45
duration-300
                "
              >
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}