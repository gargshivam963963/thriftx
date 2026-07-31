"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { EventType } from "./types";
import { initTracker, getTracker } from "./tracker";
import { shouldTrack } from "./utils";
import { useAuth } from "@/lib/AuthContext";

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
    const { user } = useAuth();
    const trackerRef = useRef<ReturnType<typeof getTracker> | null>(null);
    const prevPathRef = useRef<string>("");
    const [isReady, setIsReady] = useState(false);

    // Determine if the current user is an admin (any authenticated user on admin routes)
    const isAdmin = useRef(false);
    isAdmin.current = !!user;

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

    // Track page views only for real customer traffic
    useEffect(() => {
        if (!trackerRef.current || !isReady) return;

        // Skip tracking if this is localhost, admin route, or admin user
        if (!shouldTrack(isAdmin.current, pathname)) {
            if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true") {
                console.log(`[Analytics] Skipping page view (filtered): ${pathname}`);
            }
            return;
        }

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

    // Whether tracking is allowed for the current session
    const trackingAllowed = shouldTrack(isAdmin.current, pathname);

    const track = useCallback(
        (eventType: EventType, eventName: string, properties: Record<string, string | number | boolean | string[] | number[] | null> = {}) => {
            // Guard: only track real customer events on public pages
            if (!trackingAllowed) return;
            trackerRef.current?.track(eventType, eventName, properties);
        }, [trackingAllowed],
    );

    const trackSearch = useCallback((query: string, resultsCount: number) => {
        if (!trackingAllowed) return;
        trackerRef.current?.trackSearch(query, resultsCount);
    }, [trackingAllowed]);

    const trackProductView = useCallback(
        (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => {
            if (!trackingAllowed) return;
            trackerRef.current?.trackProductView(productId, productData);
        }, [trackingAllowed],
    );

    const trackAddToCart = useCallback(
        (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => {
            if (!trackingAllowed) return;
            trackerRef.current?.trackAddToCart(productId, productData);
        }, [trackingAllowed],
    );

    const trackRemoveFromCart = useCallback(
        (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => {
            if (!trackingAllowed) return;
            trackerRef.current?.trackRemoveFromCart(productId, productData);
        }, [trackingAllowed],
    );

    const trackCheckoutStart = useCallback(
        (data: Record<string, string | number | boolean | string[] | number[] | null>) => {
            if (!trackingAllowed) return;
            trackerRef.current?.trackCheckoutStart(data);
        }, [trackingAllowed],
    );

    const trackCheckoutComplete = useCallback(
        (data: Record<string, string | number | boolean | string[] | number[] | null>) => {
            if (!trackingAllowed) return;
            trackerRef.current?.trackCheckoutComplete(data);
        }, [trackingAllowed],
    );

    const trackPurchase = useCallback(
        (data: Record<string, string | number | boolean | string[] | number[] | null>) => {
            if (!trackingAllowed) return;
            trackerRef.current?.trackPurchase(data);
        }, [trackingAllowed],
    );

    const trackWishlistAdd = useCallback(
        (productId: string, productData: Record<string, string | number | boolean | string[] | number[] | null>) => {
            if (!trackingAllowed) return;
            trackerRef.current?.trackWishlistAdd(productId, productData);
        }, [trackingAllowed],
    );

    const trackWishlistRemove = useCallback((productId: string) => {
        if (!trackingAllowed) return;
        trackerRef.current?.trackWishlistRemove(productId);
    }, [trackingAllowed]);

    const trackClick = useCallback(
        (elementName: string, elementType: string, additionalData: Record<string, string | number | boolean | string[] | number[] | null> = {}) => {
            if (!trackingAllowed) return;
            trackerRef.current?.trackClick(elementName, elementType, additionalData);
        }, [trackingAllowed],
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
