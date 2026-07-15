'use client';
import { useState } from 'react';
import { ShoppingBag, Heart, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import TryOnModal from '@/components/TryOnModal';
import { Product } from '@/lib/products';

export default function ProductActions({ product }: { product: Product }) {
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => setIsTryOnOpen(true)}
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-sans text-lg font-medium py-5 rounded-2xl hover:opacity-90 transition-opacity flex justify-center items-center gap-3 shadow-lg hover:shadow-xl"
        >
          <BrainCircuit className="w-5 h-5" /> Virtual Try-On
        </button>
        <Link href="/cart" className="w-full bg-black text-white font-sans text-lg font-medium py-5 rounded-2xl hover:bg-black/90 transition-colors flex justify-center items-center gap-3">
          <ShoppingBag className="w-5 h-5" /> Add to Cart
        </Link>
        <button className="w-full border-2 border-black text-black font-sans text-lg font-medium py-5 rounded-2xl hover:bg-[#f3f3f3] transition-colors flex justify-center items-center gap-3">
          <Heart className="w-5 h-5" /> Wishlist
        </button>
      </div>

      <TryOnModal 
        isOpen={isTryOnOpen} 
        onClose={() => setIsTryOnOpen(false)} 
        productImage={product.image}
        productName={product.title}
      />
    </>
  );
}
