import { databases, AppwriteQuery, AppwriteID } from "@/lib/appwrite";
import type { Coupon, Offer, Announcement, SaleEvent } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Server-side admin CRUD helpers for marketing collections.
// These use the client SDK (databases) — intended for use in API routes
// that run with the admin session/key.
// ─────────────────────────────────────────────────────────────────────────────

const COLLECTIONS = {
  coupons: process.env.NEXT_PUBLIC_APPWRITE_COUPONS_COLLECTION_ID || "",
  offers: process.env.NEXT_PUBLIC_APPWRITE_OFFERS_COLLECTION_ID || "",
  announcements:
    process.env.NEXT_PUBLIC_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID || "",
  sales: process.env.NEXT_PUBLIC_APPWRITE_SALES_COLLECTION_ID || "",
};

const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";

function isConfigured(collection: keyof typeof COLLECTIONS) {
  return Boolean(DB && COLLECTIONS[collection]);
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export async function listCoupons(): Promise<Coupon[]> {
  if (!isConfigured("coupons")) return [];
  const res = await databases.listDocuments(DB, COLLECTIONS.coupons, [
    AppwriteQuery.limit(200),
    AppwriteQuery.orderAsc("code"),
  ]);
  return res.documents.map((d: any) => ({
    id: d.$id,
    code: d.code,
    discountType: d.discountType,
    discountValue: Number(d.discountValue),
    minOrderValue: Number(d.minOrderValue),
    maxDiscount: d.maxDiscount != null ? Number(d.maxDiscount) : undefined,
    expiresAt: d.expiresAt || undefined,
    usageLimit: d.usageLimit != null ? Number(d.usageLimit) : undefined,
    usedCount: Number(d.usedCount || 0),
    description: d.description || "",
    isActive: d.isActive !== false,
    $createdAt: d.$createdAt,
  }));
}

export async function createCoupon(data: Partial<Coupon>) {
  if (!isConfigured("coupons"))
    throw new Error("Coupons collection not configured");
  return databases.createDocument(
    DB,
    COLLECTIONS.coupons,
    AppwriteID.unique(),
    {
      code: data.code,
      discountType: data.discountType || "flat",
      discountValue: Number(data.discountValue || 0),
      minOrderValue: Number(data.minOrderValue || 0),
      maxDiscount: data.maxDiscount != null ? Number(data.maxDiscount) : null,
      expiresAt: data.expiresAt || "",
      usageLimit: data.usageLimit != null ? Number(data.usageLimit) : null,
      usedCount: 0,
      description: data.description || "",
      isActive: data.isActive !== false,
    },
  );
}

export async function updateCoupon(id: string, data: Partial<Coupon>) {
  if (!isConfigured("coupons"))
    throw new Error("Coupons collection not configured");
  return databases.updateDocument(DB, COLLECTIONS.coupons, id, {
    code: data.code,
    discountType: data.discountType,
    discountValue:
      data.discountValue != null ? Number(data.discountValue) : undefined,
    minOrderValue:
      data.minOrderValue != null ? Number(data.minOrderValue) : undefined,
    maxDiscount: data.maxDiscount != null ? Number(data.maxDiscount) : null,
    expiresAt: data.expiresAt || "",
    usageLimit: data.usageLimit != null ? Number(data.usageLimit) : null,
    description: data.description,
    isActive: data.isActive,
  });
}

export async function deleteCoupon(id: string) {
  if (!isConfigured("coupons"))
    throw new Error("Coupons collection not configured");
  return databases.deleteDocument(DB, COLLECTIONS.coupons, id);
}

// ─── Offers ──────────────────────────────────────────────────────────────────

export async function listOffers(): Promise<Offer[]> {
  if (!isConfigured("offers")) return [];
  const res = await databases.listDocuments(DB, COLLECTIONS.offers, [
    AppwriteQuery.limit(200),
    AppwriteQuery.orderAsc("priority"),
  ]);
  return res.documents.map((d: any) => ({
    id: d.$id,
    title: d.title,
    type: d.type,
    description: d.description || "",
    buyQuantity: Number(d.buyQuantity || 0),
    getQuantity: Number(d.getQuantity || 0),
    minQuantity: d.minQuantity != null ? Number(d.minQuantity) : undefined,
    bundleDiscountType: d.bundleDiscountType || undefined,
    bundleDiscountValue:
      d.bundleDiscountValue != null ? Number(d.bundleDiscountValue) : undefined,
    thresholdAmount:
      d.thresholdAmount != null ? Number(d.thresholdAmount) : undefined,
    rewardValue: d.rewardValue != null ? Number(d.rewardValue) : undefined,
    rewardType: d.rewardType || "percent",
    category: d.category || undefined,
    brand: d.brand || undefined,
    startsAt: d.startsAt || undefined,
    endsAt: d.endsAt || undefined,
    isActive: d.isActive !== false,
    priority: Number(d.priority || 0),
    $createdAt: d.$createdAt,
  }));
}

export async function createOffer(data: Partial<Offer>) {
  if (!isConfigured("offers"))
    throw new Error("Offers collection not configured");
  return databases.createDocument(DB, COLLECTIONS.offers, AppwriteID.unique(), {
    title: data.title,
    type: data.type || "bundle",
    description: data.description || "",
    buyQuantity: Number(data.buyQuantity || 0),
    getQuantity: Number(data.getQuantity || 0),
    minQuantity: data.minQuantity != null ? Number(data.minQuantity) : null,
    bundleDiscountType: data.bundleDiscountType || "",
    bundleDiscountValue:
      data.bundleDiscountValue != null
        ? Number(data.bundleDiscountValue)
        : null,
    thresholdAmount:
      data.thresholdAmount != null ? Number(data.thresholdAmount) : null,
    rewardValue: data.rewardValue != null ? Number(data.rewardValue) : null,
    rewardType: data.rewardType || "percent",
    category: data.category || "",
    brand: data.brand || "",
    startsAt: data.startsAt || "",
    endsAt: data.endsAt || "",
    isActive: data.isActive !== false,
    priority: Number(data.priority || 0),
  });
}

export async function updateOffer(id: string, data: Partial<Offer>) {
  if (!isConfigured("offers"))
    throw new Error("Offers collection not configured");
  return databases.updateDocument(DB, COLLECTIONS.offers, id, data);
}

export async function deleteOffer(id: string) {
  if (!isConfigured("offers"))
    throw new Error("Offers collection not configured");
  return databases.deleteDocument(DB, COLLECTIONS.offers, id);
}

// ─── Announcements ───────────────────────────────────────────────────────────

export async function listAnnouncements(): Promise<Announcement[]> {
  if (!isConfigured("announcements")) return [];
  const res = await databases.listDocuments(DB, COLLECTIONS.announcements, [
    AppwriteQuery.limit(100),
    AppwriteQuery.orderAsc("priority"),
  ]);
  return res.documents.map((d: any) => ({
    id: d.$id,
    message: d.message,
    linkHref: d.linkHref || undefined,
    linkLabel: d.linkLabel || undefined,
    bgColor: d.bgColor || "bg-neutral-900",
    isActive: d.isActive !== false,
    priority: Number(d.priority || 0),
    startsAt: d.startsAt || undefined,
    endsAt: d.endsAt || undefined,
    $createdAt: d.$createdAt,
  }));
}

export async function createAnnouncement(data: Partial<Announcement>) {
  if (!isConfigured("announcements"))
    throw new Error("Announcements collection not configured");
  return databases.createDocument(
    DB,
    COLLECTIONS.announcements,
    AppwriteID.unique(),
    {
      message: data.message,
      linkHref: data.linkHref || "",
      linkLabel: data.linkLabel || "",
      bgColor: data.bgColor || "bg-neutral-900",
      isActive: data.isActive !== false,
      priority: Number(data.priority || 0),
      startsAt: data.startsAt || "",
      endsAt: data.endsAt || "",
    },
  );
}

export async function updateAnnouncement(
  id: string,
  data: Partial<Announcement>,
) {
  if (!isConfigured("announcements"))
    throw new Error("Announcements collection not configured");
  return databases.updateDocument(DB, COLLECTIONS.announcements, id, data);
}

export async function deleteAnnouncement(id: string) {
  if (!isConfigured("announcements"))
    throw new Error("Announcements collection not configured");
  return databases.deleteDocument(DB, COLLECTIONS.announcements, id);
}

// ─── Sales ───────────────────────────────────────────────────────────────────

export async function listSales(): Promise<SaleEvent[]> {
  if (!isConfigured("sales")) return [];
  const res = await databases.listDocuments(DB, COLLECTIONS.sales, [
    AppwriteQuery.limit(100),
    AppwriteQuery.orderDesc("$createdAt"),
  ]);
  return res.documents.map((d: any) => ({
    id: d.$id,
    title: d.title,
    subtitle: d.subtitle || "",
    couponCode: d.couponCode || undefined,
    discountLabel: d.discountLabel || "",
    startsAt: d.startsAt,
    endsAt: d.endsAt,
    isActive: d.isActive !== false,
    $createdAt: d.$createdAt,
  }));
}

export async function createSale(data: Partial<SaleEvent>) {
  if (!isConfigured("sales"))
    throw new Error("Sales collection not configured");
  return databases.createDocument(DB, COLLECTIONS.sales, AppwriteID.unique(), {
    title: data.title,
    subtitle: data.subtitle || "",
    couponCode: data.couponCode || "",
    discountLabel: data.discountLabel || "",
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    isActive: data.isActive !== false,
  });
}

export async function updateSale(id: string, data: Partial<SaleEvent>) {
  if (!isConfigured("sales"))
    throw new Error("Sales collection not configured");
  return databases.updateDocument(DB, COLLECTIONS.sales, id, data);
}

export async function deleteSale(id: string) {
  if (!isConfigured("sales"))
    throw new Error("Sales collection not configured");
  return databases.deleteDocument(DB, COLLECTIONS.sales, id);
}
