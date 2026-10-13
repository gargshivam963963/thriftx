"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import type { EventType } from "./types";
import { initTracker, getTracker } from "./tracker";
import { shouldTrack } from "./utils";
import { isExcludedEmail } from "./excluded";
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
    // NOTE: we deliberately avoid `useSearchParams()` here — it suspends and,
    // because this provider wraps the whole app, it forced every static page
    // (incl. the homepage) to bail out of SSR to client-side rendering
    // (empty initial HTML → bad SEO + blank first paint). Search params are
    // read client-side instead: pageview tracking only ever runs in effects.
    const [search, setSearch] = useState("");
    const { user } = useAuth();
    const trackerRef = useRef<ReturnType<typeof getTracker> | null>(null);
    const prevPathRef = useRef<string>("");
    const [isReady, setIsReady] = useState(false);

    // Exclude the owner's own traffic two ways: by role (admin) AND by email.
    // Email matters because `useAuth()` returns `user: null` on the very first
    // render (before the session loads), so role alone misses the initial
    // pageviews. The server-side batch route enforces this authoritatively too.
    const isAdminUser = user?.role === "admin" || isExcludedEmail(user?.email);

    // App Router dispatches popstate on push/replace too, so this stays in
    // sync with client-side ?query changes as well as back/forward.
    useEffect(() => {
        const sync = () => setSearch(window.location.search);
        sync();
        window.addEventListener("popstate", sync);
        return () => window.removeEventListener("popstate", sync);
    }, []);

    useEffect(() => {
        const tracker = initTracker({
            enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false",
            flushInterval: 5000,
            batchSize: 50,
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
        if (!shouldTrack(isAdminUser, pathname)) {
            return;
        }

        const searchQuery = search ? search.replace(/^\?/, "") : "";
        const currentPath = pathname + (searchQuery ? `?${searchQuery}` : "");
        if (currentPath !== prevPathRef.current) {
            prevPathRef.current = currentPath;
            trackerRef.current.trackPageView();
        }
    }, [pathname, search, isAdminUser, isReady]);

    useEffect(() => {
        if (
            !trackerRef.current ||
            !isReady ||
            !shouldTrack(isAdminUser, pathname)
        ) return;
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
    }, [isAdminUser, isReady, pathname]);

    // Whether tracking is allowed for the current session
    const trackingAllowed = shouldTrack(isAdminUser, pathname);

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
