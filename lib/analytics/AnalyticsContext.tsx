"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { EventType } from "./types";
import { initTracker, getTracker } from "./tracker";

// ─── Context Type ──────────────────────────────────────────────────────────────

interface AnalyticsContextType {
    track: (
        eventType: EventType,
        eventName: string,
        properties?: Record<string, string | number | boolean | string[] | number[] | null>,
    ) => void;
    trackSearch: (query: string, resultsCount: number) => void;
    trackProductView: (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => void;
    trackAddToCart: (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => void;
    trackRemoveFromCart: (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => void;
    trackCheckoutStart: (data: Record<string, string | number | boolean | string[] | number[] | null>) => void;
    trackCheckoutComplete: (data: Record<string, string | number | boolean | string[] | number[] | null>) => void;
    trackPurchase: (data: Record<string, string | number | boolean | string[] | number[] | null>) => void;
    trackWishlistAdd: (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => void;
    trackWishlistRemove: (productId: string) => void;
    trackClick: (elementName: string, elementType: string, additionalData?: Record<string, string | number | boolean | string[] | number[] | null>) => void;
    isReady: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
    track: () => { },
    trackSearch: () => { },
    trackProductView: () => { },
    trackAddToCart: () => { },
    trackRemoveFromCart: () => { },
    trackCheckoutStart: () => { },
    trackCheckoutComplete: () => { },
    trackPurchase: () => { },
    trackWishlistAdd: () => { },
    trackWishlistRemove: () => { },
    trackClick: () => { },
    isReady: false,
});

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const trackerRef = useRef<ReturnType<typeof getTracker> | null>(null);
    const prevPathRef = useRef<string>("");
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const tracker = initTracker({
            enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false",
            flushInterval: 5000,
            batchSize: 50,
            debug: process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true",
        });
        trackerRef.current = tracker;
        setIsReady(true);

        return () => {
            tracker.destroy();
        };
    }, []);

    useEffect(() => {
        if (!trackerRef.current || !isReady) return;
        const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        if (currentPath !== prevPathRef.current) {
            prevPathRef.current = currentPath;
            trackerRef.current.trackPageView();
        }
    }, [pathname, searchParams, isReady]);

    useEffect(() => {
        if (!trackerRef.current || !isReady) return;
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    trackerRef.current?.trackScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isReady]);

    const track = useCallback(
        (eventType: EventType, eventName: string, properties: Record<string, string | number | boolean | string[] | number[] | null> = {}) => {
            trackerRef.current?.track(eventType, eventName, properties);
        }, [],
    );

    const trackSearch = useCallback((query: string, resultsCount: number) => {
        trackerRef.current?.trackSearch(query, resultsCount);
    }, []);

    const trackProductView = useCallback(
        (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => {
            trackerRef.current?.trackProductView(productId, productData);
        }, [],
    );

    const trackAddToCart = useCallback(
        (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => {
            trackerRef.current?.trackAddToCart(productId, productData);
        }, [],
    );

    const trackRemoveFromCart = useCallback(
        (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => {
            trackerRef.current?.trackRemoveFromCart(productId, productData);
        }, [],
    );

    const trackCheckoutStart = useCallback(
        (data: Record<string, string | number | boolean | string[] | number[] | null>) => {
            trackerRef.current?.trackCheckoutStart(data);
        }, [],
    );

    const trackCheckoutComplete = useCallback(
        (data: Record<string, string | number | boolean | string[] | number[] | null>) => {
            trackerRef.current?.trackCheckoutComplete(data);
        }, [],
    );

    const trackPurchase = useCallback(
        (data: Record<string, string | number | boolean | string[] | number[] | null>) => {
            trackerRef.current?.trackPurchase(data);
        }, [],
    );

    const trackWishlistAdd = useCallback(
        (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => {
            trackerRef.current?.trackWishlistAdd(productId, productData);
        }, [],
    );

    const trackWishlistRemove = useCallback((productId: string) => {
        trackerRef.current?.trackWishlistRemove(productId);
    }, []);

    const trackClick = useCallback(
        (elementName: string, elementType: string, additionalData: Record<string, string | number | boolean | string[] | number[] | null> = {}) => {
            trackerRef.current?.trackClick(elementName, elementType, additionalData);
        }, [],
    );

    return (
        <AnalyticsContext.Provider
            value={{
                track, trackSearch, trackProductView, trackAddToCart, trackRemoveFromCart,
                trackCheckoutStart, trackCheckoutComplete, trackPurchase,
                trackWishlistAdd, trackWishlistRemove, trackClick, isReady,
            }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
}

export const useAnalytics = () => useContext(AnalyticsContext);
export default AnalyticsContext;
