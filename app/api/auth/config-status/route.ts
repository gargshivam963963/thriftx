import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    emailDeliveryConfigured: Boolean(
      process.env.RESEND_API_KEY && process.env.EMAIL_FROM,
    ),
    googleConfigured: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
  });
}
