import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import type {
  AdminConversationDetail,
  AdminConversationSummary,
  CustomerConversation,
  SenderType,
  SupportMessage,
} from "./types";

/**
 * Support-conversation server service.
 *
 * Human-operated chat: visitors send messages, a store operator replies from the
 * admin inbox. Everything here runs on the server only (never imported by client
 * components). The DB may be unconfigured during a migration window, so every
 * function degrades gracefully instead of throwing.
 */

const MAX_BODY_LENGTH = 2000;

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function mapMessage(row: {
  id: string;
  senderType: string;
  name: string | null;
  body: string;
  status: string;
  readAt: Date | null;
  createdAt: Date;
}): SupportMessage {
  return {
    id: row.id,
    senderType: row.senderType === "admin" ? "admin" : "customer",
    name: row.name,
    body: row.body,
    status: row.status,
    readAt: toIso(row.readAt),
    createdAt: row.createdAt.toISOString(),
  };
}

/** Trims and length-guards a message body. Returns null when empty/invalid. */
export function sanitizeBody(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().slice(0, MAX_BODY_LENGTH);
  return trimmed.length > 0 ? trimmed : null;
}

/** Best-effort client IP from common proxy headers. */
export function resolveClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim().slice(0, 64);
  return null;
}

/** Identify a customer by their best saved address phone (for the admin inbox). */
async function resolveCustomerPhone(userId: string): Promise<string | null> {
  try {
    const address = await prisma?.address.findFirst({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: { phone: true },
    });
    return address?.phone ?? null;
  } catch {
    return null;
  }
}


/**
 * Resolve (or lazily create) the visitor's conversation.
 *
 * - Logged-in customers are keyed by `userId` so the same thread follows them
 *   across devices.
 * - Guests are keyed by a random `guestToken` persisted in their browser
 *   (localStorage) and passed back on each request.
 */
export async function getOrCreateConversation(params: {
  userId: string | null;
  guestToken: string | null;
  name?: string | null;
  email?: string | null;
  productSlug?: string | null;
  orderRef?: string | null;
  source?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<{ id: string; guestToken: string } | null> {
  if (!isDatabaseConfigured || !prisma) return null;

  const guestToken = params.guestToken || randomUUID();

  try {
    // 1) Existing conversation for this user.
    if (params.userId) {
      const existing = await prisma.conversation.findFirst({
        where: { userId: params.userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, guestToken: true },
      });
      if (existing) {
        return { id: existing.id, guestToken: existing.guestToken ?? guestToken };
      }
    }

    // 2) Existing conversation for this guest token.
    if (params.guestToken) {
      const existing = await prisma.conversation.findUnique({
        where: { guestToken: params.guestToken },
        select: { id: true, guestToken: true },
      });
      if (existing) {
        return { id: existing.id, guestToken: existing.guestToken ?? guestToken };
      }
    }

    // 3) Create a new one.
    const created = await prisma.conversation.create({
      data: {
        userId: params.userId ?? null,
        guestToken,
        productSlug: params.productSlug ?? null,
        orderRef: params.orderRef ?? null,
        source: params.source ?? "website",
        ip: params.ip ?? null,
        userAgent: params.userAgent?.slice(0, 400) ?? null,
        status: "open",
      },
      select: { id: true, guestToken: true },
    });

    return { id: created.id, guestToken: created.guestToken ?? guestToken };
  } catch (error) {
    console.error("[support] getOrCreateConversation failed:", error);
    return null;
  }
}

/** Append a message to a conversation and update its status bookkeeping. */
export async function addMessage(params: {
  conversationId: string;
  senderType: SenderType;
  body: string;
  name?: string | null;
}): Promise<SupportMessage | null> {
  if (!isDatabaseConfigured || !prisma) return null;

  const body = sanitizeBody(params.body);
  if (!body) return null;

  try {
    const now = new Date();

    const message = await prisma.message.create({
      data: {
        conversationId: params.conversationId,
        senderType: params.senderType,
        name: params.name?.slice(0, 120) ?? null,
        body,
        status: "sent",
      },
    });

    // An operator reply marks the thread "answered" (stamps answeredAt the
    // first time); a customer message reopens it.
    await prisma.conversation.update({
      where: { id: params.conversationId },
      data:
        params.senderType === "admin"
          ? { status: "answered", answeredAt: now, updatedAt: now }
          : { status: "open", updatedAt: now },
    });

    return mapMessage(message);
  } catch (error) {
    console.error("[support] addMessage failed:", error);
    return null;
  }
}

/** Load a conversation + thread for the CUSTOMER (guest token or user id). */
export async function getCustomerConversation(params: {
  conversationId: string;
  userId: string | null;
  guestToken: string | null;
}): Promise<CustomerConversation | null> {
  if (!isDatabaseConfigured || !prisma) return null;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conversation) return null;

    const ownsByUser =
      params.userId && conversation.userId === params.userId;
    const ownsByToken =
      !conversation.userId &&
      params.guestToken &&
      conversation.guestToken === params.guestToken;
    if (!ownsByUser && !ownsByToken) return null;

    return {
      id: conversation.id,
      status: conversation.status as CustomerConversation["status"],
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      messages: conversation.messages.map(mapMessage),
    };
  } catch (error) {
    console.error("[support] getCustomerConversation failed:", error);
    return null;
  }
}

