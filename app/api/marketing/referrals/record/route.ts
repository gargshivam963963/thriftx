import { NextRequest, NextResponse } from "next/server";
import { recordReferralSignup } from "@/lib/marketing/promotions.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, newUserId, newUserEmail } = body;

    if (!referralCode || !newUserId || !newUserEmail) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const recorded = await recordReferralSignup(
      referralCode,
      newUserId,
      newUserEmail,
    );

    return NextResponse.json({
      success: recorded,
      message: recorded
        ? "Referral recorded successfully"
        : "Failed to record referral",
    });
  } catch (error) {
    console.error("POST /api/marketing/referrals/record failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to record referral" },
      { status: 500 },
    );
  }
}
