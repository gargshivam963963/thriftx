import Image from 'next/image';
import Link from 'next/link';
import { Heart, BadgeCheck } from 'lucide-react';

interface ProductCardProps {
  id: string;
  brand: string;
  title: string;
  price: string;
  condition: string;
  image: string;
  onlyOneLeft?: boolean;
}

export default function ProductCard({ id, brand, title, price, condition, image, onlyOneLeft }: ProductCardProps) {
  return (
    <Link href={`/product/${id}`} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#e5e5e5] hover:border-[#cfc4c5] transition-all duration-300 relative h-full hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="absolute top-3 right-3 z-10">
        <button className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-black hover:text-red-500 transition-colors shadow-sm">
          <Heart className="w-4 h-4" />
        </button>
      </div>
      {onlyOneLeft && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-[#064E3B] text-white px-3 py-1 rounded-full text-[9px] font-semibold tracking-widest uppercase shadow-sm">Only 1 Left</span>
        </div>
      )}
      <div className="aspect-[1/1.25] relative overflow-hidden bg-[#f3f3f3]">
        <Image src={image} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full text-xs font-semibold tracking-widest uppercase translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100">Quick View</span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1.5">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#4c4546]">{brand}</p>
          <span className="text-[10px] font-semibold tracking-widest text-[#7e7576] flex items-center gap-1">
            <BadgeCheck className="w-3 h-3 text-[#C5A059]" /> {condition}
          </span>
        </div>
        <h3 className="font-sans text-base text-black line-clamp-2 mb-4 leading-relaxed">{title}</h3>
        <div className="mt-auto">
          <p className="font-sans text-xl font-semibold text-black">{price}</p>
        </div>
      </div>
    </Link>
  );
}
