import { NextRequest, NextResponse } from "next/server";
import {
  DOCUMENT_COLLECTIONS,
  DOCUMENT_DATABASE_ID,
  DocumentQuery,
  documentStore,
} from "@/lib/document-store";
import { adminAuthErrorResponse } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { isExcludedEmail } from "@/lib/analytics/excluded";
import { getAddressLocationsForUsers } from "@/lib/analytics/addressLocation";
import type { TrafficSource } from "@/lib/analytics/types";

interface AnalyticsEventRecord {
  eventType?: string;
  properties?: string | Record<string, unknown>;
  page?: string;
  referrer?: string;
  sessionId?: string;
  /** Persistent browser id (localStorage). Empty on legacy records. */
  visitorId?: string;
  timestamp?: number;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}

interface AnalyticsSessionRecord {
  sessionId?: string;
  /** Persistent browser id (localStorage). Empty on legacy records. */
  visitorId?: string;
  sessionStart?: number;
  lastActivity?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}

/**
 * Friendly label for an anonymous visitor row, e.g. "Visitor #A4F2".
 * Deterministic per grouping key so it stays stable across reloads/ranges.
 */
function anonymousLabel(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return `Visitor #${hash.toString(36).toUpperCase().padStart(4, "0").slice(-4)}`;
}

/**
 * Read-time guard: drop any event/session stamped with an excluded
 * (owner/admin) email. Ingestion already blocks these, but this protects
 * against events recorded before the exclusion list existed or by older
 * clients, so historical owner data stops showing up immediately.
 */
function isExcludedRecord(
  doc: { userEmail?: string | null } | null | undefined,
): boolean {
  return isExcludedEmail(doc?.userEmail);
}

/**
 * Attribute an event to a traffic source. UTM parameters are checked before
 * the referrer because campaign links (Instagram ads, WhatsApp blasts) can
 * arrive with no referrer at all. Known networks map onto the dashboard's
 * fixed palette; anything else (e.g. utm_source=bitly) keeps its raw label.
 */
function resolveTrafficSource(
  event: AnalyticsEventRecord,
  host: string,
): string {
  const properties = parseProperties(event.properties);
  const utmSource = String(properties.utm_source || "")
    .toLowerCase()
    .trim();

  const match = (value: string): string | null => {
    if (value.includes("instagram")) return "instagram";
    if (value.includes("google")) return "google";
    if (value.includes("facebook")) return "facebook";
    if (value.includes("whatsapp")) return "whatsapp";
    if (value.includes("twitter") || value.includes("x.com")) return "twitter";
    if (value.includes("youtube")) return "youtube";
    if (value.includes("mail")) return "email";
    return null;
  };

  if (utmSource) {
    return match(utmSource) ?? utmSource;
  }

  const referrer = (event.referrer || "").toLowerCase();
  if (!referrer) return "direct";
  const fromReferrer = match(referrer);
  if (fromReferrer) return fromReferrer;
  return referrer.includes(host) ? "direct" : "referral";
}

function parseProperties(
  value: AnalyticsEventRecord["properties"],
): Record<string, unknown> {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return value ?? {};
}

async function fetchAnalyticsEvents(startTimestamp: number, endTimestamp: number) {
  const response = await documentStore.listDocuments(
    DOCUMENT_DATABASE_ID,
    DOCUMENT_COLLECTIONS.analyticsEvents,
    [
      DocumentQuery.greaterThanOrEqual("$createdAt", startTimestamp),
      DocumentQuery.lessThanOrEqual("$createdAt", endTimestamp),
      DocumentQuery.orderDesc("$createdAt"),
      DocumentQuery.limit(50000),
    ],
  );
  return {
    ...response,
    documents: (response.documents as unknown as AnalyticsEventRecord[]).filter(
      (doc) => !isExcludedRecord(doc),
    ),
  };
}

