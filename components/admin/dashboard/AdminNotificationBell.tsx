"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
    Bell,
    Check,
    ShoppingBag,
    Truck,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Package,
} from "lucide-react";
import { toast } from "sonner";

import type { NotificationType, UserNotification } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 30_000;

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
    order_placed: ShoppingBag,
    order_processing: Package,
    order_shipped: Truck,
    order_delivered: CheckCircle2,
    order_cancelled: XCircle,
    tracking_ready: Truck,
    return_update: RotateCcw,
    refund_update: RotateCcw,
};

function timeAgo(value: string): string {
    const diff = Math.max(0, Date.now() - new Date(value).getTime());
    const mins = Math.round(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
}

/**
 * Store-owner notification bell for the admin panel. Polls the admin inbox and
 * pops a toast whenever a brand-new alert (e.g. a fresh order) arrives, so the
 * owner is notified live instead of having to open /admin/orders manually.
 */
export default function AdminNotificationBell() {
    const [items, setItems] = useState<UserNotification[]>([]);
    const [open, setOpen] = useState(false);
    const itemsRef = useRef<UserNotification[] | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const requestInFlight = useRef(false);

    const unreadCount = items.filter((item) => !item.read).length;

    const load = useCallback(async () => {
        if (requestInFlight.current) return;
        requestInFlight.current = true;
        try {
            const res = await fetch("/api/admin/notifications", { cache: "no-store" });
            if (!res.ok) return;
            const data: {
                success?: boolean;
                notifications?: UserNotification[];
            } = await res.json();
            if (!data.success || !Array.isArray(data.notifications)) return;

            const next = data.notifications;
            const prior = itemsRef.current;
            if (prior) {
                const known = new Set(prior.map((item) => item.id));
                const fresh = next.filter((item) => !item.read && !known.has(item.id));
                fresh.slice(0, 2).forEach((item) =>
                    toast.success(item.title, { description: item.message, duration: 6000 }),
                );
            }
            itemsRef.current = next;
            setItems(next);
        } catch (error) {
            console.error("Failed to load admin notifications:", error);
        } finally {
            requestInFlight.current = false;
        }
    }, []);

    useEffect(() => {
        itemsRef.current = null;
        void load();
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible") void load();
        }, POLL_INTERVAL_MS);
        const onVisible = () => {
            if (document.visibilityState === "visible") void load();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [load]);

    useEffect(() => {
        if (!open) return;
        const onClick = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    const markAllRead = async () => {
        try {
            await fetch("/api/admin/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ all: true }),
            });
            itemsRef.current = itemsRef.current?.map((item) => ({ ...item, read: true })) ?? null;
            setItems((prev) => prev.map((item) => ({ ...item, read: true })));
        } catch (error) {
            console.error("Failed to mark notifications read:", error);
        }
    };
    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Store notifications"
                aria-expanded={open}
                className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted",
                    open && "bg-muted",
                )}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 z-50 w-[340px] max-w-[85vw] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <span className="text-sm font-bold text-foreground">Notifications</span>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <Check size={13} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {items.length === 0 ? (
                                <div className="px-4 py-10 text-center">
                                    <Bell size={26} className="mx-auto mb-2 text-muted-foreground/50" />
                                    <p className="text-sm font-semibold text-foreground">No notifications yet</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        New orders &amp; updates will appear here.
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-border">
                                    {items.map((item) => {
                                        const Icon = TYPE_ICON[item.type] ?? Bell;
                                        return (
                                            <li key={item.id}>
                                                <Link
                                                    href={item.href || "/admin/orders"}
                                                    onClick={() => setOpen(false)}
                                                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                                                >
                                                    <span
                                                        className={cn(
                                                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                                            item.read
                                                                ? "bg-muted text-muted-foreground"
                                                                : "bg-primary/10 text-primary",
                                                        )}
                                                    >
                                                        <Icon size={15} />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className={cn(
                                                                "truncate text-xs text-foreground",
                                                                item.read ? "font-semibold" : "font-bold",
                                                            )}
                                                        >
                                                            {item.title}
                                                        </p>
                                                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                                            {item.message}
                                                        </p>
                                                        <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                                                            {timeAgo(item.createdAt)}
                                                        </p>
                                                    </div>
                                                    {!item.read && (
                                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

