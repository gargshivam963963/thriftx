// ─── Event Types ───────────────────────────────────────────────────────────────

export type EventType =
  | "page_view"
  | "product_view"
  | "product_view_duration"
  | "search"
  | "search_no_results"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_start"
  | "checkout_complete"
  | "purchase"
  | "wishlist_add"
  | "wishlist_remove"
  | "scroll_depth"
  | "click"
  | "session_start"
  | "session_end"
  | "form_submit"
  | "share"
  | "referral_click";

export type DeviceType = "mobile" | "tablet" | "desktop";

export type TrafficSource =
  | "instagram"
  | "google"
  | "facebook"
  | "whatsapp"
  | "direct"
  | "referral"
  | "email"
  | "twitter"
  | "youtube"
  | "other";

export type FunnelStep =
  | "landing"
  | "category"
  | "product"
  | "cart"
  | "checkout"
  | "payment"
  | "success";

export type CartStatus = "active" | "abandoned" | "recovered" | "converted";

export type AlertType =
  | "new_order"
  | "checkout_reached"
  | "high_traffic"
  | "low_inventory";

// ─── Core Event Payload ─────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  eventType: EventType;
  eventName: string;
  properties: Record<
    string,
    string | number | boolean | string[] | number[] | null
  >;
  page: string;
  referrer?: string;
  sessionId: string;
  timestamp: number;
}

// ─── Enriched Event (server-side) ──────────────────────────────────────────────

export interface EnrichedAnalyticsEvent extends AnalyticsEvent {
  userId?: string;
  device: {
    type: DeviceType;
    browser: string;
    os: string;
    userAgent: string;
  };
  geo: {
    country: string;
    city: string;
    region: string;
    ip: string;
    latitude?: number;
    longitude?: number;
  };
  utm: {
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
  };
  source: TrafficSource;
}

// ─── Session ────────────────────────────────────────────────────────────────────

export interface AnalyticsSession {
  sessionId: string;
  userId?: string;
  sessionStart: number;
  sessionEnd?: number;
  duration: number;
  pages: string[];
  pageCount: number;
  entryPage: string;
  exitPage: string;
  device: { type: DeviceType; browser: string; os: string };
  geo: { country: string; city: string; region: string };
  trafficSource: TrafficSource;
  bounced: boolean;
  scrollDepth: number;
  events: number;
  timestamp: number;
}

// ─── Product Analytics ──────────────────────────────────────────────────────────

export interface ProductAnalytics {
  productId: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  views: number;
  uniqueViews: number;
  wishlistCount: number;
  cartAdds: number;
  cartRemoves: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  avgViewTime: number;
  daily: { date: string; views: number; revenue: number; purchases: number }[];
}

// ─── Search Analytics ───────────────────────────────────────────────────────────

export interface SearchAnalytics {
  query: string;
  resultsCount: number;
  hasResults: boolean;
  userId?: string;
  sessionId: string;
  timestamp: number;
}

export interface SearchAggregation {
  query: string;
  count: number;
  noResultsCount: number;
  lastSearched: number;
}

// ─── Cart Analytics ─────────────────────────────────────────────────────────────

export interface CartAnalytics {
  sessionId: string;
  userId?: string;
  status: CartStatus;
  itemsCount: number;
  totalValue: number;
  products: string[];
  events: CartEvent[];
  createdAt: number;
  convertedAt?: number;
}

export interface CartEvent {
  type: "add" | "remove";
  productId: string;
  productTitle: string;
  price: number;
  timestamp: number;
}

// ─── Traffic Source ─────────────────────────────────────────────────────────────

export interface TrafficSourceData {
  source: TrafficSource;
  date: string;
  visits: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgDuration: number;
  conversions: number;
  revenue: number;
}

// ─── Funnel ─────────────────────────────────────────────────────────────────────

export interface FunnelData {
  step: FunnelStep;
  label: string;
  count: number;
  percentage: number;
  dropoff: number;
  dropoffPercentage: number;
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────────

export interface LiveVisitor {
  sessionId: string;
  userId?: string;
  userName?: string;
  currentPage: string;
  entryPage: string;
  device: string;
  browser: string;
  country: string;
  city: string;
  duration: number;
  isNew: boolean;
  isLoggedIn: boolean;
  lastActivity: number;
}

export interface AnalyticsDashboardStats {
  liveVisitors: number;
  activeSessions: number;
  todayVisits: number;
  todayUniqueVisitors: number;
  todayRevenue: number;
  todayOrders: number;
  todayConversionRate: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: { page: string; views: number }[];
  topSources: { source: TrafficSource; visits: number }[];
  revenueToday: number[];
  revenueWeek: number[];
  revenueMonth: number[];
  visitorsToday: number[];
  visitorsWeek: number[];
  visitorsMonth: number[];
}

export interface AdminAlert {
  $id?: string;
  type: AlertType;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: number;
}

// ─── Batch ──────────────────────────────────────────────────────────────────────

export interface AnalyticsEventBatch {
  events: AnalyticsEvent[];
  sessionId: string;
  timestamp: number;
}

// ─── Date Range ─────────────────────────────────────────────────────────────────

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "1y"
  | "custom";

export interface DateRange {
  preset: DateRangePreset;
  start: Date;
  end: Date;
  label: string;
}
