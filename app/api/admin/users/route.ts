import { NextResponse } from "next/server";
import { getRegisteredUsers } from "@/lib/services/adminService";
import { adminAuthErrorResponse } from "@/lib/auth-guard";

export async function GET() {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const users = await getRegisteredUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, users: [] },
      { status: 500 },
    );
  }
}
