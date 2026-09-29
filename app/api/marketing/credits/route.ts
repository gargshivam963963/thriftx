import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { getWalletBalance } from "@/lib/marketing/data";

export async function GET() {
  try {
    const user = await requireUser();
    const wallet = await getWalletBalance(user.id);
    return NextResponse.json({ success: true, wallet });
  } catch (error) {
    console.error("GET /api/marketing/credits error:", error);
    return NextResponse.json(
      { success: false, message: "Please login to view credits", wallet: null },
      { status: 401 },
    );
  }
}
