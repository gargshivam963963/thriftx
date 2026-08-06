// ─────────────────────────────────────────────────────────────────────────────
// Marketing Suite — Shared Types
// Coupons, Offers (BOGO/BXGY), Announcements, Sales, Referrals, Credits
// ─────────────────────────────────────────────────────────────────────────────

export type DiscountType = "flat" | "percent";

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number; // ₹ amount for flat, % for percent
  minOrderValue: number; // min subtotal required
  maxDiscount?: number; // cap for percent-based discounts
  expiresAt?: string; // ISO date; undefined = never
  usageLimit?: number; // total redemption limit; undefined = unlimited
  usedCount: number;
  description?: string;
  isActive: boolean;
  $createdAt?: string;
}

export type OfferType = "bogo" | "bundle" | "threshold";

export interface Offer {
  id: string;
  title: string;
  type: OfferType;
  description?: string;
  // BOGO: buy N get M free (apply to nth cheapest)
  buyQuantity: number;
  getQuantity: number;
  // Bundle: minQuantity items → discount
  minQuantity?: number;
  bundleDiscountType?: DiscountType;
  bundleDiscountValue?: number;
  // Threshold: spend X → reward
  thresholdAmount?: number;
  rewardValue?: number;
  rewardType?: "percent" | "flat";
  // Targeting
  category?: string; // restrict to category slug/name
  brand?: string; // restrict to brand
  // Lifecycle
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  priority: number;
  $createdAt?: string;
}

export interface Announcement {
  id: string;
  message: string;
  linkHref?: string;
  linkLabel?: string;
  bgColor?: string; // tailwind gradient classes
  isActive: boolean;
  priority: number;
  startsAt?: string;
  endsAt?: string;
  $createdAt?: string;
}

export interface SaleEvent {
  id: string;
  title: string;
  subtitle?: string;
  couponCode?: string; // code to auto-apply / surface during sale
  discountLabel?: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  $createdAt?: string;
}

export type ReferralStatus = "pending" | "completed" | "void";

export interface Referral {
  id: string;
  referrerUserId: string;
  referrerName?: string;
  code: string; // unique short code, e.g. THRIFTX-ABC123
  referredEmail?: string;
  referredUserId?: string;
  orderId?: string;
  rewardAmount: number;
  status: ReferralStatus;
  $createdAt?: string;
  completedAt?: string;
}

export interface CreditEntry {
  id: string;
  userId: string;
  amount: number; // positive = credit, negative = debit
  reason: string; // e.g. "Referral reward", "Order applied"
  orderId?: string;
  createdAt: string;
}

export interface WalletBalance {
  userId: string;
  balance: number; // sum of all credit entries
  entries: CreditEntry[];
}
