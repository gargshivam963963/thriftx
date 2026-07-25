import type { EventType, AnalyticsEvent } from "./types";
import { getSessionId, detectDevice, getPagePath, getReferrer } from "./utils";
import {
  addToQueue,
  getBatch,
  removeBatch,
  incrementRetries,
  FLUSH_INTERVAL,
  MAX_BATCH_SIZE,
} from "./storage";

type AnalyticsProperties = Record<
  string,
  string | number | boolean | string[] | number[] | null
>;

interface TrackerOptions {
  enabled: boolean;
  flushInterval: number;
  batchSize: number;
  debug: boolean;
}

export interface Tracker {
  track: (
    eventType: EventType,
    eventName: string,
    properties?: AnalyticsProperties,
  ) => void;
  trackPageView: () => void;
  trackScroll: () => void;
  trackSearch: (query: string, resultsCount: number) => void;
  trackProductView: (
    productId: string,
    productData: AnalyticsProperties,
  ) => void;
  trackAddToCart: (productId: string, productData: AnalyticsProperties) => void;
  trackRemoveFromCart: (
    productId: string,
    productData: AnalyticsProperties,
  ) => void;
  trackCheckoutStart: (data: AnalyticsProperties) => void;
  trackCheckoutComplete: (data: AnalyticsProperties) => void;
  trackPurchase: (data: AnalyticsProperties) => void;
  trackWishlistAdd: (
    productId: string,
    productData: AnalyticsProperties,
  ) => void;
  trackWishlistRemove: (productId: string) => void;
  trackClick: (
    elementName: string,
    elementType: string,
    additionalData?: AnalyticsProperties,
  ) => void;
  destroy: () => void;
}

export function initTracker(options: TrackerOptions): Tracker {
  const { enabled, debug, batchSize } = options;
  let flushTimer: ReturnType<typeof setInterval> | null = null;

  function buildEvent(
    eventType: EventType,
    eventName: string,
    properties: AnalyticsProperties = {},
  ): AnalyticsEvent {
    const event: AnalyticsEvent = {
      eventType,
      eventName,
      properties,
      page: getPagePath(),
      referrer: getReferrer(),
      sessionId: getSessionId(),
      timestamp: Date.now(),
    };

    if (debug) {
      console.log(`[Analytics] ${eventType}:`, eventName, properties);
    }

    return event;
  }

  function enqueue(event: AnalyticsEvent): void {
    if (!enabled) return;
    addToQueue(event as unknown as Record<string, unknown>);
  }

  async function flush(): Promise<void> {
    if (!enabled) return;
    const batch = getBatch(batchSize);
    if (batch.length === 0) return;

    const ids = batch.map((e) => e.id);
    const payload = batch.map((e) => e.event);

    try {
      const res = await fetch("/api/analytics/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: payload }),
      });

      if (res.ok) {
        removeBatch(ids);
        if (debug) console.log(`[Analytics] Flushed ${ids.length} events`);
      } else {
        incrementRetries(ids);
      }
    } catch {
      incrementRetries(ids);
    }
  }

  flushTimer = setInterval(flush, FLUSH_INTERVAL);

  function destroy(): void {
    if (flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
    flush().catch(() => {});
  }

  const tracker: Tracker = {
    track(eventType, eventName, properties = {}) {
      enqueue(buildEvent(eventType, eventName, properties));
    },

    trackPageView() {
      enqueue(buildEvent("page_view", "Page View", { url: getPagePath() }));
    },

    trackScroll() {
      const depth = Math.round(
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
          100,
      );
      if (depth > 0) {
        enqueue(buildEvent("scroll_depth", "Scroll Depth", { depth }));
      }
    },

    trackSearch(query, resultsCount) {
      enqueue(
        buildEvent(
          resultsCount > 0 ? "search" : "search_no_results",
          "Search",
          {
            query,
            resultsCount,
          },
        ),
      );
    },

    trackProductView(productId, productData) {
      enqueue(
        buildEvent("product_view", "Product View", {
          productId,
          ...productData,
        }),
      );
    },

    trackAddToCart(productId, productData) {
      enqueue(
        buildEvent("add_to_cart", "Add to Cart", { productId, ...productData }),
      );
    },

    trackRemoveFromCart(productId, productData) {
      enqueue(
        buildEvent("remove_from_cart", "Remove from Cart", {
          productId,
          ...productData,
        }),
      );
    },

    trackCheckoutStart(data) {
      enqueue(buildEvent("checkout_start", "Checkout Start", data));
    },

    trackCheckoutComplete(data) {
      enqueue(buildEvent("checkout_complete", "Checkout Complete", data));
    },

    trackPurchase(data) {
      enqueue(buildEvent("purchase", "Purchase", data));
    },

    trackWishlistAdd(productId, productData) {
      enqueue(
        buildEvent("wishlist_add", "Wishlist Add", {
          productId,
          ...productData,
        }),
      );
    },

    trackWishlistRemove(productId) {
      enqueue(buildEvent("wishlist_remove", "Wishlist Remove", { productId }));
    },

    trackClick(elementName, elementType, additionalData = {}) {
      enqueue(
        buildEvent("click", "Click", {
          elementName,
          elementType,
          ...additionalData,
        }),
      );
    },

    destroy,
  };

  return tracker;
}

export function getTracker(): Tracker | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { __analyticsTracker?: Tracker })
      .__analyticsTracker ?? null
  );
}

export function setTracker(tracker: Tracker): void {
  if (typeof window !== "undefined") {
    (window as unknown as { __analyticsTracker?: Tracker }).__analyticsTracker =
      tracker;
  }
}
