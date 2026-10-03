/**
 * Server-side promotion engine for THRIFTX
 * All discount, eligibility, and reward logic MUST live here.
 * No client-side trust. No hardcoded thresholds.
 *
 * Rules:
 * - Best single offer only (no stacking)
 * - Welcome offer: 50% off, max ₹299 subtotal, first order per user
 * - Referral: ₹100 credit, issued 7 days after delivery
 * - All calculations server-only, validated at checkout and payment
 */

import "server-only";

import {
  documentStore,
  DocumentQuery,
  isDocumentStoreConfigured,
} from "@/lib/document-store";
import { validateCoupon } from "./offers";
import type { Coupon } from "./types";

export interface PromotionSettings {
  welcomeOffer: {
    enabled: boolean;
    discountPercent: number;
    maxSubtotal: number; // Orders up to this amount are eligible
    maxDiscount?: number; // Cap on absolute discount amount (if any)
    minOrderValue?: number; // Minimum order to qualify
  };
  referralProgram: {
    enabled: boolean;
    rewardAmount: number; // ₹ credit per successful referral
    minOrderValue: number;
    perCustomerLimit: number; // Max referrals per customer
    rewardDelayDays: number; // Issue reward after N days of delivery
  };
  stackingRules: {
    allowStacking: boolean; // We use: false (best single offer only)
  };
}

const DEFAULT_SETTINGS: PromotionSettings = {
  welcomeOffer: {
    enabled: true,
    discountPercent: 50,
    maxSubtotal: 299,
    maxDiscount: undefined,
    minOrderValue: 0,
  },
  referralProgram: {
    enabled: true,
    rewardAmount: 100,
    minOrderValue: 499,
    perCustomerLimit: 5,
    rewardDelayDays: 7,
  },
  stackingRules: {
    allowStacking: false,
  },
};

/**
 * Load promotion settings from database (editable by admin)
 * Falls back to defaults if not configured
 */
async function getPromotionSettings(): Promise<PromotionSettings> {
  if (!isDocumentStoreConfigured) {
    return DEFAULT_SETTINGS;
  }

  try {
    const doc = await documentStore.getDocument(
      "thriftx",
      "settings",
      "promotion-settings",
    );

    if (doc && typeof doc === "object") {
      return {
        ...DEFAULT_SETTINGS,
        ...doc,
        welcomeOffer: {
          ...DEFAULT_SETTINGS.welcomeOffer,
          ...(doc.welcomeOffer as Partial<PromotionSettings["welcomeOffer"]>),
        },
        referralProgram: {
          ...DEFAULT_SETTINGS.referralProgram,
          ...(doc.referralProgram as Partial<
            PromotionSettings["referralProgram"]
          >),
        },
        stackingRules: {
          ...DEFAULT_SETTINGS.stackingRules,
          ...(doc.stackingRules as Partial<
            PromotionSettings["stackingRules"]
          >),
        },
      };
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Document not found") {
      return DEFAULT_SETTINGS;
    }
    console.error("Unable to load promotion settings:", error);
    throw error;
  }

  return DEFAULT_SETTINGS;
}

/**
 * Check if user is making their first order
 * Deterministic check: look for any order by userId with status !== "Cancelled"
 */
async function isFirstOrder(userId: string): Promise<boolean> {
  if (!isDocumentStoreConfigured) {
    return false;
  }

  const result = await documentStore.listDocuments("thriftx", "orders", [
    DocumentQuery.equal("userId", userId),
  ]);

  return !result.documents.some(
    (doc) => String(doc.status ?? "").toLowerCase() !== "cancelled",
  );
}

/**
 * Check if referral code is valid and applicable
 * Prevents self-referrals, validates code format, checks user's own referral
 */
async function validateReferralCode(
  userId: string,
  referralCode?: string,
): Promise<{
  valid: boolean;
  referrerUserId?: string;
  error?: string;
}> {
  if (!referralCode || !isDocumentStoreConfigured) {
    return { valid: false };
  }

  // Find referral document by code
  const result = await documentStore.listDocuments(
    "thriftx",
    "referrals",
    [
      DocumentQuery.equal("code", referralCode.trim()),
      DocumentQuery.limit(1),
    ],
  );

  if (result.documents.length === 0) {
    return { valid: false, error: "Referral code not found" };
  }

  const referral = result.documents[0];

  // Prevent self-referrals
  if (referral.referrerUserId === userId) {
    return { valid: false, error: "Cannot use your own referral code" };
  }

  // Check if already used by this user (prevent duplicate rewards)
  const existingReferral = await documentStore.listDocuments(
    "thriftx",
    "referrals",
    [
      DocumentQuery.equal("referralCode", referralCode.trim()),
      DocumentQuery.equal("referredUserId", userId),
      DocumentQuery.limit(1),
    ],
  );

  const existingSignup = existingReferral.documents[0];
  if (existingSignup && existingSignup.status !== "signup-recorded") {
    return {
      valid: false,
      error: "You have already used this referral code",
    };
  }

  return {
    valid: true,
    referrerUserId: String(
      existingSignup?.referrerUserId ?? referral.referrerUserId,
    ),
  };
}

/**
 * Core promotion calculation
 * Returns the best single applicable promotion (no stacking)
 *
 * @param userId - Current user ID
 * @param subtotal - Cart subtotal from DB (NOT from client)
 * @param appliedCouponCode - Coupon code user entered (optional)
 * @param referralCode - Referral code user entered (optional)
 * @returns Promotion details with discount amount and reason
 */