/** Mark all customer messages in a thread as read (called when admin opens it). */
export async function markConversationRead(conversationId: string): Promise<void> {
  if (!isDatabaseConfigured || !prisma) return;
  try {
    await prisma.message.updateMany({
      where: { conversationId, senderType: "customer", readAt: null },
      data: { readAt: new Date() },
    });
  } catch (error) {
    console.error("[support] markConversationRead failed:", error);
  }
}

/** Set a conversation's status (open / answered / resolved) — admin only. */
export async function setConversationStatus(
  conversationId: string,
  status: "open" | "answered" | "resolved",
): Promise<boolean> {
  if (!isDatabaseConfigured || !prisma) return false;
  try {
    const now = new Date();
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status,
        resolvedAt: status === "resolved" ? now : null,
        updatedAt: now,
      },
    });
    return true;
  } catch (error) {
    console.error("[support] setConversationStatus failed:", error);
    return false;
  }
}

/** Admin inbox: paginated conversation summaries with customer data. */
export async function listAdminConversations(params: {
  status?: "open" | "answered" | "resolved" | "all";
  limit?: number;
  offset?: number;
}): Promise<{ conversations: AdminConversationSummary[]; total: number }> {
  if (!isDatabaseConfigured || !prisma) {
    return { conversations: [], total: 0 };
  }

  const limit = Math.min(Math.max(1, params.limit ?? 50), 100);
  const offset = Math.max(0, params.offset ?? 0);
  const where =
    params.status && params.status !== "all" ? { status: params.status } : {};

  try {
    const [rows, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            select: { body: true, senderType: true, createdAt: true },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    const conversations: AdminConversationSummary[] = rows.map((row) => {
      const last = row.messages[0] ?? null;
      const awaitingReply = last !== null && last.senderType === "customer";
      const customerMsgCount = row.messages.filter(
        (m) => m.senderType === "customer",
      ).length;

      return {
        id: row.id,
        status: row.status as AdminConversationSummary["status"],
        source: row.source,
        productSlug: row.productSlug,
        orderRef: row.orderRef,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        answeredAt: toIso(row.answeredAt),
        resolvedAt: toIso(row.resolvedAt),
        lastMessage: last
          ? {
              body: last.body,
              senderType: last.senderType === "admin" ? "admin" : "customer",
              createdAt: last.createdAt.toISOString(),
            }
          : null,
        messageCount: row.messages.length,
        unreadCustomerCount: awaitingReply ? customerMsgCount : 0,
        customer: {
          name: row.user?.name ?? null,
          email: row.user?.email ?? null,
          phone: null,
          userId: row.userId,
          isGuest: !row.userId,
        },
      };
    });

    return { conversations, total };
  } catch (error) {
    console.error("[support] listAdminConversations failed:", error);
    return { conversations: [], total: 0 };
  }
}


/** Admin detail: full thread + rich customer data (phone, order history). */
export async function getAdminConversation(
  conversationId: string,
): Promise<AdminConversationDetail | null> {
  if (!isDatabaseConfigured || !prisma) return null;

  try {
    const row = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!row) return null;

    let phone: string | null = null;
    let orderCount: number | null = null;
    let totalSpend: number | null = null;

    if (row.userId) {
      phone = await resolveCustomerPhone(row.userId);
      try {
        const [count, spend] = await Promise.all([
          prisma.order.count({ where: { userId: row.userId } }),
          prisma.order.aggregate({
            where: { userId: row.userId },
            _sum: { total: true },
          }),
        ]);
        orderCount = count;
        totalSpend = spend._sum.total ?? 0;
      } catch {
        // Order model fields may differ; leave as null rather than fail.
      }
    }

    return {
      id: row.id,
      status: row.status as AdminConversationDetail["status"],
      source: row.source,
      productSlug: row.productSlug,
      orderRef: row.orderRef,
      ip: row.ip,
      userAgent: row.userAgent,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      answeredAt: toIso(row.answeredAt),
      resolvedAt: toIso(row.resolvedAt),
      messages: row.messages.map(mapMessage),
      customer: {
        name: row.user?.name ?? null,
        email: row.user?.email ?? null,
        phone,
        userId: row.userId,
        isGuest: !row.userId,
        orderCount,
        totalSpend,
      },
    };
  } catch (error) {
    console.error("[support] getAdminConversation failed:", error);
    return null;
  }
}

/** Count of conversations currently awaiting an operator reply (status open). */
export async function countAwaitingReply(): Promise<number> {
  if (!isDatabaseConfigured || !prisma) return 0;
  try {
    return await prisma.conversation.count({ where: { status: "open" } });
  } catch {
    return 0;
  }
}

