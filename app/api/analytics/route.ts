import { NextRequest, NextResponse } from "next/server";
import { databases, AppwriteQuery, APPWRITE_DATABASE_ID } from "@/lib/appwrite";
import type { TrafficSource } from "@/lib/analytics/types";

const ANALYTICS_EVENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_EVENTS_COLLECTION_ID || "";
const ANALYTICS_SESSIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_ANALYTICS_SESSIONS_COLLECTION_ID || "";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "7d";
    const eventType = searchParams.get("eventType") || "";
    const action = searchParams.get("action") || "overview";

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (range) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    // ─── Action: Overview ───────────────────────────────────
    if (action === "overview") {
      let totalEvents = 0;
      let totalSessions = 0;
      let pageViews = 0;
      let productViews = 0;
      let searches = 0;
      let addToCarts = 0;
      let purchases = 0;
      let clicks = 0;

      try {
        // Fetch events for the period
        if (ANALYTICS_EVENTS_COLLECTION_ID) {
          const eventsResponse = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            ANALYTICS_EVENTS_COLLECTION_ID,
            [AppwriteQuery.limit(5000)],
          );

          const events = eventsResponse.documents;
          totalEvents = events.length;

          // Filter by time range and categorize
          for (const event of events) {
            const ts = event.timestamp || 0;
            if (ts < startTimestamp || ts > endTimestamp) continue;

            const type = event.eventType || "";
            switch (type) {
              case "page_view":
                pageViews++;
                break;
              case "product_view":
                productViews++;
                break;
              case "search":
              case "search_no_results":
                searches++;
                break;
              case "add_to_cart":
                addToCarts++;
                break;
              case "purchase":
                purchases++;
                break;
              case "click":
                clicks++;
                break;
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch analytics events:", err);
      }

      try {
        if (ANALYTICS_SESSIONS_COLLECTION_ID) {
          const sessionsResponse = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            ANALYTICS_SESSIONS_COLLECTION_ID,
            [AppwriteQuery.limit(5000)],
          );

          const sessions = sessionsResponse.documents.filter(
            (s: any) =>
              (s.sessionStart || 0) >= startTimestamp &&
              (s.sessionStart || 0) <= endTimestamp,
          );
          totalSessions = sessions.length;
        }
      } catch (err) {
        console.warn("Failed to fetch sessions:", err);
      }

      // Calculate derived metrics
      const conversionRate = pageViews > 0 ? (purchases / pageViews) * 100 : 0;
      const cartToPurchase =
        addToCarts > 0 ? (purchases / addToCarts) * 100 : 0;
      const bounceRate =
        totalSessions > 0
          ? ((totalSessions -
              (totalEvents > totalSessions ? totalSessions : totalEvents)) /
              totalSessions) *
            100
          : 0;

      return NextResponse.json({
        success: true,
        data: {
          range,
          totalEvents,
          totalSessions,
          pageViews,
          productViews,
          searches,
          addToCarts,
          purchases,
          clicks,
          conversionRate: Math.round(conversionRate * 100) / 100,
          cartToPurchase: Math.round(cartToPurchase * 100) / 100,
          bounceRate: Math.min(100, Math.round(bounceRate * 100) / 100),
        },
      });
    }

    // ─── Action: Traffic Sources ────────────────────────────
    if (action === "sources") {
      const sourcesMap = new Map<string, number>();

      try {
        if (ANALYTICS_EVENTS_COLLECTION_ID) {
          const eventsResponse = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            ANALYTICS_EVENTS_COLLECTION_ID,
            [AppwriteQuery.limit(5000)],
          );

          for (const event of eventsResponse.documents) {
            const ts = event.timestamp || 0;
            if (ts < startTimestamp || ts > endTimestamp) continue;

            const properties = event.properties
              ? JSON.parse(event.properties)
              : {};
            const referrer = event.referrer || "direct";
            let source = "direct";

            if (referrer.includes("instagram")) source = "instagram";
            else if (referrer.includes("google")) source = "google";
            else if (referrer.includes("facebook")) source = "facebook";
            else if (referrer.includes("whatsapp")) source = "whatsapp";
            else if (referrer.includes("twitter") || referrer.includes("x.com"))
              source = "twitter";
            else if (referrer.includes("youtube")) source = "youtube";
            else if (
              referrer &&
              !referrer.includes(request.headers.get("host") || "")
            )
              source = "referral";

            sourcesMap.set(source, (sourcesMap.get(source) || 0) + 1);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch traffic sources:", err);
      }

      const total = Array.from(sourcesMap.values()).reduce((a, b) => a + b, 0);
      const sources = Array.from(sourcesMap.entries())
        .map(([name, count]) => ({
          source: name as TrafficSource,
          visits: count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.visits - a.visits);

      return NextResponse.json({ success: true, data: sources });
    }

    // ─── Action: Top Pages ──────────────────────────────────
    if (action === "pages") {
      const pagesMap = new Map<
        string,
        { views: number; sessionIds: Set<string> }
      >();

      try {
        if (ANALYTICS_EVENTS_COLLECTION_ID) {
          const eventsResponse = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            ANALYTICS_EVENTS_COLLECTION_ID,
            [AppwriteQuery.limit(5000)],
          );

          for (const event of eventsResponse.documents) {
            const ts = event.timestamp || 0;
            if (ts < startTimestamp || ts > endTimestamp) continue;

            const page = event.page || "/";
            const existing = pagesMap.get(page) || {
              views: 0,
              sessionIds: new Set<string>(),
            };
            existing.views++;
            if (event.sessionId) {
              existing.sessionIds.add(event.sessionId);
            }
            pagesMap.set(page, existing);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch pages:", err);
      }

      const pages = Array.from(pagesMap.entries())
        .map(([page, data]) => ({
          page,
          views: data.views,
          uniqueSessions: data.sessionIds.size,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 20);

      return NextResponse.json({ success: true, data: pages });
    }

    // ─── Action: Search Analytics ───────────────────────────
    if (action === "searches") {
      const searchesMap = new Map<
        string,
        { count: number; noResults: number }
      >();

      try {
        if (ANALYTICS_EVENTS_COLLECTION_ID) {
          const eventsResponse = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            ANALYTICS_EVENTS_COLLECTION_ID,
            [AppwriteQuery.limit(5000)],
          );

          for (const event of eventsResponse.documents) {
            const ts = event.timestamp || 0;
            if (ts < startTimestamp || ts > endTimestamp) continue;

            const properties = event.properties
              ? JSON.parse(event.properties)
              : {};
            const query = (properties.query || "").toLowerCase().trim();
            if (!query) continue;

            const existing = searchesMap.get(query) || {
              count: 0,
              noResults: 0,
            };
            existing.count++;
            if (event.eventType === "search_no_results") existing.noResults++;
            searchesMap.set(query, existing);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch searches:", err);
      }

      const searches = Array.from(searchesMap.entries())
        .map(([query, data]) => ({
          query,
          count: data.count,
          noResults: data.noResults,
          hasResultsRate:
            data.count > 0
              ? Math.round(((data.count - data.noResults) / data.count) * 100)
              : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);

      return NextResponse.json({ success: true, data: searches });
    }

    // ─── Action: Product Funnel ────────────────────────────
    if (action === "funnel") {
      const productMap = new Map<
        string,
        {
          productId: string;
          views: number;
          cartAdds: number;
          purchases: number;
        }
      >();

      try {
        if (ANALYTICS_EVENTS_COLLECTION_ID) {
          const eventsResponse = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            ANALYTICS_EVENTS_COLLECTION_ID,
            [AppwriteQuery.limit(5000)],
          );

          for (const event of eventsResponse.documents) {
            const ts = event.timestamp || 0;
            if (ts < startTimestamp || ts > endTimestamp) continue;

            const properties = event.properties
              ? JSON.parse(event.properties)
              : {};
            const productId = properties.productId || "";
            if (!productId) continue;

            const existing = productMap.get(productId) || {
              productId,
              views: 0,
              cartAdds: 0,
              purchases: 0,
            };

            switch (event.eventType) {
              case "product_view":
                existing.views++;
                break;
              case "add_to_cart":
                existing.cartAdds++;
                break;
              case "purchase":
                existing.purchases++;
                break;
            }
            productMap.set(productId, existing);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch product funnel:", err);
      }

      const products = Array.from(productMap.entries())
        .map(([id, data]) => ({
          productId: id,
          views: data.views,
          cartAdds: data.cartAdds,
          purchases: data.purchases,
          viewToCart:
            data.views > 0 ? Math.round((data.cartAdds / data.views) * 100) : 0,
          cartToPurchase:
            data.cartAdds > 0
              ? Math.round((data.purchases / data.cartAdds) * 100)
              : 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 30);

      return NextResponse.json({ success: true, data: products });
    }

    // ─── Action: Device Breakdown ───────────────────────────
    if (action === "devices") {
      const deviceMap = new Map<string, number>();

      try {
        if (ANALYTICS_SESSIONS_COLLECTION_ID) {
          const sessionsResponse = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            ANALYTICS_SESSIONS_COLLECTION_ID,
            [AppwriteQuery.limit(5000)],
          );

          for (const session of sessionsResponse.documents) {
            const ts = session.sessionStart || 0;
            if (ts < startTimestamp || ts > endTimestamp) continue;

            const ua = session.userAgent || "";
            const isMobile = /Mobile|Android|iP(ad|hone|od)/i.test(ua);
            const isTablet = /Tablet|iPad/i.test(ua);

            const type = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";
            deviceMap.set(type, (deviceMap.get(type) || 0) + 1);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch device data:", err);
      }

      const total = Array.from(deviceMap.values()).reduce((a, b) => a + b, 0);
      const devices = Array.from(deviceMap.entries())
        .map(([type, count]) => ({
          type,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      return NextResponse.json({ success: true, data: devices });
    }

    // ─── Action: Geo ──────────────────────────────────────
    if (action === "geo") {
      const geoMap = new Map<
        string,
        { city: string; country: string; count: number }
      >();

      try {
        if (ANALYTICS_SESSIONS_COLLECTION_ID) {
          const sessionsResponse = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            ANALYTICS_SESSIONS_COLLECTION_ID,
            [AppwriteQuery.limit(5000)],
          );

          for (const session of sessionsResponse.documents) {
            const ts = session.sessionStart || 0;
            if (ts < startTimestamp || ts > endTimestamp) continue;

            // For now, we'll use IP as a proxy — in production, use a geo service
            const ip = session.ip || "unknown";
            const locationKey = ip;

            const existing = geoMap.get(locationKey) || {
              city: "Unknown",
              country: "Unknown",
              count: 0,
            };
            existing.count++;
            geoMap.set(locationKey, existing);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch geo data:", err);
      }

      const locations = Array.from(geoMap.entries())
        .map(([_, data]) => data)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      return NextResponse.json({ success: true, data: locations });
    }

    // ─── Action: Events Timeline ───────────────────────────
    if (action === "timeline") {
      const timelineMap = new Map<
        string,
        {
          date: string;
          pageViews: number;
          productViews: number;
          addToCarts: number;
          purchases: number;
        }
      >();

      // Initialize empty entries for each day in range
      const tempDate = new Date(startDate);
      while (tempDate <= endDate) {
        const key = tempDate.toISOString().split("T")[0];
        timelineMap.set(key, {
          date: key,
          pageViews: 0,
          productViews: 0,
          addToCarts: 0,
          purchases: 0,
        });
        tempDate.setDate(tempDate.getDate() + 1);
      }

      try {
        if (ANALYTICS_EVENTS_COLLECTION_ID) {
          const eventsResponse = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            ANALYTICS_EVENTS_COLLECTION_ID,
            [AppwriteQuery.limit(5000)],
          );

          for (const event of eventsResponse.documents) {
            const ts = event.timestamp || 0;
            if (ts < startTimestamp || ts > endTimestamp) continue;

            const dateKey = new Date(ts).toISOString().split("T")[0];
            const existing = timelineMap.get(dateKey) || {
              date: dateKey,
              pageViews: 0,
              productViews: 0,
              addToCarts: 0,
              purchases: 0,
            };

            switch (event.eventType) {
              case "page_view":
                existing.pageViews++;
                break;
              case "product_view":
                existing.productViews++;
                break;
              case "add_to_cart":
                existing.addToCarts++;
                break;
              case "purchase":
                existing.purchases++;
                break;
            }
            timelineMap.set(dateKey, existing);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch timeline:", err);
      }

      const timeline = Array.from(timelineMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      return NextResponse.json({ success: true, data: timeline });
    }

    return NextResponse.json(
      { success: false, message: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Analytics query error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
