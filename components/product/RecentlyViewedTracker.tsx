"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/services/products";
import { addRecentlyViewedProduct } from "@/lib/recentlyViewed";

interface RecentlyViewedTrackerProps {
    product: Product;
}

export default function RecentlyViewedTracker({ product }: RecentlyViewedTrackerProps) {
    useEffect(() => {
        addRecentlyViewedProduct({
            id: product.id,
            slug: product.slug,
            title: product.title,
            brand: product.brand,
            price: product.price,
            image: product.primaryImage || product.images?.[0] || "",
            category: product.category,
        });
    }, [product.slug, product.title, product.brand, product.price, product.primaryImage, product.images, product.category]);

    return null;
}
