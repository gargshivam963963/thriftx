import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { documentStore, DocumentQuery } from "@/lib/document-store";
import { getOrCreateReferralCode } from "@/lib/marketing/credits";
import { makeReferralCode } from "@/lib/marketing/data";
import type { Referral } from "@/lib/marketing/types";

export async function GET() {
  try {
    const user = await requireUser();
    const userId = user.id;

    let code: string;
    let referrals: Referral[] = [];

    try {
      code = await getOrCreateReferralCode(userId);
    } catch {
      code = makeReferralCode(userId);
    }

    try {
      const { documents } = await documentStore.listDocuments(
        "thriftx",
        "referrals",
        [
          DocumentQuery.equal("referrerUserId", userId),
          DocumentQuery.orderDesc("$createdAt"),
          DocumentQuery.limit(100),
        ],
      );

      referrals = documents.map((d) => ({
        id: String(d.$id ?? d.id ?? ""),
        referrerUserId: String(d.referrerUserId ?? ""),
        referrerName: String(d.referrerName ?? ""),
        code: String(d.code ?? ""),
        referredEmail: String(d.referredEmail ?? ""),
        referredUserId: String(d.referredUserId ?? ""),
        orderId: String(d.orderId ?? ""),
        rewardAmount: Number(d.rewardAmount ?? 100),
        status: (d.status as Referral["status"]) || "pending",
        $createdAt: String(d.$createdAt ?? ""),
        completedAt: String(d.completedAt ?? ""),
      }));
    } catch {
      referrals = [];
    }

    return NextResponse.json({ success: true, code, referrals });
  } catch (error) {
    console.error("GET /api/marketing/referrals error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Please login to view referral info",
        code: "",
        referrals: [],
      },
      { status: 401 },
    );
  }
}
