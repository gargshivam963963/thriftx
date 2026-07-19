'use client';

import { useState } from 'react';
import { ShoppingBag, Heart, BrainCircuit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/services/products';
import { addToCart } from '@/lib/services/cart';

export default function ProductActions({
  product,
}: {
  product: Product;
}) {
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleAddToCart() {
    try {
      setLoading(true);

      await addToCart(product.id, 1);

      router.push('/cart');
    } catch (error) {
      console.error(error);
      alert('Unable to add product to cart.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setIsTryOnOpen(true)}
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-sans text-base sm:text-lg font-medium py-4 sm:py-5 rounded-2xl hover:opacity-90 transition-opacity flex justify-center items-center gap-3 shadow-lg hover:shadow-xl"
        >
          <BrainCircuit className="w-5 h-5" />
          Virtual Try-On
        </button>

        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full bg-black text-white font-sans text-base sm:text-lg font-medium py-4 sm:py-5 rounded-2xl hover:bg-black/90 transition-colors flex justify-center items-center gap-3 disabled:opacity-50"
        >
          <ShoppingBag className="w-5 h-5" />
          {loading ? 'Adding...' : 'Add to Cart'}
        </button>

        <button className="w-full border-2 border-black text-black font-sans text-base sm:text-lg font-medium py-4 sm:py-5 rounded-2xl hover:bg-[#f3f3f3] transition-colors flex justify-center items-center gap-3">
          <Heart className="w-5 h-5" />
          Wishlist
        </button>
      </div>
    </>
  );
}