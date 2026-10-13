import { NextRequest, NextResponse } from "next/server";
import { adminAuthErrorResponse } from "@/lib/auth-guard";
import {
  countAwaitingReply,
  listAdminConversations,
} from "@/lib/support/server";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

/**
 * Admin support inbox — LIST conversations.
 * Guarded by requireAdmin (defense-in-depth on top of the /admin layout guard).
 *
 *   GET /api/admin/support?status=open|answered|resolved|all&limit=&offset=
 */
export async function GET(request: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const sp = request.nextUrl.searchParams;
    const statusParam = sp.get("status");
    const status =
      statusParam === "open" ||
      statusParam === "answered" ||
      statusParam === "resolved" ||
      statusParam === "all"
        ? statusParam
        : "all";

    const parsedLimit = Number.parseInt(sp.get("limit") || "", 10);
    const parsedOffset = Number.parseInt(sp.get("offset") || "", 10);

    const { conversations, total } = await listAdminConversations({
      status,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : 50,
      offset: Number.isFinite(parsedOffset) ? parsedOffset : 0,
    });
    const awaitingReply = await countAwaitingReply();

    return NextResponse.json(
      { success: true, conversations, total, awaitingReply },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("/api/admin/support GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load conversations." },
      { status: 500, headers: NO_STORE },
    );
  }
}
