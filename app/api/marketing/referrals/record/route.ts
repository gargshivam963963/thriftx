import { NextRequest, NextResponse } from "next/server";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import { recordReferralSignup } from "@/lib/marketing/promotions.server";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !("referralCode" in body) ||
      typeof body.referralCode !== "string" ||
      body.referralCode.trim().length === 0 ||
      body.referralCode.length > 64
    ) {
      return NextResponse.json(
        { success: false, message: "A valid referral code is required." },
        { status: 400 },
      );
    }

    const recorded = await recordReferralSignup(
      body.referralCode.trim(),
      user.id,
      user.email,
    );

    return NextResponse.json({
      success: recorded,
      message: recorded
        ? "Referral recorded successfully"
        : "Failed to record referral",
    });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: error.status },
      );
    }
    console.error("POST /api/marketing/referrals/record failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to record referral" },
      { status: 500 },
    );
  }
}
