import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/services/adminService";
import { adminAuthErrorResponse } from "@/lib/auth-guard";

export async function GET() {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("[api/admin/dashboard/stats] GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
