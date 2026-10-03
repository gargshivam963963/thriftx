import { NextResponse } from "next/server";
import { requireUser, AuthGuardError } from "@/lib/auth-guard";
import { getWalletBalance } from "@/lib/marketing/data";
import { documentStore, isDocumentStoreConfigured } from "@/lib/document-store";

export async function GET() {
  try {
    const user = await requireUser();

    if (!isDocumentStoreConfigured) {
      return NextResponse.json(
        { balance: 0, totalEarned: 0 },
      );
    }

    const balance = await getWalletBalance(user.id);

    // Calculate total earned (sum of all positive ledger entries)
    const creditDocs = await documentStore.listDocuments(
      "thriftx",
      "credits",
      [],
    );

    let totalEarned = 0;
    creditDocs.documents.forEach((doc: any) => {
      if (doc.userId === user.id && doc.amount > 0) {
        totalEarned += doc.amount;
      }
    });

    return NextResponse.json({
      balance: balance.balance,
      totalEarned,
    });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: error.status },
      );
    }

    console.error("GET /api/marketing/credits/wallet failed:", error);

    return NextResponse.json(
      { balance: 0, totalEarned: 0 },
    );
  }
}
