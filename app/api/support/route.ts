import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  addMessage,
  getCustomerConversation,
  getOrCreateConversation,
  resolveClientIp,
  sanitizeBody,
} from "@/lib/support/server";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

const GUEST_TOKEN_HEADER = "x-support-guest";
const GUEST_TOKEN_MAX = 64;

/**
 * Customer-facing support chat endpoint.
 *
 * Auth is OPTIONAL: logged-in customers are linked to their account; guests
 * identify themselves with a random `x-support-guest` token held in their
 * browser. The same token is echoed back so the client can persist it.
 *
 *   GET  /api/support?conversationId=...  → fetch the current thread
 *   POST /api/support                      → send a message (creates thread if
 *                                            the body carries no conversationId)
 */

async function resolveIdentity() {
  const headerStore = await headers();
  let userId: string | null = null;
  let name: string | null = null;
  let email: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: headerStore });
    if (session?.user) {
      userId = session.user.id;
      name = session.user.name ?? null;
      email = session.user.email ?? null;
    }
  } catch {
    // Not signed in — proceed as guest.
  }
  const guestToken =
    headerStore.get(GUEST_TOKEN_HEADER)?.slice(0, GUEST_TOKEN_MAX) ?? null;
  const ip = resolveClientIp(headerStore);
  const userAgent = headerStore.get("user-agent");
  return { userId, name, email, guestToken, ip, userAgent };
}

export async function GET(request: NextRequest) {
  try {
    const { userId, guestToken } = await resolveIdentity();
    const conversationId = request.nextUrl.searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: "conversationId is required." },
        { status: 400, headers: NO_STORE },
      );
    }

    const conversation = await getCustomerConversation({
      conversationId,
      userId,
      guestToken,
    });
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: "Conversation not found." },
        { status: 404, headers: NO_STORE },
      );
    }

    return NextResponse.json(
      { success: true, conversation },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("/api/support GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load conversation." },
      { status: 500, headers: NO_STORE },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email, guestToken, ip, userAgent } =
      await resolveIdentity();

    const body: unknown = await request.json().catch(() => null);
    const record =
      body && typeof body === "object" ? (body as Record<string, unknown>) : {};

    const messageBody = sanitizeBody(record.body);
    if (!messageBody) {
      return NextResponse.json(
        { success: false, message: "Message cannot be empty." },
        { status: 400, headers: NO_STORE },
      );
    }

    const conversationId =
      typeof record.conversationId === "string"
        ? record.conversationId
        : null;
    const productSlug =
      typeof record.productSlug === "string"
        ? record.productSlug.slice(0, 120)
        : null;
    const orderRef =
      typeof record.orderRef === "string" ? record.orderRef.slice(0, 64) : null;
    // Guests may supply a display name for the first message.
    const displayName =
      name ??
      (typeof record.name === "string"
        ? record.name.trim().slice(0, 120) || null
        : null);

    let targetConversationId = conversationId;

    if (!targetConversationId) {
      const conversation = await getOrCreateConversation({
        userId,
        guestToken,
        name: displayName,
        email,
        productSlug,
        orderRef,
        ip,
        userAgent,
      });
      if (!conversation) {
        return NextResponse.json(
          { success: false, message: "Unable to start a conversation." },
          { status: 500, headers: NO_STORE },
        );
      }
      targetConversationId = conversation.id;
    }

    const message = await addMessage({
      conversationId: targetConversationId,
      senderType: "customer",
      body: messageBody,
      name: displayName,
    });
    if (!message) {
      return NextResponse.json(
        { success: false, message: "Unable to send message." },
        { status: 500, headers: NO_STORE },
      );
    }

    return NextResponse.json(
      {
        success: true,
        conversationId: targetConversationId,
        guestToken: guestToken ?? null,
        message,
      },
      { status: 201, headers: NO_STORE },
    );
  } catch (error) {
    console.error("/api/support POST failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send message." },
      { status: 500, headers: NO_STORE },
    );
  }
}
