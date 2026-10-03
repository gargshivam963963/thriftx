import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthGuardError } from "@/lib/auth-guard";
import { getOrder } from "@/lib/services/orderService";
import { documentStore, isDocumentStoreConfigured } from "@/lib/document-store";
import { completeReferral } from "@/lib/marketing/credits";

/**
 * POST /api/orders/[id]/referral-complete
 * ADMIN ONLY: Mark referral as complete and issue credit
 * Called when order is marked "Delivered" (7+ days after completion)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();

    // Only allow admin to complete referrals
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id: orderId } = await context.params;

    if (!orderId || typeof orderId !== "string" || orderId.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    if (!isDocumentStoreConfigured) {
      return NextResponse.json(
        { success: false, message: "Database not configured" },
        { status: 503 },
      );
    }

    // Get order
    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Verify order is marked as delivered
    if (order.status !== "Delivered") {
      return NextResponse.json(
        {
          success: false,
          message: "Order must be marked as Delivered first",
        },
        { status: 409 },
      );
    }

    // Find associated referral document by orderId
    const referralResult = await documentStore.listDocuments(
      "thriftx",
      "referrals",
      [
        { kind: "equal", attribute: "orderId", values: [orderId] },
        { kind: "limit", value: 1 },
      ],
    );

    if (referralResult.documents.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No referral found for this order",
        },
        { status: 404 },
      );
    }

    const referral = referralResult.documents[0];
    const referralId = referral.$id;

    // Complete referral and issue credit
    try {
      await completeReferral(referralId);

      return NextResponse.json({
        success: true,
        message: "Referral reward issued successfully",
        referralId,
      });
    } catch (error) {
      console.error("completeReferral error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to issue referral reward",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: error.status },
      );
    }

    console.error("POST /api/orders/[id]/referral-complete failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to complete referral" },
      { status: 500 },
    );
  }
}
