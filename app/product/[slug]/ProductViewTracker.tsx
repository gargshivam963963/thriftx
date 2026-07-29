"use client";

import { useEffect, useRef } from "react";
import { useAnalytics } from "@/lib/analytics/AnalyticsContext";
import type { Product } from "@/lib/services/products";

/**
 * Client component that fires a product_view analytics event
 * when the product detail page loads.
 * Renders nothing — purely for tracking.
 */
export default function ProductViewTracker({
    product,
}: {
    product: Product;
}) {
    const { trackProductView, isReady } = useAnalytics();
    const trackedRef = useRef(false);

    useEffect(() => {
        if (isReady && !trackedRef.current) {
            trackedRef.current = true;
            trackProductView(product.id, {
                title: product.title,
                brand: product.brand || "",
                category: product.category || "",
                price: product.price,
                slug: product.slug,
            });
        }
    }, [isReady, product.id, product.title, product.brand, product.category, product.price, product.slug, trackProductView]);

    return null;
}

