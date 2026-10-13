import type { EventType, AnalyticsEvent } from "./types";
import {
  getSessionId,
  getVisitorId,
  detectDevice,
  getPagePath,
  getReferrer,
  getUTMParams,
} from "./utils";
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
  /**
   * Liveness ping. Keeps the server-side session's lastActivity (and thus
   * "time on site") fresh while the visitor reads a page without clicking.
   */
  trackHeartbeat: () => void;
  destroy: () => void;
}

export function initTracker(options: TrackerOptions): Tracker {
  const { enabled, batchSize } = options;
  let flushTimer: ReturnType<typeof setInterval> | null = null;
  let lastScrollMilestone = 0;

  function buildEvent(
    eventType: EventType,
    eventName: string,
    properties: AnalyticsProperties = {},
  ): AnalyticsEvent {
    // Persist attribution context with every event so campaign clicks
    // (Instagram ads, WhatsApp blasts, newsletters) stay measurable even
    // when the referrer is stripped or the visit is same-origin.
    const utm = getUTMParams();
    const device = detectDevice();

    const enrichedProperties: AnalyticsProperties = {
      ...properties,
      device_type: device.type,
      ...(utm.source
        ? {
            utm_source: utm.source,
            utm_medium: utm.medium,
            utm_campaign: utm.campaign,
            utm_term: utm.term,
            utm_content: utm.content,
          }
        : {}),
    };

    const event: AnalyticsEvent = {
      eventType,
      eventName,
      properties: enrichedProperties,
      page: getPagePath(),
      referrer: getReferrer(),
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      timestamp: Date.now(),
    };

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
        // Include the top-level sessionId so the server can maintain the
        // analytics-sessions heartbeat (Sessions metric). Individual events
        // also carry their own sessionId as a fallback.
        body: JSON.stringify({
          events: payload,
          sessionId: getSessionId(),
          visitorId: getVisitorId(),
        }),
      });

      if (res.ok) {
        removeBatch(ids);
      } else {
        incrementRetries(ids);
      }
    } catch {
      incrementRetries(ids);
    }
  }

  flushTimer = setInterval(flush, FLUSH_INTERVAL);

  // Flush queued events the moment the tab is hidden/closed so the last
  // interactions (and the final heartbeat) aren't lost to the 5s interval.
  const handlePageHide = () => {
    flush().catch(() => {});
  };
  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", handlePageHide);
  }

  function destroy(): void {
    if (flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("pagehide", handlePageHide);
    }
    flush().catch(() => {});
  }

  const tracker: Tracker = {
    track(eventType, eventName, properties = {}) {
      enqueue(buildEvent(eventType, eventName, properties));
    },

    trackPageView() {
      lastScrollMilestone = 0;
      enqueue(buildEvent("page_view", "Page View", { url: getPagePath() }));
    },

    trackScroll() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const depth = Math.round((window.scrollY / scrollableHeight) * 100);
      const milestone = Math.floor(depth / 25) * 25;
      if (milestone <= lastScrollMilestone || milestone === 0) return;

      lastScrollMilestone = milestone;
      enqueue(buildEvent("scroll_depth", "Scroll Depth", { depth: milestone }));
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

    trackHeartbeat() {
      // Server derives "time on site" from session lastActivity; heartbeats
      // keep it ticking while the visitor is idle-but-present. They are
      // excluded from all dashboard metrics server-side.
      enqueue(buildEvent("heartbeat", "Heartbeat"));
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
