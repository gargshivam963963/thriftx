import { NextResponse } from "next/server";
import { fetchActiveAnnouncements } from "@/lib/marketing/data";

export const revalidate = 60;

export async function GET() {
  try {
    const announcements = await fetchActiveAnnouncements();
    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error("GET /api/marketing/announcements error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load announcements",
        announcements: [],
      },
      { status: 500 },
    );
  }
}
