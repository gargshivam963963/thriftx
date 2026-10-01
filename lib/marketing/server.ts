import {
  documentStore,
  DocumentID,
  DocumentQuery,
  isDocumentStoreConfigured,
} from "@/lib/document-store";
import type { Coupon, Offer, Announcement, SaleEvent } from "./types";

const EMPTY_RESULT = { documents: [] as Record<string, any>[] };

const sortDocuments = (
  documents: Record<string, any>[],
  orderBy: "asc" | "desc" = "desc",
) => {
  const dir = orderBy === "asc" ? 1 : -1;
  return [...documents].sort((a, b) => {
    const left = a.$createdAt ?? a.createdAt ?? "";
    const right = b.$createdAt ?? b.createdAt ?? "";
    return String(left).localeCompare(String(right)) * dir;
  });
};

export async function listCoupons(): Promise<Coupon[]> {
  if (!isDocumentStoreConfigured) return [];
  const { documents } = await documentStore.listDocuments(
    "thriftx",
    "coupons",
    [DocumentQuery.orderAsc("code"), DocumentQuery.limit(200)],
  );
  return sortDocuments(documents, "desc").map((d) => ({
    id: String(d.id ?? d.$id ?? ""),
    code: String(d.code ?? ""),
    discountType: (d.discountType as Coupon["discountType"]) ?? "flat",
    discountValue: Number(d.discountValue ?? 0),
    minOrderValue: Number(d.minOrderValue ?? 0),
    maxDiscount: d.maxDiscount != null ? Number(d.maxDiscount) : undefined,
    expiresAt: (d.expiresAt as string) ?? undefined,
    usageLimit: d.usageLimit != null ? Number(d.usageLimit) : undefined,
    usedCount: Number(d.usedCount ?? 0),
    description: String(d.description ?? ""),
    isActive: d.isActive !== false,
    $createdAt: String(d.$createdAt ?? ""),
  }));
}

export async function createCoupon(data: Partial<Coupon>) {
  if (!isDocumentStoreConfigured) {
    throw new Error("Marketing document store is not configured");
  }
  return documentStore.createDocument(
    "thriftx",
    "coupons",
    DocumentID.unique(),
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
  if (!isDocumentStoreConfigured) {
    throw new Error("Marketing document store is not configured");
  }
  return documentStore.updateDocument("thriftx", "coupons", id, {
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
  if (!isDocumentStoreConfigured) return;
  return documentStore.deleteDocument("thriftx", "coupons", id);
}

export async function listOffers(): Promise<Offer[]> {
  if (!isDocumentStoreConfigured) return [];
  const { documents } = await documentStore.listDocuments("thriftx", "offers", [
    DocumentQuery.orderAsc("priority"),
    DocumentQuery.limit(200),
  ]);
  return documents.map((d: any) => ({
    id: String(d.id ?? d.$id ?? ""),
    title: String(d.title ?? ""),
    type: (d.type as Offer["type"]) ?? "bundle",
    description: String(d.description ?? ""),
    buyQuantity: Number(d.buyQuantity || 0),
    getQuantity: Number(d.getQuantity || 0),
    minQuantity: d.minQuantity != null ? Number(d.minQuantity) : undefined,
    bundleDiscountType:
      (d.bundleDiscountType as Offer["bundleDiscountType"]) || undefined,
    bundleDiscountValue:
      d.bundleDiscountValue != null ? Number(d.bundleDiscountValue) : undefined,
    thresholdAmount:
      d.thresholdAmount != null ? Number(d.thresholdAmount) : undefined,
    rewardValue: d.rewardValue != null ? Number(d.rewardValue) : undefined,
    rewardType: (d.rewardType as Offer["rewardType"]) || "percent",
    category: d.category || undefined,
    brand: d.brand || undefined,
    startsAt: d.startsAt || undefined,
    endsAt: d.endsAt || undefined,
    isActive: d.isActive !== false,
    priority: Number(d.priority || 0),
    $createdAt: String(d.$createdAt ?? ""),
  }));
}

export async function createOffer(data: Partial<Offer>) {
  if (!isDocumentStoreConfigured) {
    throw new Error("Marketing document store is not configured");
  }
  return documentStore.createDocument(
    "thriftx",
    "offers",
    DocumentID.unique(),
    {
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
    },
  );
}

export async function updateOffer(id: string, data: Partial<Offer>) {
  if (!isDocumentStoreConfigured) {
    throw new Error("Marketing document store is not configured");
  }
  return documentStore.updateDocument("thriftx", "offers", id, data);
}

export async function deleteOffer(id: string) {
  if (!isDocumentStoreConfigured) return;
  return documentStore.deleteDocument("thriftx", "offers", id);
}

export async function listAnnouncements(): Promise<Announcement[]> {
  if (!isDocumentStoreConfigured) return [];
  const { documents } = await documentStore.listDocuments(
    "thriftx",
    "announcements",
    [DocumentQuery.orderAsc("priority"), DocumentQuery.limit(100)],
  );
  return documents.map((d: any) => ({
    id: String(d.id ?? d.$id ?? ""),
    message: String(d.message ?? ""),
    linkHref: d.linkHref || undefined,
    linkLabel: d.linkLabel || undefined,
    bgColor: d.bgColor || "bg-neutral-900",
    isActive: d.isActive !== false,
    priority: Number(d.priority || 0),
    startsAt: d.startsAt || undefined,
    endsAt: d.endsAt || undefined,
    $createdAt: String(d.$createdAt ?? ""),
  }));
}

export async function createAnnouncement(data: Partial<Announcement>) {
  if (!isDocumentStoreConfigured) {
    throw new Error("Marketing document store is not configured");
  }
  return documentStore.createDocument(
    "thriftx",
    "announcements",
    DocumentID.unique(),
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
  if (!isDocumentStoreConfigured) {
    throw new Error("Marketing document store is not configured");
  }
  return documentStore.updateDocument("thriftx", "announcements", id, data);
}

export async function deleteAnnouncement(id: string) {
  if (!isDocumentStoreConfigured) return;
  return documentStore.deleteDocument("thriftx", "announcements", id);
}

export async function listSales(): Promise<SaleEvent[]> {
  if (!isDocumentStoreConfigured) return [];
  const { documents } = await documentStore.listDocuments("thriftx", "sales", [
    DocumentQuery.orderDesc("$createdAt"),
    DocumentQuery.limit(100),
  ]);
  return documents.map((d: any) => ({
    id: String(d.id ?? d.$id ?? ""),
    title: String(d.title ?? ""),
    subtitle: String(d.subtitle ?? ""),
    couponCode: d.couponCode || undefined,
    discountLabel: String(d.discountLabel ?? ""),
    startsAt: String(d.startsAt ?? ""),
    endsAt: String(d.endsAt ?? ""),
    isActive: d.isActive !== false,
    $createdAt: String(d.$createdAt ?? ""),
  }));
}

export async function createSale(data: Partial<SaleEvent>) {
  if (!isDocumentStoreConfigured) {
    throw new Error("Marketing document store is not configured");
  }
  return documentStore.createDocument("thriftx", "sales", DocumentID.unique(), {
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
  if (!isDocumentStoreConfigured) {
    throw new Error("Marketing document store is not configured");
  }
  return documentStore.updateDocument("thriftx", "sales", id, data);
}

export async function deleteSale(id: string) {
  if (!isDocumentStoreConfigured) return;
  return documentStore.deleteDocument("thriftx", "sales", id);
}
