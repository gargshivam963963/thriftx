'use client';

import { useState } from 'react';
import { ShoppingBag, Heart, BrainCircuit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/services/products';
import { addToCart } from '@/lib/services/cart';
import { Button } from '@/components/ui/button';

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
    <div className="flex gap-3">
      <Button
        variant="primary"
        size="lg"
        className="h-14 flex-1"
        loading={loading}
        loadingText="Adding..."
        leftIcon={<ShoppingBag />}
        onClick={handleAddToCart}
      >
        Add to Cart
      </Button>

      <Button
        variant="secondary"
        size="lg"
        className="h-14 flex-1"
        leftIcon={<Heart />}
      >
        Buy Now
      </Button>
    </div>
  );
}