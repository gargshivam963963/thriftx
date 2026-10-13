/**
 * THRIFTX — Analytics API Response Types
 * Centralized types for the `/api/analytics` route responses used by the
 * admin analytics dashboard. Keeps the dashboard type-safe (no `any`).
 */

export interface AnalyticsOverview {
  range: string;
  totalEvents: number;
  totalSessions: number;
  pageViews: number;
  productViews: number;
  searches: number;
  addToCarts: number;
  purchases: number;
  clicks: number;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  conversionRate: number;
  cartToPurchase: number;
  bounceRate: number;
  /** Mean session duration across the range, in seconds. */
  avgSessionDuration: number;
  /** Sum of all session durations in the range, in seconds. */
  totalTimeOnSite: number;
}

export interface TrafficSourcePoint {
  source: string;
  visits: number;
  percentage: number;
}

export interface TopPage {
  page: string;
  views: number;
  uniqueSessions: number;
}

export interface SearchQueryPoint {
  query: string;
  count: number;
  noResults: number;
  hasResultsRate: number;
}

export interface ProductFunnelPoint {
  productId: string;
  views: number;
  cartAdds: number;
  purchases: number;
  viewToCart: number;
  cartToPurchase: number;
}

export interface DevicePoint {
  type: "mobile" | "tablet" | "desktop";
  count: number;
  percentage: number;
}

export interface TimelinePoint {
  date: string;
  pageViews: number;
  productViews: number;
  addToCarts: number;
  purchases: number;
}

/** Per-visitor identity row shown on the analytics "Visitors" table. */
export interface VisitorRow {
  /** Grouping key: userId (identified), v-<visitorId> (browser), anon-… (legacy). */
  id: string;
  /** Authenticated user id, or null for anonymous visitors. */
  userId: string | null;
  /** Registered account name, or null for anonymous visitors. */
  name: string | null;
  /** Registered account email, or null for anonymous visitors. */
  email: string | null;
  /** Friendly row label: name, email, or "Visitor #XXXX" for anonymous. */
  displayName: string;
  /** "City, State" from the visitor's saved address (identified only). */
  location: string | null;
  identified: boolean;
  sessions: number;
  events: number;
  pageViews: number;
  /** Total time on site across the visitor's sessions, in seconds. */
  timeOnSite: number;
  /** Traffic source of the visitor's first page view (utm/referrer). */
  source: string;
  /** Epoch ms of the visitor's first event in range. */
  firstSeen: number;
  /** Epoch ms of the visitor's most recent event in range. */
  lastSeen: number;
}

export interface AnalyticsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** A page the visitor viewed, with view count. */
export interface VisitorPage {
  page: string;
  views: number;
}

/** A search the visitor ran. */
export interface VisitorSearch {
  query: string;
  timestamp: number;
  noResults: boolean;
}

/** A product the visitor interacted with. */
export interface VisitorProduct {
  productId: string;
  name: string | null;
  views: number;
  cartAdds: number;
  wishlistAdds: number;
}

/** One entry in the visitor's chronological journey feed. */
export interface VisitorTimelineEntry {
  timestamp: number;
  eventType: string;
  eventName: string;
  page: string;
  summary: string;
}

/** Full per-visitor activity profile (visitor-detail action). */
export interface VisitorDetail {
  id: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  displayName: string;
  identified: boolean;
  location: string | null;
  sessions: number;
  events: number;
  pageViews: number;
  timeOnSite: number;
  source: string;
  device: string;
  browser: string;
  os: string;
  firstSeen: number;
  lastSeen: number;
  pages: VisitorPage[];
  searches: VisitorSearch[];
  products: VisitorProduct[];
  timeline: VisitorTimelineEntry[];
}
