import { NextRequest, NextResponse } from "next/server";

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

/**
 * Notification preferences stub. Preferences are currently owned by the
 * client (localStorage) — this endpoint simply accepts the sync so the
 * client never 404s, and gives a future SMS/WhatsApp worker a place to read
 * from. Auth is intentionally not required: preferences are device-scoped.
 */
export async function POST(request: NextRequest) {
  try {
    await request.json().catch(() => null);
  } catch {
    // body is best-effort
  }
  return NextResponse.json({ success: true }, { headers: NO_STORE });
}