async function fetchAnalyticsSessions(
  startTimestamp: number,
  endTimestamp: number,
) {
  const response = await documentStore.listDocuments(
    DOCUMENT_DATABASE_ID,
    DOCUMENT_COLLECTIONS.analyticsSessions,
    [
      DocumentQuery.greaterThanOrEqual("$createdAt", startTimestamp),
      DocumentQuery.lessThanOrEqual("$createdAt", endTimestamp),
      DocumentQuery.orderDesc("$createdAt"),
      DocumentQuery.limit(50000),
    ],
  );
  return {
    ...response,
    documents: (response.documents as unknown as AnalyticsSessionRecord[]).filter(
      (doc) => !isExcludedRecord(doc),
    ),
  };
}

export async function GET(request: NextRequest) {
  // Store analytics are private business data — admin session required.
  // (Ingestion via POST /api/analytics/batch stays public by design.)
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

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
      let totalTimeOnSite = 0;

      try {
        // Fetch events for the period
        {
          const eventsResponse = await fetchAnalyticsEvents(startTimestamp, endTimestamp);

          const events = eventsResponse.documents;
          // Heartbeats are liveness pings, not real interaction — exclude
          // them from the headline event count.
          totalEvents = events.filter((e) => e.eventType !== "heartbeat").length;

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
        {
          const sessionsResponse = await fetchAnalyticsSessions(startTimestamp, endTimestamp);

          const sessions = sessionsResponse.documents.filter(
            (s) =>
              (s.sessionStart || 0) >= startTimestamp &&
              (s.sessionStart || 0) <= endTimestamp,
          );
          totalSessions = sessions.length;

          // "Time on site" per session = lastActivity − sessionStart. The
          // batch route keeps lastActivity fresh via heartbeats, so idle-but-
          // present reading time is included; background-tab time is not.
          for (const session of sessions) {
            const start = session.sessionStart || 0;
            const last = session.lastActivity || start;
            totalTimeOnSite += Math.max(0, Math.round((last - start) / 1000));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch sessions:", err);
      }

      // ─── Audience / logged-in users ─────────────────────
      // Independent of the event pipeline: total registered accounts, how many
      // hold a currently-valid session ("online now"), and how many signed up
      // within the selected range. A session counts as "online" while its
      // expiresAt is in the future (Better Auth slides expiry on activity).
      // Owner/admin accounts are excluded so the dashboard reflects customers.
      let totalUsers = 0;
      let activeUsers = 0;
      let newUsers = 0;
      try {
        if (prisma) {
          const now = new Date();
          const [allUsers, activeSessions] = await Promise.all([
            prisma.user.findMany({
              select: { id: true, email: true, role: true, createdAt: true },
            }),
            prisma.session.findMany({
              where: { expiresAt: { gt: now } },
              select: { userId: true },
              distinct: ["userId"],
            }),
          ]);

          const isCustomer = (u: { email: string; role?: string | null }) =>
            u.role !== "admin" && !isExcludedEmail(u.email);

          const customers = allUsers.filter(isCustomer);
          const activeIds = new Set(activeSessions.map((s) => s.userId));

          totalUsers = customers.length;
          activeUsers = customers.filter((u) => activeIds.has(u.id)).length;
          newUsers = customers.filter(
            (u) => u.createdAt >= startDate && u.createdAt <= endDate,
          ).length;
        }
      } catch (err) {
        console.warn("Failed to fetch user metrics:", err);
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
      const avgSessionDuration =
        totalSessions > 0 ? Math.round(totalTimeOnSite / totalSessions) : 0;

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
          totalUsers,
          activeUsers,
          newUsers,
          conversionRate: Math.round(conversionRate * 100) / 100,
          cartToPurchase: Math.round(cartToPurchase * 100) / 100,
          bounceRate: Math.min(100, Math.round(bounceRate * 100) / 100),
          avgSessionDuration,
          totalTimeOnSite,
        },
      });
    }

    // ─── Action: Traffic Sources ────────────────────────────
    if (action === "sources") {
      // "Visits" = unique sessions attributed to each source (deduped via the
      // session's first page_view in range) — counting raw events would let
      // one busy session inflate a source.
      const host = request.headers.get("host") || "";

      // sessionId → source, first page_view in range wins.
      const sessionSources = new Map<string, string>();
      const sourcesMap = new Map<string, Set<string>>();

      try {
        {
          const eventsResponse = await fetchAnalyticsEvents(startTimestamp, endTimestamp);

          for (const event of eventsResponse.documents) {
            const ts = event.timestamp || 0;
            if (ts < startTimestamp || ts > endTimestamp) continue;
            if (event.eventType !== "page_view") continue;

            const sessionId = event.sessionId || `anon-${ts}`;
            if (sessionSources.has(sessionId)) continue;

            const source = resolveTrafficSource(event, host);
            sessionSources.set(sessionId, source);

            const sessions = sourcesMap.get(source) ?? new Set<string>();
            sessions.add(sessionId);
            sourcesMap.set(source, sessions);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch traffic sources:", err);
      }

      const sources = Array.from(sourcesMap.entries())
        .map(([name, sessions]) => ({
          source: name as TrafficSource,
          visits: sessions.size,
        }))
        .sort((a, b) => b.visits - a.visits);

      const total = sources.reduce((sum, entry) => sum + entry.visits, 0);
      const withPercentage = sources.map((entry) => ({
        ...entry,
        percentage: total > 0 ? Math.round((entry.visits / total) * 100) : 0,
      }));

      return NextResponse.json({ success: true, data: withPercentage });
    }

    // ─── Action: Visitors (identified users) ────────────────
    // One row per person in the selected range: registered users are keyed by
    // userId (so name/email show up); anonymous browsers are merged by their
    // persistent visitorId and shown as "Visitor #XXXX" (stable per browser).
    // Identity is stamped server-side at ingestion from the session cookie,
    // so it can't be spoofed. Owner/admin rows are already excluded by
    // fetchAnalyticsEvents/fetchAnalyticsSessions.
    if (action === "visitors") {
      const host = request.headers.get("host") || "";

      interface VisitorRow {
        id: string;
        userId: string | null;
        name: string | null;
        email: string | null;
        /** Friendly row label: real name, email, or "Visitor #XXXX". */
        displayName: string;
        /** "City, State" from the user's saved address — null for anonymous. */
        location: string | null;
        identified: boolean;
        sessions: number;
        events: number;
        pageViews: number;
        timeOnSite: number;
        source: string;
        firstSeen: number;
        lastSeen: number;
      }

      const visitors = new Map<string, VisitorRow>();

      const touch = (
        key: string,
        identity: {
          userId?: string | null;
          userName?: string | null;
          userEmail?: string | null;
        },
        ts: number,
      ): VisitorRow => {
        let row = visitors.get(key);
        if (!row) {
          row = {
            id: key,
            userId: identity.userId ?? null,
            name: identity.userName ?? null,
            email: identity.userEmail ?? null,
            displayName:
              identity.userName ||
              identity.userEmail ||
              anonymousLabel(key),
            location: null,
            identified: Boolean(identity.userId),
            sessions: 0,
            events: 0,
            pageViews: 0,
            timeOnSite: 0,
            source: "direct",
            firstSeen: ts,
            lastSeen: ts,
          };
          visitors.set(key, row);
        } else {
          // Fill in identity if a later event revealed it (e.g. signed in
          // mid-session) — never overwrite an identified row with anonymous.
          if (!row.userId && identity.userId) {
            row.userId = identity.userId;
            row.name = identity.userName ?? row.name;
            row.email = identity.userEmail ?? row.email;
            row.displayName = row.name || row.email || anonymousLabel(key);
            row.identified = true;
          }
          row.firstSeen = Math.min(row.firstSeen, ts);
          row.lastSeen = Math.max(row.lastSeen, ts);
        }
        return row;
      };

      try {
        // Sessions: count visits + heartbeat-based time on site per visitor.
        const sessionsResponse = await fetchAnalyticsSessions(
          startTimestamp,
          endTimestamp,
        );
        // visitorKey (`v-…`) → userId, learned when a signed-in event/session
        // shares the same browser id. Lets us collapse the pre-login
        // anonymous row into the identified row below.
        const visitorToUser = new Map<string, string>();
        for (const session of sessionsResponse.documents) {
          const start = session.sessionStart || 0;
          if (start < startTimestamp || start > endTimestamp) continue;
          if (session.userId && session.visitorId) {
            visitorToUser.set(`v-${session.visitorId}`, session.userId);
          }
        }
        for (const session of sessionsResponse.documents) {
          const start = session.sessionStart || 0;
          if (start < startTimestamp || start > endTimestamp) continue;
          // Grouping priority: signed-in userId first, then the persistent
          // browser visitorId (one browser = one row across sessions), then
          // the per-tab sessionId as a last resort for legacy records.
          // A browser that signed in mid-range collapses onto its userId row
          // via the visitor→user map (pre-login browsing included).
          const visitorKey = session.visitorId
            ? `v-${session.visitorId}`
            : "";
          const key =
            session.userId ||
            (visitorKey ? (visitorToUser.get(visitorKey) ?? visitorKey) : "") ||
            `anon-${session.sessionId || `s${start}-${session.ip || ""}`}`;
          const row = touch(key, session, start);
          row.sessions += 1;
          const last = session.lastActivity || start;
          row.timeOnSite += Math.max(0, Math.round((last - start) / 1000));
        }

        // Events: totals, page views, and each visitor's traffic source
        // (attributed from their first page_view in range).
        const eventsResponse = await fetchAnalyticsEvents(
          startTimestamp,
          endTimestamp,
        );
        const sourceAssigned = new Set<string>();
        for (const event of eventsResponse.documents) {
          const ts = event.timestamp || 0;
          if (ts < startTimestamp || ts > endTimestamp) continue;

          const eventVisitorKey = event.visitorId
            ? `v-${event.visitorId}`
            : "";
          const key =
            event.userId ||
            (eventVisitorKey
              ? (visitorToUser.get(eventVisitorKey) ?? eventVisitorKey)
              : "") ||
            `anon-${event.sessionId || `e${ts}-${event.page || ""}`}`;
          const row = touch(key, event, ts);
          row.events += 1;
          if (event.eventType === "page_view") {
            row.pageViews += 1;
            if (!sourceAssigned.has(row.id)) {
              sourceAssigned.add(row.id);
              row.source = resolveTrafficSource(event, host);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch visitors:", err);
      }

      const rows = Array.from(visitors.values()).sort(
        (a, b) => b.lastSeen - a.lastSeen,
      );

      // Location for identified visitors comes from their saved address in the
      // document store (default/first wins). Anonymous visitors have no
      // reliable location — only a raw IP is stored, no geo service is
      // configured. (Not the Prisma `Address` table: it has no backing table.)
      try {
        const identifiedIds = rows
          .map((r) => r.userId)
          .filter((id): id is string => Boolean(id));
        const locations = await getAddressLocationsForUsers(identifiedIds);
        for (const row of rows) {
          if (row.userId) {
            const location = locations.get(row.userId);
            row.location =
              [location?.city, location?.state].filter(Boolean).join(", ") ||
              null;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch visitor locations:", err);
      }

      return NextResponse.json({ success: true, data: rows });
    }

    // ─── Action: Visitor Detail ───────────────────────────────
    // Full activity profile for ONE visitor row (id = grouping key from the
    // visitors action): identity, stats, page views, searches, viewed
    // products, cart adds, wishlist, device/browser, and a chronological
    // journey timeline. The UI opens this as a detail drawer.
    if (action === "visitor-detail") {
      const visitorKey = searchParams.get("visitorId") || "";
      if (!visitorKey) {
        return NextResponse.json(
          { success: false, message: "visitorId is required" },
          { status: 400 },
        );
      }
      const host = request.headers.get("host") || "";

      // Row ids look like: <userId> (identified), v-<visitorId> (anonymous
      // browser), anon-<sessionId> (legacy per-session fallback).
      const isIdentified =
        !visitorKey.startsWith("v-") && !visitorKey.startsWith("anon-");
      const rawVisitor = visitorKey.startsWith("v-")
        ? visitorKey.slice(2)
        : "";
      const rawAnon = visitorKey.startsWith("anon-")
        ? visitorKey.slice(5)
        : "";

      const matches = (doc: {
        userId?: string | null;
        visitorId?: string;
        sessionId?: string;
      }): boolean => {
        if (isIdentified) return doc.userId === visitorKey;
        if (rawVisitor) return doc.visitorId === rawVisitor;
        return doc.sessionId === rawAnon;
      };

      const summarize = (
        eventType: string,
        properties: Record<string, unknown>,
        page: string,
      ): string => {
        const str = (v: unknown): string =>
          typeof v === "string" || typeof v === "number" ? String(v) : "";
        switch (eventType) {
          case "page_view":
            return `Viewed ${page || "/"}`;
          case "product_view":
            return `Viewed ${str(properties.name) || str(properties.productId) || "a product"}`;
          case "search":
          case "search_no_results": {
            const q = str(properties.query) || "…";
            const suffix =
              eventType === "search_no_results" ? " (no results)" : "";
            return `Searched for "${q}"${suffix}`;
          }
          case "add_to_cart":
            return `Added ${str(properties.name) || str(properties.productId) || "item"} to cart`;
          case "remove_from_cart":
            return `Removed ${str(properties.name) || str(properties.productId) || "item"} from cart`;
          case "wishlist_add":
            return `Wishlisted ${str(properties.name) || str(properties.productId) || "item"}`;
          case "wishlist_remove":
            return `Removed ${str(properties.productId) || "item"} from wishlist`;
          case "checkout_start":
            return "Started checkout";
          case "checkout_complete":
          case "purchase":
            return `Purchased${str(properties.orderId) ? ` (order ${str(properties.orderId)})` : ""}`;
          case "click":
            return `Clicked ${str(properties.elementName) || str(properties.elementType) || "something"}`;
          case "scroll_depth":
            return `Scrolled ${str(properties.depth)}%`.trim();
          default:
            return eventType.replace(/_/g, " ");
        }
      };

      let name: string | null = null;
      let email: string | null = null;
      let userId: string | null = isIdentified ? visitorKey : null;
      let sessions = 0;
      let timeOnSite = 0;
      let events = 0;
      let pageViews = 0;
      let firstSeen = Number.MAX_SAFE_INTEGER;
      let lastSeen = 0;
      let source = "direct";
      let device = "unknown";
      let browser = "unknown";
      let os = "unknown";
      const sourceAssigned = new Set<string>();

      const pagesMap = new Map<string, number>();
      const searchesList: {
        query: string;
        timestamp: number;
        noResults: boolean;
      }[] = [];
      const productsMap = new Map<
        string,
        {
          productId: string;
          name: string | null;
          views: number;
          cartAdds: number;
          wishlistAdds: number;
        }
      >();
      const timeline: {
        timestamp: number;
        eventType: string;
        eventName: string;
        page: string;
        summary: string;
      }[] = [];

      try {
        const sessionsResponse = await fetchAnalyticsSessions(
          startTimestamp,
          endTimestamp,
        );
        for (const session of sessionsResponse.documents) {
          if (!matches(session)) continue;
          const start = session.sessionStart || 0;
          if (start < startTimestamp || start > endTimestamp) continue;
          sessions += 1;
          const last = session.lastActivity || start;
          timeOnSite += Math.max(0, Math.round((last - start) / 1000));
          firstSeen = Math.min(firstSeen, start);
          lastSeen = Math.max(lastSeen, last);
          if (session.userId === userId || (!userId && session.userId)) {
            userId = session.userId;
            name = session.userName ?? name;
            email = session.userEmail ?? email;
          }
        }
        // __PART3__
        const eventsResponse = await fetchAnalyticsEvents(
          startTimestamp,
          endTimestamp,
        );
        for (const event of eventsResponse.documents) {
          const ts = event.timestamp || 0;
          if (ts < startTimestamp || ts > endTimestamp) continue;
          if (event.eventType === "heartbeat") continue;
          if (!matches(event)) continue;

          events += 1;
          firstSeen = Math.min(firstSeen, ts);
          lastSeen = Math.max(lastSeen, ts);
          if (!userId && event.userId) {
            userId = event.userId;
            name = event.userName ?? name;
            email = event.userEmail ?? email;
          }

          const properties = parseProperties(event.properties);
          const type = event.eventType || "";
          const page = event.page || "/";

          if (type === "page_view") {
            pageViews += 1;
            pagesMap.set(page, (pagesMap.get(page) ?? 0) + 1);
            const sid = event.sessionId || `e${ts}`;
            if (!sourceAssigned.has(sid)) {
              sourceAssigned.add(sid);
              if (source === "direct") source = resolveTrafficSource(event, host);
            }
          }
          if (type === "search" || type === "search_no_results") {
            const query = String(properties.query || "").trim();
            if (query) {
              searchesList.push({
                query,
                timestamp: ts,
                noResults: type === "search_no_results",
              });
            }
          }
          if (
            type === "product_view" ||
            type === "add_to_cart" ||
            type === "wishlist_add"
          ) {
            const pid = String(properties.productId || "");
            if (pid) {
              const existing = productsMap.get(pid) ?? {
                productId: pid,
                name: null,
                views: 0,
                cartAdds: 0,
                wishlistAdds: 0,
              };
              const pname = String(properties.name || "");
              if (pname && !existing.name) existing.name = pname;
              if (type === "product_view") existing.views += 1;
              if (type === "add_to_cart") existing.cartAdds += 1;
              if (type === "wishlist_add") existing.wishlistAdds += 1;
              productsMap.set(pid, existing);
            }
          }
          const rawName = (event as { eventName?: string }).eventName;
          timeline.push({
            timestamp: ts,
            eventType: type,
            eventName: String(rawName || type),
            page,
            summary: summarize(type, properties, page),
          });
        }
        // __PART4__
        // Browser/OS/device from the visitor's most recent session UA.
        try {
          const mine = sessionsResponse.documents.filter(matches);
          mine.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));
          const ua = String(mine[0]?.userAgent || "");
          if (ua) {
            if (/Mobile|Android|iP(hone|od)/i.test(ua)) device = "mobile";
            else if (/Tablet|iPad/i.test(ua)) device = "tablet";
            else device = "desktop";
            if (/Edg/i.test(ua)) browser = "Edge";
            else if (/Chrome/i.test(ua)) browser = "Chrome";
            else if (/Safari/i.test(ua)) browser = "Safari";
            else if (/Firefox/i.test(ua)) browser = "Firefox";
            if (/Windows/i.test(ua)) os = "Windows";
            else if (/Mac OS/i.test(ua)) os = "macOS";
            else if (/Android/i.test(ua)) os = "Android";
            else if (/iOS|iPhone|iPad/i.test(ua)) os = "iOS";
            else if (/Linux/i.test(ua)) os = "Linux";
          }
        } catch {
          // UA parsing is best-effort only.
        }
      } catch (err) {
        console.warn("Failed to fetch visitor detail:", err);
      }

      let location: string | null = null;
      if (userId) {
        try {
          const locations = await getAddressLocationsForUsers([userId]);
          const loc = locations.get(userId);
          location = [loc?.city, loc?.state].filter(Boolean).join(", ") || null;
        } catch (err) {
          console.warn("Failed to fetch visitor location:", err);
        }
      }

      timeline.sort((a, b) => b.timestamp - a.timestamp);

      return NextResponse.json({
        success: true,
        data: {
          id: visitorKey,
          userId,
          name,
          email,
          displayName: name || email || anonymousLabel(visitorKey),
          identified: Boolean(userId),
          location,
          sessions,
          events,
          pageViews,
          timeOnSite,
          source,
          device,
          browser,
          os,
          firstSeen: firstSeen === Number.MAX_SAFE_INTEGER ? 0 : firstSeen,
          lastSeen,
          pages: Array.from(pagesMap.entries())
            .map(([page, views]) => ({ page, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 20),
          searches: searchesList
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 30),
          products: Array.from(productsMap.values())
            .sort(
              (a, b) =>
                b.views + b.cartAdds * 2 - (a.views + a.cartAdds * 2),
            )
            .slice(0, 20),
          timeline: timeline.slice(0, 100),
        },
      });
    }

    // ─── Action: Top Pages ──────────────────────────────────
    if (action === "pages") {
      const pagesMap = new Map<
        string,
        { views: number; sessionIds: Set<string> }
      >();

      try {
        {
          const eventsResponse = await fetchAnalyticsEvents(startTimestamp, endTimestamp);

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
        {
          const eventsResponse = await fetchAnalyticsEvents(startTimestamp, endTimestamp);

          for (const event of eventsResponse.documents) {
            const ts = event.timestamp || 0;
            if (ts < startTimestamp || ts > endTimestamp) continue;

            const properties = parseProperties(event.properties);
            const query = String(properties.query || "")
              .toLowerCase()
              .trim();
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
        {
          const eventsResponse = await fetchAnalyticsEvents(startTimestamp, endTimestamp);

          for (const event of eventsResponse.documents) {
            const ts = event.timestamp || 0;
            if (ts < startTimestamp || ts > endTimestamp) continue;

            const properties = parseProperties(event.properties);
            const productId = String(properties.productId || "");
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
        {
          const sessionsResponse = await fetchAnalyticsSessions(startTimestamp, endTimestamp);

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
        {
          const sessionsResponse = await fetchAnalyticsSessions(startTimestamp, endTimestamp);

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
        {
          const eventsResponse = await fetchAnalyticsEvents(startTimestamp, endTimestamp);

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

/**
 * DELETE /api/analytics — purge stored analytics history (admin only).
 *
 * Wipes every analytics event + session row from the document store. This is
 * a full reset used to clear the pre-identity test pollution (11k+ legacy
 * events stamped with no email, which the read-time filter cannot attribute,
 * so they inflated the dashboard). Real customer traffic only starts
 * accumulating cleanly after the identity-stamping fix, so nothing of value is
 * lost. Bulk-deleted via Prisma in one statement per collection (the document
 * store wrapper only deletes one doc at a time).
 */
export async function DELETE() {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  if (!prisma) {
    return NextResponse.json(
      { success: false, message: "Database not configured" },
      { status: 503 },
    );
  }

  try {
    const [delEvents, delSessions] = await prisma.$transaction([
      prisma.storedDocument.deleteMany({
        where: { collectionKey: DOCUMENT_COLLECTIONS.analyticsEvents },
      }),
      prisma.storedDocument.deleteMany({
        where: { collectionKey: DOCUMENT_COLLECTIONS.analyticsSessions },
      }),
    ]);
    return NextResponse.json({
      success: true,
      deletedEvents: delEvents.count,
      deletedSessions: delSessions.count,
    });
  } catch (error) {
    console.error("Analytics purge error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to purge analytics data" },
      { status: 500 },
    );
  }
}
