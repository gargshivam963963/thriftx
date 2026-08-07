'use client';

import { ShoppingBag, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';

export type BusyAction = 'add' | 'buy' | null;

interface ProductActionsProps {
  busy: BusyAction;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

/**
 * ProductActions — desktop Add to Cart / Buy Now buttons.
 * Presentational; logic lives in ProductPurchasePanel.
 */
export default function ProductActions({
  busy,
  onAddToCart,
  onBuyNow,
}: ProductActionsProps) {
  return (
    <div className="hidden grid-cols-1 gap-3 sm:grid-cols-2 lg:grid">
      <Button
        variant="outline"
        size="lg"
        className="h-14"
        loading={busy === 'add'}
        loadingText="Adding..."
        leftIcon={<ShoppingBag />}
        onClick={onAddToCart}
      >
        Add to Cart
      </Button>

      <Button
        variant="primary"
        size="lg"
        className="h-14"
        loading={busy === 'buy'}
        loadingText="Redirecting..."
        leftIcon={<Zap />}
        onClick={onBuyNow}
      >
        Buy Now
      </Button>
    </div>
  );
}
