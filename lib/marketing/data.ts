import {
  documentStore,
  DocumentQuery,
  isDocumentStoreConfigured,
} from "@/lib/document-store";
import type {
  Coupon,
  Offer,
  Announcement,
  SaleEvent,
  Referral,
  CreditEntry,
  WalletBalance,
} from "./types";

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

function normalizeCoupon(doc: Record<string, any>): Coupon {
  return {
    id: String(doc.id ?? doc.$id ?? ""),
    code: String(doc.code ?? ""),
    discountType: (doc.discountType as Coupon["discountType"]) ?? "flat",
    discountValue: Number(doc.discountValue ?? 0),
    minOrderValue: Number(doc.minOrderValue ?? 0),
    maxDiscount: doc.maxDiscount != null ? Number(doc.maxDiscount) : undefined,
    expiresAt: (doc.expiresAt as string) ?? undefined,
    usageLimit: doc.usageLimit != null ? Number(doc.usageLimit) : undefined,
    usedCount: Number(doc.usedCount ?? 0),
    description: (doc.description as string) ?? "",
    isActive: doc.isActive !== false,
    $createdAt: String(doc.$createdAt ?? ""),
  };
}

function normalizeOffer(doc: Record<string, any>): Offer {
  return {
    id: String(doc.id ?? doc.$id ?? ""),
    title: String(doc.title ?? ""),
    type: (doc.type as Offer["type"]) ?? "bundle",
    description: String(doc.description ?? ""),
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
    $createdAt: String(doc.$createdAt ?? ""),
  };
}

function normalizeAnnouncement(doc: Record<string, any>): Announcement {
  return {
    id: String(doc.id ?? doc.$id ?? ""),
    message: String(doc.message ?? ""),
    linkHref: (doc.linkHref as string) ?? undefined,
    linkLabel: (doc.linkLabel as string) ?? undefined,
    bgColor: (doc.bgColor as string) ?? "bg-neutral-900",
    isActive: doc.isActive !== false,
    priority: Number(doc.priority ?? 0),
    startsAt: (doc.startsAt as string) ?? undefined,
    endsAt: (doc.endsAt as string) ?? undefined,
    $createdAt: String(doc.$createdAt ?? ""),
  };
}

function normalizeSale(doc: Record<string, any>): SaleEvent {
  return {
    id: String(doc.id ?? doc.$id ?? ""),
    title: String(doc.title ?? ""),
    subtitle: String(doc.subtitle ?? ""),
    couponCode: (doc.couponCode as string) ?? undefined,
    discountLabel: String(doc.discountLabel ?? ""),
    startsAt: String(doc.startsAt ?? new Date().toISOString()),
    endsAt: String(doc.endsAt ?? new Date().toISOString()),
    isActive: doc.isActive !== false,
    $createdAt: String(doc.$createdAt ?? ""),
  };
}

function normalizeReferral(doc: Record<string, any>): Referral {
  return {
    id: String(doc.id ?? doc.$id ?? ""),
    referrerUserId: String(doc.referrerUserId ?? ""),
    referrerName: String(doc.referrerName ?? ""),
    code: String(doc.code ?? ""),
    referredEmail: String(doc.referredEmail ?? ""),
    referredUserId: String(doc.referredUserId ?? ""),
    orderId: String(doc.orderId ?? ""),
    rewardAmount: Number(doc.rewardAmount ?? 0),
    status: (doc.status as Referral["status"]) ?? "pending",
    $createdAt: String(doc.$createdAt ?? ""),
    completedAt: String(doc.completedAt ?? ""),
  };
}

function normalizeCredit(doc: Record<string, any>): CreditEntry {
  return {
    id: String(doc.id ?? doc.$id ?? ""),
    userId: String(doc.userId ?? ""),
    amount: Number(doc.amount ?? 0),
    reason: String(doc.reason ?? ""),
    orderId: (doc.orderId as string) ?? undefined,
    createdAt: String(doc.$createdAt ?? new Date().toISOString()),
  };
}

async function fetchCollection<T>(
  collection: string,
  fallback: T[],
): Promise<T[]> {
  if (!isDocumentStoreConfigured) return fallback;
  try {
    const { documents } = await documentStore.listDocuments(
      "thriftx",
      collection,
      [DocumentQuery.orderDesc("$createdAt")],
    );
    return documents.map((document) => document as unknown as T);
  } catch {
    return fallback;
  }
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const items = await fetchCollection<Coupon>("coupons", FALLBACK_COUPONS);
  return items.length ? items : FALLBACK_COUPONS;
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
  return fetchCollection<Offer>("offers", FALLBACK_OFFERS);
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
  return fetchCollection<Announcement>("announcements", FALLBACK_ANNOUNCEMENTS);
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
  return fetchCollection<SaleEvent>("sales", FALLBACK_SALES);
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
  if (!userId || !isDocumentStoreConfigured) return FALLBACK_REFERRALS;
  try {
    const { documents } = await documentStore.listDocuments(
      "thriftx",
      "referrals",
      [DocumentQuery.equal("referrerUserId", userId), DocumentQuery.limit(200)],
    );
    return documents.map(normalizeReferral);
  } catch {
    return FALLBACK_REFERRALS;
  }
}

export async function fetchCreditsByUser(
  userId: string,
): Promise<CreditEntry[]> {
  if (!userId || !isDocumentStoreConfigured) return FALLBACK_CREDITS;
  try {
    const { documents } = await documentStore.listDocuments(
      "thriftx",
      "credits",
      [
        DocumentQuery.equal("userId", userId),
        DocumentQuery.orderDesc("$createdAt"),
        DocumentQuery.limit(200),
      ],
    );
    return documents.map(normalizeCredit);
  } catch {
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
