import { NextResponse } from "next/server";
import { fetchActiveSales } from "@/lib/marketing/data";

export async function GET() {
  try {
    const sales = await fetchActiveSales();
    const active = sales.length > 0 ? sales[0] : null;
    return NextResponse.json({ success: true, sale: active });
  } catch (error) {
    console.error("GET /api/marketing/sales/active error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load active sale", sale: null },
      { status: 500 },
    );
  }
}
