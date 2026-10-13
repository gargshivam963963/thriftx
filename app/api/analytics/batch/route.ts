import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isExcludedEmail } from "@/lib/analytics/excluded";
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
    // Resolve the signed-in viewer from the session cookie ONCE. This is
    // authoritative — it can't be spoofed by the client, and it works even
    // when useAuth() hasn't loaded yet on the client (the "login race").
    // Identity is stamped onto every stored event so the admin dashboard can
    // show WHICH user did what (name + email), not just anonymous counts.
    let viewer: {
      id: string;
      email: string;
      name: string | null;
      role: string;
    } | null = null;
    try {
      const headerStore = await headers();
      const session = await auth.api.getSession({ headers: headerStore });
      if (session?.user) {
        const u = session.user as typeof session.user & { role?: string };
        viewer = {
          id: u.id,
          email: u.email,
          name: u.name ?? null,
          role: u.role || "customer",
        };
      }
    } catch (sessionError) {
      // If session lookup fails, fall through to anonymous ingestion rather
      // than blocking legitimate customer events.
      console.warn("Analytics batch: session check skipped:", sessionError);
    }

    // Server-side self-exclusion: drop the ENTIRE batch if the requester is
    // the owner (by email) OR ANY admin-role account. Previously only the
    // hard-coded owner email was excluded, so signing in with a different
    // admin email still polluted the dashboard.
    if (viewer && (isExcludedEmail(viewer.email) || viewer.role === "admin")) {
      return NextResponse.json({
        success: true,
        stored: 0,
        total: 0,
        excluded: true,
        message: "Owner/admin traffic excluded from analytics",
      });
    }

    const body = await request.json();
    const { events, sessionId } = body;
    // Persistent browser id for anonymous visitor grouping (may be empty
    // for legacy clients — per-event visitorId is preferred below).
    const bodyVisitorId =
      typeof body.visitorId === "string" ? body.visitorId : "";

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { success: false, message: "No events provided" },
        { status: 400 },
      );
    }

    // Server-side: filter out non-customer events before storing
    const customerEvents = events.filter((event: Record<string, unknown>) =>
      shouldStoreEvent(event),
    );

    if (customerEvents.length === 0) {
      return NextResponse.json({
        success: true,
        stored: 0,
        total: events.length,
        filtered: events.length,
        message: "All events filtered out (non-customer traffic)",
      });
    }

    // Store filtered events in Neon, stamped with the viewer's identity.
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
            // Persistent browser identity for anonymous grouping on the
            // admin dashboard (may be empty for legacy queued events).
            visitorId:
              (event.visitorId as string) || bodyVisitorId || "",
            timestamp: event.timestamp || Date.now(),
            createdAt: new Date().toISOString(),
            // Identity — null for anonymous visitors. Lets the dashboard
            // attribute events to a real person (name/email) and lets the
            // owner's own traffic be filtered at read time too.
            userId: viewer?.id ?? null,
            userName: viewer?.name ?? null,
            userEmail: viewer?.email ?? null,
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
              // Keep identity fresh — a visitor may sign in mid-session.
              userId: viewer?.id ?? session.userId ?? null,
              userName: viewer?.name ?? session.userName ?? null,
              userEmail: viewer?.email ?? session.userEmail ?? null,
              // Backfill persistent visitor id (empty on legacy records).
              visitorId: session.visitorId || bodyVisitorId || null,
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
              userId: viewer?.id ?? null,
              userName: viewer?.name ?? null,
              userEmail: viewer?.email ?? null,
              visitorId: bodyVisitorId || null,
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
