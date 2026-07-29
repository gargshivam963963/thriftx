import { NextRequest, NextResponse } from "next/server";
import {
  databases,
  AppwriteID,
  AppwriteQuery,
  APPWRITE_DATABASE_ID,
} from "@/lib/appwrite";

const ANALYTICS_EVENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_EVENTS_COLLECTION_ID || "";
const ANALYTICS_SESSIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_SESSIONS_COLLECTION_ID || "";

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

    // Store events in Appwrite
    const storedEvents = [];
    for (const event of events) {
      try {
        if (ANALYTICS_EVENTS_COLLECTION_ID) {
          const doc = await databases.createDocument(
            APPWRITE_DATABASE_ID,
            ANALYTICS_EVENTS_COLLECTION_ID,
            AppwriteID.unique(),
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
        }
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
    if (sessionId && ANALYTICS_SESSIONS_COLLECTION_ID) {
      try {
        // Try to find existing session
        const existingSessions = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          ANALYTICS_SESSIONS_COLLECTION_ID,
          [AppwriteQuery.equal("sessionId", sessionId)],
        );

        if (existingSessions.documents.length > 0) {
          const session = existingSessions.documents[0];
          await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            ANALYTICS_SESSIONS_COLLECTION_ID,
            session.$id,
            {
              lastActivity: Date.now(),
              eventCount: (session.eventCount || 0) + events.length,
              duration: Date.now() - (session.sessionStart || Date.now()),
            },
          );
        } else {
          await databases.createDocument(
            APPWRITE_DATABASE_ID,
            ANALYTICS_SESSIONS_COLLECTION_ID,
            AppwriteID.unique(),
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
