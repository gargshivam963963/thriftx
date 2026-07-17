import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

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
  onlyOneLeft,
}: ProductCardProps) {
  return (
    <Link
      href={`/product/${id}`}
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[22px]
        border
        border-neutral-200
        bg-white
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-neutral-300
        hover:shadow-xl
      "
    >
      {/* IMAGE */}
      <div className="relative aspect-[1/1] overflow-hidden rounded-t-[22px] bg-neutral-100">
        {onlyOneLeft && (
          <div className="absolute left-4 top-4 z-20">
            <span className="rounded-full bg-black px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
              Last Piece
            </span>
          </div>
        )}

        <button className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur transition hover:scale-105 hover:text-red-500">
          <Heart className="h-4 w-4" />
        </button>

        <Image
          src={image}
          alt={title}
          fill
          referrerPolicy="no-referrer"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />

      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col px-5 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          {brand}
        </span>

        <h3 className="mt-2 line-clamp-2 text-[22px] font-medium leading-[1.35] text-neutral-900">
          {title}
        </h3>

        <div className="mt-4">
          <span className="text-[28px] font-semibold tracking-tight text-neutral-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="mt-4 border-t border-neutral-100 pt-4">
          <span className="text-sm text-neutral-500">
            {condition.charAt(0).toUpperCase() + condition.slice(1)} Condition
          </span>
        </div>

      </div>
    </Link>
  );
}