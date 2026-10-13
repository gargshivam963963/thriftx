"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headphones,
  RefreshCw,
  Send,
  Search,
  User,
  Mail,
  Phone,
  ShoppingBag,
  IndianRupee,
  ExternalLink,
  CheckCircle2,
  Circle,
  Loader2,
  MessageSquare,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminPage from "@/components/admin/AdminPage";
import type {
  AdminConversationDetail,
  AdminConversationSummary,
} from "@/lib/support/types";

/**
 * Admin support inbox — human-operated chat.
 *
 * Left pane lists conversations (customer name/email/phone + last message +
 * awaiting-reply badge). Right pane shows the full thread and lets the operator
 * reply or resolve. Data is polled so new customer messages appear live.
 */

type StatusFilter = "all" | "open" | "answered" | "resolved";

const POLL_INTERVAL_MS = 10_000;

async function apiList(
  status: StatusFilter,
): Promise<{ conversations: AdminConversationSummary[]; awaitingReply: number }> {
  const res = await fetch(`/api/admin/support?status=${status}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load");
  const json = await res.json();
  return {
    conversations: json?.conversations ?? [],
    awaitingReply: json?.awaitingReply ?? 0,
  };
}

async function apiDetail(id: string): Promise<AdminConversationDetail | null> {
  const res = await fetch(`/api/admin/support/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.conversation ?? null;
}

async function apiReply(id: string, body: string): Promise<boolean> {
  const res = await fetch(`/api/admin/support/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  return res.ok;
}

async function apiStatus(
  id: string,
  status: "open" | "answered" | "resolved",
): Promise<boolean> {
  const res = await fetch(`/api/admin/support/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.ok;
}

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminSupportPage() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<AdminConversationSummary[]>(
    [],
  );
  const [awaitingReply, setAwaitingReply] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminConversationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async (silent = false) => {
    if (!silent) setLoadingList(true);
    try {
      const data = await apiList(status);
      setConversations(data.conversations);
      setAwaitingReply(data.awaitingReply);
    } catch (error) {
      console.error("Failed to load support conversations:", error);
    } finally {
      if (!silent) setLoadingList(false);
    }
  }, [status]);

  // Initial + filter-driven list load, plus live polling.
  useEffect(() => {
    void loadList();
    const t = setInterval(() => void loadList(true), POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [loadList]);

  const openConversation = useCallback(async (id: string) => {
    setSelectedId(id);
    setLoadingDetail(true);
    setReply("");
    try {
      const data = await apiDetail(id);
      setDetail(data);
      // Refresh the list so the awaiting-reply badge clears.
      void loadList(true);
    } finally {
      setLoadingDetail(false);
    }
  }, [loadList]);

  // Poll the open thread for new customer messages.
  useEffect(() => {
    if (!selectedId) return;
    const t = setInterval(async () => {
      const data = await apiDetail(selectedId);
      if (data) setDetail(data);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [selectedId]);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [detail?.messages.length, selectedId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        (c.customer.name ?? "").toLowerCase().includes(q) ||
        (c.customer.email ?? "").toLowerCase().includes(q) ||
        (c.customer.phone ?? "").toLowerCase().includes(q) ||
        (c.lastMessage?.body ?? "").toLowerCase().includes(q),
    );
  }, [conversations, search]);

  const handleSend = async () => {
    const body = reply.trim();
    if (!body || !selectedId || sending) return;
    setSending(true);
    try {
      const ok = await apiReply(selectedId, body);
      if (ok) {
        setReply("");
        const data = await apiDetail(selectedId);
        if (data) setDetail(data);
        void loadList(true);
      }
    } finally {
      setSending(false);
    }
  };

  const handleStatus = async (next: "open" | "answered" | "resolved") => {
    if (!selectedId) return;
    const ok = await apiStatus(selectedId, next);
    if (ok) {
      const data = await apiDetail(selectedId);
      if (data) setDetail(data);
      void loadList(true);
    }
  };


  return (
    <AdminPage width="wide">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
            <Headphones size={22} strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Support Inbox
            </h1>
            <p className="text-sm text-muted-foreground">
              Human-operated live chat with your customers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {awaitingReply > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <MessageSquare size={14} aria-hidden="true" />
              {awaitingReply} awaiting reply
            </span>
          )}
          <button
            type="button"
            onClick={() => void loadList()}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <RefreshCw
              size={15}
              className={loadingList ? "animate-spin" : ""}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3">
          <Search size={16} className="text-muted-foreground" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or message…"
            className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {(["all", "open", "answered", "resolved"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                status === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Two-pane inbox */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">

        {/* Conversation list */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">
              Conversations
            </h2>
            <span className="text-xs text-muted-foreground">
              {filtered.length} shown
            </span>
          </div>
          <div className="max-h-[560px] divide-y divide-border overflow-y-auto">
            {loadingList && conversations.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <Inbox size={28} className="text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">
                  No conversations yet
                </p>
                <p className="text-xs text-muted-foreground">
                  When a visitor messages from the storefront, it appears here.
                </p>
              </div>
            ) : (
              filtered.map((c) => {
                const active = c.id === selectedId;
                const awaiting = c.unreadCustomerCount > 0;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => void openConversation(c.id)}
                    className={cn(
                      "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors",
                      active ? "bg-accent" : "hover:bg-muted/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold text-foreground">
                          {(c.customer.name ?? c.customer.email ?? "G")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                        <span className="truncate text-sm font-semibold text-foreground">
                          {c.customer.name ??
                            (c.customer.isGuest ? "Guest" : "Customer")}
                        </span>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {c.lastMessage ? timeAgo(c.lastMessage.createdAt) : ""}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {c.lastMessage
                        ? `${c.lastMessage.senderType === "admin" ? "You: " : ""}${c.lastMessage.body}`
                        : "No messages"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                          c.status === "resolved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : c.status === "answered"
                              ? "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                        )}
                      >
                        {c.status}
                      </span>
                      {awaiting && (
                        <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                      )}
                      {c.customer.isGuest && (
                        <span className="text-[10px] text-muted-foreground">
                          guest
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread / detail */}
        <div className="flex min-h-[560px] flex-col rounded-2xl border border-border bg-card">
          {!selectedId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <MessageSquare
                size={30}
                className="text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-foreground">
                Select a conversation
              </p>
              <p className="text-xs text-muted-foreground">
                Pick a chat from the left to read and reply.
              </p>
            </div>
          ) : loadingDetail && !detail ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" /> Loading…
            </div>
          ) : detail ? (
            <>
              {/* Customer info bar */}
              <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <User size={14} aria-hidden="true" />
                    {detail.customer.name ??
                      (detail.customer.isGuest ? "Guest" : "Customer")}
                  </span>
                  {detail.customer.email && (
                    <a
                      href={`mailto:${detail.customer.email}`}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline"
                    >
                      <Mail size={14} aria-hidden="true" />
                      {detail.customer.email}
                    </a>
                  )}
                  {detail.customer.phone && (
                    <a
                      href={`tel:${detail.customer.phone}`}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline"
                    >
                      <Phone size={14} aria-hidden="true" />
                      {detail.customer.phone}
                    </a>
                  )}
                  {detail.customer.orderCount !== null && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <ShoppingBag size={14} aria-hidden="true" />
                      {detail.customer.orderCount} order
                      {detail.customer.orderCount === 1 ? "" : "s"}
                      {detail.customer.totalSpend !== null && (
                        <span className="flex items-center gap-0.5">
                          · <IndianRupee size={12} aria-hidden="true" />
                          {detail.customer.totalSpend.toLocaleString("en-IN")}
                        </span>
                      )}
                    </span>
                  )}
                  {detail.productSlug && (
                    <a
                      href={`/product/${detail.productSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sky-600 hover:underline dark:text-sky-400"
                    >
                      <ExternalLink size={14} aria-hidden="true" />
                      View product
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {detail.status === "resolved" ? (
                    <button
                      type="button"
                      onClick={() => void handleStatus("open")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <Circle size={13} aria-hidden="true" /> Reopen
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleStatus("resolved")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                      <CheckCircle2 size={13} aria-hidden="true" /> Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div
                ref={threadRef}
                className="flex-1 space-y-3 overflow-y-auto bg-muted/20 px-4 py-4"
              >
                {detail.messages.map((m) => {
                  const mine = m.senderType === "admin";
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex flex-col",
                        mine ? "items-end" : "items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                          mine
                            ? "rounded-br-md bg-foreground text-background"
                            : "rounded-bl-md bg-card text-card-foreground ring-1 ring-border",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {m.body}
                        </p>
                      </div>
                      <span className="mt-1 px-1 text-[11px] text-muted-foreground">
                        {clockTime(m.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Reply box */}
              <div className="border-t border-border bg-card px-3 py-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSend();
                  }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    rows={1}
                    placeholder="Type your reply… (Enter to send)"
                    aria-label="Reply"
                    maxLength={2000}
                    className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/30"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim() || sending}
                    aria-label="Send reply"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Send size={18} aria-hidden="true" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </AdminPage>
  );
}

