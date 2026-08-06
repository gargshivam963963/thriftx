import {
  databases,
  AppwriteQuery,
  APPWRITE_DATABASE_ID,
  APPWRITE_COUPONS_COLLECTION_ID,
  APPWRITE_OFFERS_COLLECTION_ID,
  APPWRITE_ANNOUNCEMENTS_COLLECTION_ID,
  APPWRITE_SALES_COLLECTION_ID,
  APPWRITE_REFERRALS_COLLECTION_ID,
  APPWRITE_CREDITS_COLLECTION_ID,
  isAppwriteDataConfigured,
} from "@/lib/appwrite";
import type {
  Coupon,
  Offer,
  Announcement,
  SaleEvent,
  Referral,
  CreditEntry,
  WalletBalance,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Fallback data (used when Appwrite is not configured, so the UI still works)
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_COUPONS: Coupon[] = [
  {
    id: "c-welcome10",
    code: "WELCOME10",
    discountType: "flat",
    discountValue: 100,
    minOrderValue: 499,
    maxDiscount: 100,
    usedCount: 0,
    description: "₹100 off on your first order (min ₹499)",
    isActive: true,
  },
  {
    id: "c-save200",
    code: "SAVE200",
    discountType: "flat",
    discountValue: 200,
    minOrderValue: 999,
    maxDiscount: 200,
    usedCount: 0,
    description: "₹200 off on orders above ₹999",
    isActive: true,
  },
  {
    id: "c-thrift15",
    code: "THRIFT15",
    discountType: "percent",
    discountValue: 15,
    minOrderValue: 799,
    maxDiscount: 400,
    usedCount: 0,
    description: "15% off up to ₹400 (min ₹799)",
    isActive: true,
  },
];

const FALLBACK_OFFERS: Offer[] = [
  {
    id: "o-bogo-tshirts",
    title: "Buy 2 Get 1 Free — T-Shirts",
    type: "bogo",
    description: "Add any 3 T-Shirts to cart, the cheapest one is FREE.",
    buyQuantity: 2,
    getQuantity: 1,
    category: "T-Shirts",
    isActive: true,
    priority: 10,
  },
  {
    id: "o-bundle-shirts",
    title: "Buy 2 Shirts — 10% Off",
    type: "bundle",
    description: "Add 2 shirts to cart and get 10% off them.",
    buyQuantity: 2,
    getQuantity: 0,
    minQuantity: 2,
    bundleDiscountType: "percent",
    bundleDiscountValue: 10,
    category: "Shirts",
    isActive: true,
    priority: 5,
  },
];

const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a-1",
    message: "FLAT ₹200 OFF ABOVE ₹999 — USE CODE: SAVE200",
    linkHref: "/shop",
    linkLabel: "Shop Now",
    bgColor: "bg-neutral-900",
    isActive: true,
    priority: 1,
  },
  {
    id: "a-2",
    message: "FREE SAME-DAY DELIVERY IN PANIPAT ON ORDERS BEFORE 2 PM 🚀",
    isActive: true,
    priority: 2,
  },
];

const FALLBACK_SALES: SaleEvent[] = [
  {
    id: "s-1",
    title: "WEEKEND MEGA SALE",
    subtitle: "Up to 50% OFF on premium thrift picks",
    couponCode: "MEGA50",
    discountLabel: "UP TO 50% OFF",
    startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    isActive: true,
  },
];

