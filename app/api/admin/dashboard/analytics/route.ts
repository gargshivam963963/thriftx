import { NextResponse } from "next/server";
import { getSalesAnalytics } from "@/lib/services/adminService";

export async function GET() {
  try {
    const analytics = await getSalesAnalytics();
    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error("[api/admin/dashboard/analytics] GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
