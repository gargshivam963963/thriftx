import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import {
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
    const user = await requireUser();
    const userId = user.id;

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
      referrals = res.documents.map((d) => ({
        id: d.$id,
        referrerUserId: (d.referrerUserId as string) || "",
        referrerName: (d.referrerName as string) || "",
        code: (d.code as string) || "",
        referredEmail: (d.referredEmail as string) || "",
        referredUserId: (d.referredUserId as string) || "",
        orderId: (d.orderId as string) || "",
        rewardAmount: Number(d.rewardAmount || 100),
        status: (d.status as Referral["status"]) || "pending",
        $createdAt: (d.$createdAt as string) || "",
        completedAt: (d.completedAt as string) || "",
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