const FALLBACK_REFERRALS: Referral[] = [];
const FALLBACK_CREDITS: CreditEntry[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// Normalizers (Appwrite doc → typed objects)
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeCoupon(doc: Record<string, any>): Coupon {
  return {
    id: (doc.$id as string) ?? "",
    code: (doc.code as string) ?? "",
    discountType: (doc.discountType as Coupon["discountType"]) ?? "flat",
    discountValue: Number(doc.discountValue ?? 0),
    minOrderValue: Number(doc.minOrderValue ?? 0),
    maxDiscount: doc.maxDiscount != null ? Number(doc.maxDiscount) : undefined,
    expiresAt: (doc.expiresAt as string) ?? undefined,
    usageLimit: doc.usageLimit != null ? Number(doc.usageLimit) : undefined,
    usedCount: Number(doc.usedCount ?? 0),
    description: (doc.description as string) ?? "",
    isActive: doc.isActive !== false,
    $createdAt: (doc.$createdAt as string) ?? "",
  };
}

export function normalizeOffer(doc: Record<string, any>): Offer {
  return {
    id: (doc.$id as string) ?? "",
    title: (doc.title as string) ?? "",
    type: (doc.type as Offer["type"]) ?? "bundle",
    description: (doc.description as string) ?? "",
    buyQuantity: Number(doc.buyQuantity ?? 0),
    getQuantity: Number(doc.getQuantity ?? 0),
    minQuantity: doc.minQuantity != null ? Number(doc.minQuantity) : undefined,
    bundleDiscountType:
      (doc.bundleDiscountType as Offer["bundleDiscountType"]) ?? undefined,
    bundleDiscountValue:
      doc.bundleDiscountValue != null
        ? Number(doc.bundleDiscountValue)
        : undefined,
    thresholdAmount:
      doc.thresholdAmount != null ? Number(doc.thresholdAmount) : undefined,
    rewardValue: doc.rewardValue != null ? Number(doc.rewardValue) : undefined,
    rewardType: (doc.rewardType as Offer["rewardType"]) ?? "percent",
    category: (doc.category as string) ?? undefined,
    brand: (doc.brand as string) ?? undefined,
    startsAt: (doc.startsAt as string) ?? undefined,
    endsAt: (doc.endsAt as string) ?? undefined,
    isActive: doc.isActive !== false,
    priority: Number(doc.priority ?? 0),
    $createdAt: (doc.$createdAt as string) ?? "",
  };
}

export function normalizeAnnouncement(doc: Record<string, any>): Announcement {
  return {
    id: (doc.$id as string) ?? "",
    message: (doc.message as string) ?? "",
    linkHref: (doc.linkHref as string) ?? undefined,
    linkLabel: (doc.linkLabel as string) ?? undefined,
    bgColor: (doc.bgColor as string) ?? "bg-neutral-900",
    isActive: doc.isActive !== false,
    priority: Number(doc.priority ?? 0),
    startsAt: (doc.startsAt as string) ?? undefined,
    endsAt: (doc.endsAt as string) ?? undefined,
    $createdAt: (doc.$createdAt as string) ?? "",
  };
}

export function normalizeSale(doc: Record<string, any>): SaleEvent {
  return {
    id: (doc.$id as string) ?? "",
    title: (doc.title as string) ?? "",
    subtitle: (doc.subtitle as string) ?? "",
    couponCode: (doc.couponCode as string) ?? undefined,
    discountLabel: (doc.discountLabel as string) ?? "",
    startsAt: (doc.startsAt as string) ?? new Date().toISOString(),
    endsAt: (doc.endsAt as string) ?? new Date().toISOString(),
    isActive: doc.isActive !== false,
    $createdAt: (doc.$createdAt as string) ?? "",
  };
}

export function normalizeReferral(doc: Record<string, any>): Referral {
  return {
    id: (doc.$id as string) ?? "",
    referrerUserId: (doc.referrerUserId as string) ?? "",
    referrerName: (doc.referrerName as string) ?? "",
    code: (doc.code as string) ?? "",
    referredEmail: (doc.referredEmail as string) ?? "",
    referredUserId: (doc.referredUserId as string) ?? "",
    orderId: (doc.orderId as string) ?? "",
    rewardAmount: Number(doc.rewardAmount ?? 0),
    status: (doc.status as Referral["status"]) ?? "pending",
    $createdAt: (doc.$createdAt as string) ?? "",
    completedAt: (doc.completedAt as string) ?? "",
  };
}

export function normalizeCredit(doc: Record<string, any>): CreditEntry {
  return {
    id: (doc.$id as string) ?? "",
    userId: (doc.userId as string) ?? "",
    amount: Number(doc.amount ?? 0),
    reason: (doc.reason as string) ?? "",
    orderId: (doc.orderId as string) ?? undefined,
    createdAt: (doc.$createdAt as string) ?? new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Query helpers with graceful fallback
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchCoupons(): Promise<Coupon[]> {
  if (!isAppwriteDataConfigured || !APPWRITE_COUPONS_COLLECTION_ID) {
    return FALLBACK_COUPONS;
  }
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COUPONS_COLLECTION_ID,
      [AppwriteQuery.limit(200)],
    );
    return res.documents.map(normalizeCoupon);
  } catch (error) {
    console.error("fetchCoupons fallback:", error);
    return FALLBACK_COUPONS;
  }
}

export async function fetchActiveCoupons(): Promise<Coupon[]> {
  const all = await fetchCoupons();
  const now = new Date();
  return all.filter((c) => {
    if (!c.isActive) return false;
    if (c.expiresAt && new Date(c.expiresAt) < now) return false;
    if (c.usageLimit != null && c.usedCount >= c.usageLimit) return false;
    return true;
  });
}

export async function fetchOffers(): Promise<Offer[]> {
  if (!isAppwriteDataConfigured || !APPWRITE_OFFERS_COLLECTION_ID) {
    return FALLBACK_OFFERS;
  }
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_OFFERS_COLLECTION_ID,
      [AppwriteQuery.limit(200)],
    );
    return res.documents.map(normalizeOffer);
  } catch (error) {
    console.error("fetchOffers fallback:", error);
    return FALLBACK_OFFERS;
  }
}

