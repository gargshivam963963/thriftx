import { NextRequest, NextResponse } from "next/server";
import { adminAuthErrorResponse } from "@/lib/auth-guard";
import {
  addMessage,
  getAdminConversation,
  markConversationRead,
  sanitizeBody,
  setConversationStatus,
} from "@/lib/support/server";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

type Params = { params: Promise<{ id: string }> };

/**
 * Admin support — single conversation.
 *
 *   GET   /api/admin/support/[id]        → full thread + customer data (marks
 *                                          customer messages read)
 *   POST  /api/admin/support/[id]        → operator sends a reply { body }
 *   PATCH /api/admin/support/[id]        → set status { status }
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const { id } = await params;
    const conversation = await getAdminConversation(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: "Conversation not found." },
        { status: 404, headers: NO_STORE },
      );
    }
    await markConversationRead(id);
    return NextResponse.json(
      { success: true, conversation },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("/api/admin/support/[id] GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load conversation." },
      { status: 500, headers: NO_STORE },
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body: unknown = await request.json().catch(() => null);
    const record =
      body && typeof body === "object" ? (body as Record<string, unknown>) : {};

    const messageBody = sanitizeBody(record.body);
    if (!messageBody) {
      return NextResponse.json(
        { success: false, message: "Reply cannot be empty." },
        { status: 400, headers: NO_STORE },
      );
    }

    // Ensure the conversation exists before replying.
    const existing = await getAdminConversation(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Conversation not found." },
        { status: 404, headers: NO_STORE },
      );
    }

    const message = await addMessage({
      conversationId: id,
      senderType: "admin",
      body: messageBody,
      name: "THRIFTX Support",
    });
    if (!message) {
      return NextResponse.json(
        { success: false, message: "Unable to send reply." },
        { status: 500, headers: NO_STORE },
      );
    }

    return NextResponse.json(
      { success: true, message },
      { status: 201, headers: NO_STORE },
    );
  } catch (error) {
    console.error("/api/admin/support/[id] POST failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send reply." },
      { status: 500, headers: NO_STORE },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body: unknown = await request.json().catch(() => null);
    const record =
      body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const status = record.status;
    if (
      status !== "open" &&
      status !== "answered" &&
      status !== "resolved"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid status." },
        { status: 400, headers: NO_STORE },
      );
    }

    const ok = await setConversationStatus(id, status);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Unable to update status." },
        { status: 500, headers: NO_STORE },
      );
    }
    return NextResponse.json(
      { success: true, status },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("/api/admin/support/[id] PATCH failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update status." },
      { status: 500, headers: NO_STORE },
    );
  }
}
