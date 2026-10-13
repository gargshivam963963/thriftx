"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Headphones,
  Loader2,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import type { SupportMessage } from "@/lib/support/types";

/**
 * Floating support-chat launcher + window (human-operated).
 *
 * Visitors (guests or signed-in customers) message a real store operator who
 * replies from /admin/support. Identity: signed-in users are linked to their
 * account; guests carry a random token in localStorage. New operator replies are
 * picked up by light polling while the window is open.
 */

const GUEST_TOKEN_KEY = "thriftx_support_guest";
const CONVERSATION_KEY = "thriftx_support_conversation";
const POLL_INTERVAL_MS = 8000;

function loadGuestToken(): string | null {
  try {
    return localStorage.getItem(GUEST_TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveGuestToken(token: string) {
  try {
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

function loadConversationId(): string | null {
  try {
    return localStorage.getItem(CONVERSATION_KEY);
  } catch {
    return null;
  }
}

function saveConversationId(id: string) {
  try {
    localStorage.setItem(CONVERSATION_KEY, id);
  } catch {
    /* ignore */
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DisplayMessage extends SupportMessage {
  pending?: boolean;
}

export default function SupportChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore any existing conversation on mount.
  useEffect(() => {
    const stored = loadConversationId();
    if (stored) setConversationId(stored);
  }, []);

  // Prefill name for signed-in customers.
  useEffect(() => {
    if (user?.name && !name) setName(user.name);
  }, [user, name]);

  const guestHeaders = useCallback((): Record<string, string> => {
    const token = loadGuestToken();
    return token ? { "x-support-guest": token } : {};
  }, []);

  const fetchThread = useCallback(async () => {
    const id = conversationId ?? loadConversationId();
    if (!id) return;
    try {
      const res = await fetch(
        `/api/support?conversationId=${encodeURIComponent(id)}`,
        { cache: "no-store", headers: guestHeaders() },
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && Array.isArray(data.conversation?.messages)) {
        setMessages(data.conversation.messages);
      }
    } catch {
      /* ignore transient poll errors */
    }
  }, [conversationId, guestHeaders]);

  // Poll for new operator replies while the window is open.
  useEffect(() => {
    if (!open || !conversationId) return;
    void fetchThread();
    pollRef.current = setInterval(fetchThread, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, conversationId, fetchThread]);

  // Keep the thread scrolled to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const handleSend = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);

    const optimisticId = `local-${Date.now()}`;
    const optimistic: DisplayMessage = {
      id: optimisticId,
      senderType: "customer",
      name: name.trim() || user?.name || "You",
      body,
      status: "sending",
      readAt: null,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    try {
      const productSlug =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/product/")
          ? window.location.pathname.replace("/product/", "").slice(0, 120)
          : undefined;

      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...guestHeaders() },
        body: JSON.stringify({
          body,
          name: name.trim() || undefined,
          conversationId: conversationId ?? undefined,
          productSlug,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to send");
      }
      if (data.conversationId) {
        setConversationId(data.conversationId);
        saveConversationId(data.conversationId);
      }
      if (data.guestToken) saveGuestToken(data.guestToken);
      await fetchThread();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Couldn't send. Please try again.",
      );
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInput(body);
    } finally {
      setSending(false);
    }
  };

  const isGuest = !user;
  const needsName = isGuest && messages.length === 0 && !name.trim();


  return (
    <>
      {/* Launcher bubble */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            key="launcher"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            aria-label="Chat with us"
            className="fixed bottom-24 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-2xl ring-1 ring-black/10 transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
          >
            <MessageCircle size={24} strokeWidth={2} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="window"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            role="dialog"
            aria-label="Support chat"
            className="fixed bottom-0 right-0 z-[60] flex h-[100dvh] w-full flex-col overflow-hidden bg-card shadow-2xl sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100dvh-3rem)] sm:w-[400px] sm:rounded-3xl sm:ring-1 sm:ring-black/10"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-foreground px-4 py-3.5 text-background">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/15">
                <Headphones size={20} strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">
                  THRIFTX Support
                </p>
                <p className="flex items-center gap-1.5 text-xs text-background/70">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  We typically reply in a few minutes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-9 w-9 items-center justify-center rounded-full text-background/80 transition-colors hover:bg-background/15 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-4"
            >
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5">
                    <MessageCircle
                      size={26}
                      className="text-muted-foreground"
                      aria-hidden="true"
                    />
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Questions about a product, sizing, or your order? Send us a
                    message and a real person from our team will help.
                  </p>
                </div>
              )}

              {messages.map((m) => {
                const mine = m.senderType === "customer";
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
                        "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                        mine
                          ? "rounded-br-md bg-foreground text-background"
                          : "rounded-bl-md bg-card text-card-foreground ring-1 ring-border",
                      )}
                    >
                      {!mine && (
                        <p className="mb-0.5 text-[11px] font-semibold text-muted-foreground">
                          THRIFTX
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words">
                        {m.body}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "mt-1 flex items-center gap-1 px-1 text-[11px] text-muted-foreground",
                        mine ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <span>{formatTime(m.createdAt)}</span>
                      {mine &&
                        (m.pending ? (
                          <Loader2
                            size={12}
                            className="animate-spin"
                            aria-label="Sending"
                          />
                        ) : (
                          <CheckCheck size={13} aria-hidden="true" />
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <div className="border-t border-border bg-card px-3 py-3">
              {error && (
                <p className="mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              {needsName && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={60}
                  aria-label="Your name"
                  className="mb-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/30"
                />
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Type your message…"
                  aria-label="Message"
                  maxLength={2000}
                  className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-ring/30"
                />
                <button
                  type="submit"
                  disabled={
                    !input.trim() ||
                    sending ||
                    (needsName && !name.trim())
                  }
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {sending ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Send size={18} aria-hidden="true" />
                  )}
                </button>
              </form>
              <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
                Powered by THRIFTX · Human support
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