export async function fetchActiveOffers(): Promise<Offer[]> {
  const all = await fetchOffers();
  const now = new Date();
  return all.filter((o) => {
    if (!o.isActive) return false;
    if (o.startsAt && new Date(o.startsAt) > now) return false;
    if (o.endsAt && new Date(o.endsAt) < now) return false;
    return true;
  });
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  if (!isAppwriteDataConfigured || !APPWRITE_ANNOUNCEMENTS_COLLECTION_ID) {
    return FALLBACK_ANNOUNCEMENTS;
  }
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_ANNOUNCEMENTS_COLLECTION_ID,
      [AppwriteQuery.orderAsc("priority"), AppwriteQuery.limit(50)],
    );
    return res.documents.map(normalizeAnnouncement);
  } catch (error) {
    console.error("fetchAnnouncements fallback:", error);
    return FALLBACK_ANNOUNCEMENTS;
  }
}

export async function fetchActiveAnnouncements(): Promise<Announcement[]> {
  const all = await fetchAnnouncements();
  const now = new Date();
  return all.filter((a) => {
    if (!a.isActive) return false;
    if (a.startsAt && new Date(a.startsAt) > now) return false;
    if (a.endsAt && new Date(a.endsAt) < now) return false;
    return true;
  });
}

export async function fetchSales(): Promise<SaleEvent[]> {
  if (!isAppwriteDataConfigured || !APPWRITE_SALES_COLLECTION_ID) {
    return FALLBACK_SALES;
  }
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_SALES_COLLECTION_ID,
      [AppwriteQuery.limit(100)],
    );
    return res.documents.map(normalizeSale);
  } catch (error) {
    console.error("fetchSales fallback:", error);
    return FALLBACK_SALES;
  }
}

export async function fetchActiveSales(): Promise<SaleEvent[]> {
  const all = await fetchSales();
  const now = new Date();
  return all.filter((s) => {
    if (!s.isActive) return false;
    const start = new Date(s.startsAt);
    const end = new Date(s.endsAt);
    return start <= now && end >= now;
  });
}

export async function fetchReferralsByUser(
  userId: string,
): Promise<Referral[]> {
  if (
    !isAppwriteDataConfigured ||
    !APPWRITE_REFERRALS_COLLECTION_ID ||
    !userId
  ) {
    return FALLBACK_REFERRALS;
  }
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_REFERRALS_COLLECTION_ID,
      [AppwriteQuery.equal("referrerUserId", userId), AppwriteQuery.limit(200)],
    );
    return res.documents.map(normalizeReferral);
  } catch (error) {
    console.error("fetchReferralsByUser fallback:", error);
    return FALLBACK_REFERRALS;
  }
}

export async function fetchCreditsByUser(
  userId: string,
): Promise<CreditEntry[]> {
  if (!isAppwriteDataConfigured || !APPWRITE_CREDITS_COLLECTION_ID || !userId) {
    return FALLBACK_CREDITS;
  }
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_CREDITS_COLLECTION_ID,
      [
        AppwriteQuery.equal("userId", userId),
        AppwriteQuery.orderDesc("$createdAt"),
        AppwriteQuery.limit(200),
      ],
    );
    return res.documents.map(normalizeCredit);
  } catch (error) {
    console.error("fetchCreditsByUser fallback:", error);
    return FALLBACK_CREDITS;
  }
}

export async function getWalletBalance(userId: string): Promise<WalletBalance> {
  const entries = await fetchCreditsByUser(userId);
  const balance = entries.reduce((sum, e) => sum + e.amount, 0);
  return { userId, balance, entries };
}

export function makeReferralCode(userId: string): string {
  const suffix = (userId || "GUEST")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toUpperCase();
  return `THRIFTX-${suffix || "GUEST"}`;
}
