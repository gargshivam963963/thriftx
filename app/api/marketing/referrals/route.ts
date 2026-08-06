import { NextRequest, NextResponse } from "next/server";
import {
  account,
  databases,
  AppwriteQuery,
  APPWRITE_DATABASE_ID,
  APPWRITE_REFERRALS_COLLECTION_ID,
} from "@/lib/appwrite";
import { getOrCreateReferralCode } from "@/lib/marketing/credits";
import { makeReferralCode } from "@/lib/marketing/data";
import type { Referral } from "@/lib/marketing/types";

export async function GET() {
  try {
    const user = await account.get();
    const userId = user.$id;

    let code: string;
    let referrals: Referral[] = [];

    try {
      code = await getOrCreateReferralCode(userId);
    } catch {
      code = makeReferralCode(userId);
    }

    // Load referral history for the current user
    try {
      const res = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_REFERRALS_COLLECTION_ID,
        [
          AppwriteQuery.equal("referrerUserId", userId),
          AppwriteQuery.orderDesc("$createdAt"),
          AppwriteQuery.limit(100),
        ],
      );
      referrals = res.documents.map((d: any) => ({
        id: d.$id,
        referrerUserId: d.referrerUserId,
        referrerName: d.referrerName || "",
        code: d.code,
        referredEmail: d.referredEmail || "",
        referredUserId: d.referredUserId || "",
        orderId: d.orderId || "",
        rewardAmount: Number(d.rewardAmount || 100),
        status: d.status || "pending",
        $createdAt: d.$createdAt,
        completedAt: d.completedAt || "",
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
