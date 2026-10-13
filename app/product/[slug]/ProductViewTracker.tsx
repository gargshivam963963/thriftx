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
    const { trackProductView, track, isReady } = useAnalytics();
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

    // Dwell time: report how long the shopper stayed on this product.
    // Flushed once — on SPA navigation (component unmount) or on `pagehide`
    // when the tab closes (React doesn't reliably unmount on unload). The
    // localStorage queue makes the event survive both paths.
    useEffect(() => {
        if (!isReady) return;

        const startedAt = Date.now();
        let flushed = false;

        const flush = () => {
            if (flushed) return;
            const seconds = Math.round((Date.now() - startedAt) / 1000);
            if (seconds < 1) return;
            flushed = true;
            track("product_view_duration", "Product View Duration", {
                productId: product.id,
                seconds,
                slug: product.slug,
            });
        };

        const onPageHide = () => flush();
        window.addEventListener("pagehide", onPageHide);

        return () => {
            window.removeEventListener("pagehide", onPageHide);
            flush();
        };
    }, [isReady, product.id, product.slug, track]);

    return null;
}

