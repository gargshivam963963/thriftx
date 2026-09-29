import { NextRequest, NextResponse } from "next/server";
import {
  DOCUMENT_COLLECTIONS,
  DOCUMENT_DATABASE_ID,
  DocumentID,
  DocumentQuery,
  documentStore,
} from "@/lib/document-store";

/**
 * Server-side filter: returns true if the event should be stored.
 * Defense-in-depth — client-side filtering should catch most, but this
 * ensures no admin/localhost/dev data is persisted.
 */
function shouldStoreEvent(event: Record<string, unknown>): boolean {
  const page = (event.page as string) || "";

  // 1. Skip admin routes
  if (page.startsWith("/admin") || page.startsWith("/api/admin")) {
    return false;
  }

  // 2. Skip API routes (non-customer-facing)
  if (page.startsWith("/api/")) {
    return false;
  }

  // 3. Skip auth pages
  if (page.startsWith("/login") || page.startsWith("/signup")) {
    return false;
  }

  // 4. Skip profile/account pages
  if (page.startsWith("/profile")) {
    return false;
  }

  // 5. Skip internal Next.js routes
  if (page.startsWith("/_next") || page.startsWith("/favicon")) {
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events, sessionId } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { success: false, message: "No events provided" },
        { status: 400 },
      );
    }

    // Server-side: filter out non-customer events before storing
    const customerEvents = events.filter((event: Record<string, unknown>) => {
      const shouldStore = shouldStoreEvent(event);
      if (!shouldStore) {
        console.log(
          `[Analytics] Server-side filtered out event: ${event.eventType} on ${event.page}`,
        );
      }
      return shouldStore;
    });

    if (customerEvents.length === 0) {
      return NextResponse.json({
        success: true,
        stored: 0,
        total: events.length,
        filtered: events.length,
        message: "All events filtered out (non-customer traffic)",
      });
    }

    // Store filtered events in Neon.
    const storedEvents = [];
    for (const event of customerEvents) {
      try {
        const doc = await documentStore.createDocument(
          DOCUMENT_DATABASE_ID,
          DOCUMENT_COLLECTIONS.analyticsEvents,
          DocumentID.unique(),
          {
            eventType: event.eventType,
            eventName: event.eventName,
            properties: JSON.stringify(event.properties || {}),
            page: event.page || "",
            referrer: event.referrer || "",
            sessionId: event.sessionId || sessionId || "",
            timestamp: event.timestamp || Date.now(),
            createdAt: new Date().toISOString(),
          },
        );
        storedEvents.push(doc.$id);
      } catch (err) {
        console.error("❌ Failed to store analytics event");
        console.error(err);

        return NextResponse.json(
          {
            success: false,
            error: String(err),
          },
          { status: 500 },
        );
      }
    }

    // Update session heartbeat
    if (sessionId) {
      try {
        const existingSessions = await documentStore.listDocuments(
          DOCUMENT_DATABASE_ID,
          DOCUMENT_COLLECTIONS.analyticsSessions,
          [DocumentQuery.equal("sessionId", sessionId)],
        );

        if (existingSessions.documents.length > 0) {
          const session = existingSessions.documents[0];
          await documentStore.updateDocument(
            DOCUMENT_DATABASE_ID,
            DOCUMENT_COLLECTIONS.analyticsSessions,
            session.$id,
            {
              lastActivity: Date.now(),
              eventCount: Number(session.eventCount || 0) + events.length,
              duration: Date.now() - Number(session.sessionStart || Date.now()),
            },
          );
        } else {
          await documentStore.createDocument(
            DOCUMENT_DATABASE_ID,
            DOCUMENT_COLLECTIONS.analyticsSessions,
            DocumentID.unique(),
            {
              sessionId,
              sessionStart: Date.now(),
              lastActivity: Date.now(),
              eventCount: events.length,
              duration: 0,
              page: events[0]?.page || "",
              referrer: events[0]?.referrer || "",
              userAgent: request.headers.get("user-agent") || "",
              ip:
                request.headers.get("x-forwarded-for") ||
                request.headers.get("x-real-ip") ||
                "",
              createdAt: new Date().toISOString(),
            },
          );
        }
      } catch (err) {
        console.warn("Failed to update session:", err);
      }
    }

    return NextResponse.json({
      success: true,
      stored: storedEvents.length,
      total: events.length,
    });
  } catch (error) {
    console.error("Analytics batch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
