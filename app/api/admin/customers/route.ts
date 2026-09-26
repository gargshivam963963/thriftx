import { NextResponse } from "next/server";
import { getCustomers } from "@/lib/services/adminService";

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error("[api/admin/customers] GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}
