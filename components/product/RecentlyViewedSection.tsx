"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, RefreshCcw } from "lucide-react";
import ProductCardGrid from "@/components/shop/ProductCardGrid";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRecentlyViewedProducts, clearRecentlyViewedProducts, type RecentlyViewedProduct } from "@/lib/recentlyViewed";

interface RecentlyViewedSectionProps {
    excludeSlug?: string;
}

export default function RecentlyViewedSection({ excludeSlug }: RecentlyViewedSectionProps) {
    const [items, setItems] = useState<RecentlyViewedProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = getRecentlyViewedProducts().filter((item) => item.slug !== excludeSlug);
        setItems(stored);
        setLoading(false);
    }, [excludeSlug]);

    const handleClear = () => {
        clearRecentlyViewedProducts();
        setItems([]);
    };

    if (loading) {
        return null;
    }

    if (!items.length) {
        return null;
    }

    return (
        <section className="rounded-[28px] border border-neutral-200 bg-white/90 p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400 dark:text-neutral-500">
                        Recently Viewed
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                        Pick up where you left off
                    </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleClear}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm", rounded: "lg" }), "inline-flex items-center gap-2")}
                    >
                        <RefreshCcw size={14} />
                        Clear History
                    </button>
                    <Link href="/shop" className={cn(buttonVariants({ variant: "outline", size: "sm", rounded: "lg" }), "inline-flex items-center gap-2")}>
                        Continue Browsing
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                    <ProductCardGrid
                        key={item.slug}
                        id={item.id || item.slug}
                        slug={item.slug}
                        brand={item.brand}
                        title={item.title}
                        price={item.price}
                        image={item.image}
                        category={item.category}
                    />
                ))}
            </div>
        </section>
    );
}
