import { NextResponse } from "next/server";
import { requireUser, AuthGuardError } from "@/lib/auth-guard";
import { documentStore, isDocumentStoreConfigured } from "@/lib/document-store";
import { getWalletBalance } from "@/lib/marketing/data";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { amount, addressId, deliveryMethod } = await request.json();

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid credit amount" },
        { status: 400 },
      );
    }

    if (!isDocumentStoreConfigured) {
      return NextResponse.json(
        { success: false, message: "Document store not configured" },
        { status: 500 },
      );
    }

    // Check wallet balance
    const balance = await getWalletBalance(user.id);
    if (balance.balance < amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient credit balance",
          balance: balance.balance,
        },
        { status: 400 },
      );
    }

    // Store credit application in temporary session
    // This will be validated and deducted when order is created
    const sessionKey = `credit-session:${user.id}:${Date.now()}`;
    await documentStore.createDocument("thriftx", "credit-sessions", sessionKey, {
      userId: user.id,
      amount,
      addressId,
      deliveryMethod,
      appliedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      creditApplied: amount,
      message: "Credit applied to checkout",
    });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: error.status },
      );
    }

    console.error("POST /api/marketing/credits/apply failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to apply credit" },
      { status: 500 },
    );
  }
}
