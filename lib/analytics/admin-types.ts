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
  conversionRate: number;
  cartToPurchase: number;
  bounceRate: number;
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

export interface AnalyticsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
