import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
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

    const result = await documentStore.getDocument(
      "thriftx",
      "settings",
      "promotion-settings",
    );

    if (!result.document) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json(result.document);
  } catch (error) {
    console.error("GET /api/admin/promotion-settings failed:", error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const settings = await request.json();

    if (!isDocumentStoreConfigured) {
      return NextResponse.json(
        { success: false, message: "Document store not configured" },
        { status: 500 },
      );
    }

    const updated = await documentStore.updateDocument(
      "thriftx",
      "settings",
      "promotion-settings",
      settings,
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/admin/promotion-settings failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 },
    );
  }
}
