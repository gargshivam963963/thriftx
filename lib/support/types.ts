/**
 * Shared types for the human-operated support chat.
 *
 * Design intent (see docs/AUDIT_THIRFY.md): support is HUMAN-OPERATED — there is
 * no AI/bot auto-reply. A visitor (guest or logged-in customer) opens a
 * conversation and a real store operator answers it from the admin inbox.
 */

export type SenderType = "customer" | "admin";

export type ConversationStatus = "open" | "answered" | "resolved";

export interface SupportMessage {
  id: string;
  senderType: SenderType;
  name: string | null;
  body: string;
  status: string;
  readAt: string | null;
  createdAt: string;
}

/** A conversation as seen by the CUSTOMER (no other-party PII leakage). */
export interface CustomerConversation {
  id: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

/** Lightweight row for the admin inbox list. */
export interface AdminConversationSummary {
  id: string;
  status: ConversationStatus;
  source: string | null;
  productSlug: string | null;
  orderRef: string | null;
  createdAt: string;
  updatedAt: string;
  answeredAt: string | null;
  resolvedAt: string | null;
  lastMessage: {
    body: string;
    senderType: SenderType;
    createdAt: string;
  } | null;
  messageCount: number;
  /** Count of customer messages the operator has not yet replied to. */
  unreadCustomerCount: number;
  customer: {
    name: string | null;
    email: string | null;
    phone: string | null;
    userId: string | null;
    isGuest: boolean;
  };
}

/** A single conversation as seen by the ADMIN (full thread + customer data). */
export interface AdminConversationDetail {
  id: string;
  status: ConversationStatus;
  source: string | null;
  productSlug: string | null;
  orderRef: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  answeredAt: string | null;
  resolvedAt: string | null;
  messages: SupportMessage[];
  customer: {
    name: string | null;
    email: string | null;
    phone: string | null;
    userId: string | null;
    isGuest: boolean;
    orderCount: number | null;
    totalSpend: number | null;
  };
}