export async function calculatePromotion(
  userId: string,
  subtotal: number,
  appliedCouponCode?: string,
  referralCode?: string,
): Promise<{
  discount: number;
  discountReason: string;
  appliedPromotion: "welcome" | "referral" | "coupon" | "none";
  finalPayable: number;
}> {
  const settings = await getPromotionSettings();
  const candidates: Array<{
    type: "welcome" | "referral" | "coupon";
    discount: number;
  }> = [];

  // Candidate 1: Welcome Offer
  if (settings.welcomeOffer.enabled) {
    const isFirst = await isFirstOrder(userId);

    if (isFirst && subtotal <= settings.welcomeOffer.maxSubtotal) {
      let welcomeDiscount = Math.round(
        (subtotal * settings.welcomeOffer.discountPercent) / 100,
      );

      if (
        settings.welcomeOffer.maxDiscount &&
        welcomeDiscount > settings.welcomeOffer.maxDiscount
      ) {
        welcomeDiscount = settings.welcomeOffer.maxDiscount;
      }

      if (welcomeDiscount > 0) {
        candidates.push({ type: "welcome", discount: welcomeDiscount });
      }
    }
  }

  // Candidate 2: Referral Credit (only if first order and code valid)
  if (settings.referralProgram.enabled && referralCode) {
    const isFirst = await isFirstOrder(userId);
    const validation = await validateReferralCode(userId, referralCode);

    if (
      isFirst &&
      validation.valid &&
      subtotal >= settings.referralProgram.minOrderValue
    ) {
      candidates.push({
        type: "referral",
        discount: Math.min(
          settings.referralProgram.rewardAmount,
          subtotal, // Can't discount more than subtotal
        ),
      });
    }
  }

  // Candidate 3: Coupon Code
  if (appliedCouponCode) {
    if (isDocumentStoreConfigured) {
      const { documents } = await documentStore.listDocuments(
        "thriftx",
        "coupons",
      );
      const couponDocument = documents.find(
        (coupon) =>
          typeof coupon.code === "string" &&
          coupon.code.toLowerCase() === appliedCouponCode.trim().toLowerCase(),
      );
      const coupon: Coupon | undefined = couponDocument
        ? {
            id: String(couponDocument.id ?? couponDocument.$id),
            code: String(couponDocument.code),
            discountType:
              couponDocument.discountType === "percent" ? "percent" : "flat",
            discountValue: Number(couponDocument.discountValue),
            minOrderValue: Number(couponDocument.minOrderValue ?? 0),
            maxDiscount:
              couponDocument.maxDiscount == null
                ? undefined
                : Number(couponDocument.maxDiscount),
            expiresAt:
              typeof couponDocument.expiresAt === "string"
                ? couponDocument.expiresAt
                : undefined,
            usageLimit:
              couponDocument.usageLimit == null
                ? undefined
                : Number(couponDocument.usageLimit),
            usedCount: Number(couponDocument.usedCount ?? 0),
            description:
              typeof couponDocument.description === "string"
                ? couponDocument.description
                : "",
            isActive: couponDocument.isActive === true,
          }
        : undefined;
      const couponValidation = validateCoupon(coupon, subtotal);

      if (couponValidation.valid && couponValidation.discount > 0) {
        candidates.push({
          type: "coupon",
          discount: Math.min(couponValidation.discount, subtotal),
        });
      }
    }
  }

  // Select best offer (no stacking)
  if (candidates.length === 0) {
    return {
      discount: 0,
      discountReason: "No applicable promotions",
      appliedPromotion: "none",
      finalPayable: subtotal,
    };
  }

  const best = candidates.reduce((max, curr) =>
    curr.discount > max.discount ? curr : max,
  );

  return {
    discount: best.discount,
    discountReason: getPromotionLabel(best.type),
    appliedPromotion: best.type,
    finalPayable: Math.max(0, subtotal - best.discount),
  };
}

function getPromotionLabel(type: string): string {
  switch (type) {
    case "welcome":
      return "Welcome Offer (50% off)";
    case "referral":
      return "Referral Reward";
    case "coupon":
      return "Coupon Discount";
    default:
      return "Discount Applied";
  }
}

/**
 * Record referral on user signup
 * Called when new user registers with a referral code
 */
export async function recordReferralSignup(
  referralCode: string,
  newUserId: string,
  newUserEmail: string,
): Promise<boolean> {
  if (!isDocumentStoreConfigured) {
    return false;
  }

  try {
    const validation = await validateReferralCode(newUserId, referralCode);

    if (!validation.valid || !validation.referrerUserId) {
      return false;
    }

    // Create a deterministic document linking this referral to this signup
    const referralLinkId = `${referralCode}:${newUserId}`;

    await documentStore.createDocument(
      "thriftx",
      "referrals",
      referralLinkId,
      {
        referralCode,
        referrerUserId: validation.referrerUserId,
        referredUserId: newUserId,
        referredEmail: newUserEmail,
        signupDate: new Date().toISOString(),
        status: "signup-recorded", // Waiting for first order
        orderId: "",
        orderDate: "",
      },
    );

    return true;
  } catch (error) {
    console.error("recordReferralSignup error:", error);
    return false;
  }
}

/**
 * Update referral status when referred user places first order
 * MUST be called server-side after order creation
 */
export async function recordOrderForReferral(
  orderId: string,
  userId: string,
  referralCode?: string,
): Promise<boolean> {
  if (!referralCode || !isDocumentStoreConfigured) {
    return false;
  }

  try {
    const referralLinkId = `${referralCode}:${userId}`;

    await documentStore.updateDocument(
      "thriftx",
      "referrals",
      referralLinkId,
      {
        status: "first-order-placed",
        orderId,
        orderDate: new Date().toISOString(),
      },
    );

    return true;
  } catch (error) {
    console.error("recordOrderForReferral error:", error);
    return false;
  }
}
