import { NextResponse } from "next/server";
import { AuthGuardError, requireAdmin } from "@/lib/auth-guard";
import { documentStore, isDocumentStoreConfigured } from "@/lib/document-store";

const DEFAULT_SETTINGS = {
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

export async function GET() {
  try {
    await requireAdmin();

    if (!isDocumentStoreConfigured) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const settings = await documentStore.getDocument(
      "thriftx",
      "settings",
      "promotion-settings",
    );

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    if (error instanceof Error && error.message === "Document not found") {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    console.error("GET /api/admin/promotion-settings failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load promotion settings" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body: unknown = await request.json();

    if (!isDocumentStoreConfigured) {
      return NextResponse.json(
        { success: false, message: "Document store not configured" },
        { status: 500 },
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid promotion settings" },
        { status: 400 },
      );
    }
    const settings = body as Record<string, unknown>;
    const welcome = settings.welcomeOffer;
    const referral = settings.referralProgram;
    const stacking = settings.stackingRules;
    const isRecord = (value: unknown): value is Record<string, unknown> =>
      !!value && typeof value === "object" && !Array.isArray(value);
    const validNumber = (
      value: unknown,
      min: number,
      max: number,
    ): value is number =>
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= min &&
      value <= max;

    if (
      !isRecord(welcome) ||
      !isRecord(referral) ||
      !isRecord(stacking) ||
      typeof welcome.enabled !== "boolean" ||
      !validNumber(welcome.discountPercent, 0, 100) ||
      !validNumber(welcome.maxSubtotal, 0, 1_000_000) ||
      !validNumber(welcome.minOrderValue ?? 0, 0, 1_000_000) ||
      (welcome.maxDiscount !== undefined &&
        !validNumber(welcome.maxDiscount, 0, 1_000_000)) ||
      typeof referral.enabled !== "boolean" ||
      !validNumber(referral.rewardAmount, 0, 100_000) ||
      !validNumber(referral.minOrderValue, 0, 1_000_000) ||
      !validNumber(referral.perCustomerLimit, 0, 1_000) ||
      !validNumber(referral.rewardDelayDays, 0, 365) ||
      typeof stacking.allowStacking !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "Promotion values are invalid" },
        { status: 400 },
      );
    }

    const normalized = {
      welcomeOffer: {
        enabled: welcome.enabled,
        discountPercent: welcome.discountPercent,
        maxSubtotal: welcome.maxSubtotal,
        ...(welcome.maxDiscount !== undefined
          ? { maxDiscount: welcome.maxDiscount }
          : {}),
        minOrderValue: welcome.minOrderValue ?? 0,
      },
      referralProgram: {
        enabled: referral.enabled,
        rewardAmount: referral.rewardAmount,
        minOrderValue: referral.minOrderValue,
        perCustomerLimit: referral.perCustomerLimit,
        rewardDelayDays: referral.rewardDelayDays,
      },
      stackingRules: { allowStacking: stacking.allowStacking },
    };

    let saved;
    try {
      await documentStore.getDocument("thriftx", "settings", "promotion-settings");
      saved = await documentStore.updateDocument(
        "thriftx",
        "settings",
        "promotion-settings",
        normalized,
      );
    } catch (error) {
      if (!(error instanceof Error && error.message === "Document not found")) {
        throw error;
      }
      saved = await documentStore.createDocument(
        "thriftx",
        "settings",
        "promotion-settings",
        normalized,
      );
    }

    return NextResponse.json(saved);
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    console.error("POST /api/admin/promotion-settings failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 },
    );
  }
}
