"use client";

import { motion } from "framer-motion";
import { Eye, ShoppingCart, CreditCard, TrendingUp, TrendingDown } from "lucide-react";

interface FunnelProduct {
    productId: string;
    views: number;
    cartAdds: number;
    purchases: number;
    viewToCart: number;
    cartToPurchase: number;
}

export default function ProductFunnel({
    data,
    loading,
}: {
    data: FunnelProduct[] | null;
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-white p-5 dark:border-border dark:bg-foreground">
                <div className="h-5 w-36 animate-pulse rounded bg-muted" />
                <div className="mt-4 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-white p-5 text-center dark:border-border dark:bg-foreground">
                <Eye size={24} className="mx-auto text-muted-foreground dark:text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No product funnel data yet</p>
            </div>
        );
    }

    const topProducts = data.slice(0, 10);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-white p-5 dark:border-border dark:bg-foreground"
        >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product Conversion Funnel
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
                View → Cart → Purchase rates per product
            </p>

            <div className="mt-4 space-y-2">
                <div className="grid grid-cols-[1fr_60px_60px_60px_60px] gap-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <div>Product</div>
                    <div className="text-right">Views</div>
                    <div className="text-right">Cart</div>
                    <div className="text-right">Buy</div>
                    <div className="text-right">V→C</div>
                </div>

                <div className="space-y-1">
                    {topProducts.map((product, i) => (
                        <div
                            key={product.productId}
                            className="grid grid-cols-[1fr_60px_60px_60px_60px] items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-subtle dark:hover:bg-card/50"
                        >
                            {/* Product ID (truncated) */}
                            <div className="truncate text-sm font-medium text-foreground">
                                <span className="mr-1.5 text-[10px] text-muted-foreground">
                                    #{i + 1}
                                </span>
                                {product.productId.length > 18
                                    ? `${product.productId.slice(0, 18)}...`
                                    : product.productId}
                            </div>

                            {/* Views */}
                            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                <Eye size={11} className="text-muted-foreground" />
                                {product.views}
                            </div>

                            {/* Cart Adds */}
                            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                <ShoppingCart size={11} className="text-muted-foreground" />
                                {product.cartAdds}
                            </div>

                            {/* Purchases */}
                            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                <CreditCard size={11} className="text-muted-foreground" />
                                {product.purchases}
                            </div>

                            {/* View→Cart Rate */}
                            <div className="flex items-center justify-end gap-1">
                                {product.viewToCart >= 20 ? (
                                    <TrendingUp size={11} className="text-emerald-500" />
                                ) : (
                                    <TrendingDown size={11} className="text-red-400" />
                                )}
                                <span
                                    className={`text-xs font-semibold ${product.viewToCart >= 20
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : "text-red-500 dark:text-red-400"
                                        }`}
                                >
                                    {product.viewToCart}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

