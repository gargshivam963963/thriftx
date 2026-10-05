"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    Bell,
    Check,
    Megaphone,
    PackageCheck,
    RotateCcw,
    Truck,
    Wallet,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import type { Announcement } from "@/lib/marketing/types";
import { useAuth } from "@/lib/AuthContext";
import type { UserNotification } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

const READ_ANNOUNCEMENTS_KEY = "thriftx:read-announcements";
const POLL_INTERVAL_MS = 60_000;

function readStoredIds(): string[] {
    try {
        const value = window.localStorage.getItem(READ_ANNOUNCEMENTS_KEY);
        if (!value) return [];
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed)
            ? parsed.filter((id): id is string => typeof id === "string")
            : [];
    } catch (error) {
        console.error("Could not read announcement state:", error);
        return [];
    }
}

export default function NotificationBell() {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [personal, setPersonal] = useState<UserNotification[]>([]);
    const personalRef = useRef<UserNotification[] | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [readIds, setReadIds] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const initialized = useRef(false);
    const announcementsRef = useRef<Announcement[]>([]);
    const requestInFlight = useRef(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const unreadIds = useMemo(
        () => announcements
            .filter((announcement) => !readIds.includes(announcement.id))
            .map((announcement) => announcement.id),
        [announcements, readIds],
    );

    const unreadPersonal = personal.filter((item) => !item.read).length;
    const unreadTotal = unreadIds.length + unreadPersonal;

    const persistReadIds = useCallback((ids: string[]) => {
        setReadIds(ids);
        try {
            window.localStorage.setItem(READ_ANNOUNCEMENTS_KEY, JSON.stringify(ids));
        } catch (storageError) {
            console.error("Could not save announcement state:", storageError);
        }
    }, []);

    const loadAnnouncements = useCallback(async () => {
        if (requestInFlight.current) return;
        requestInFlight.current = true;
        try {
            const response = await fetch("/api/marketing/announcements", {
                cache: "no-store",
                headers: { "Cache-Control": "no-cache" },
            });
            if (!response.ok) {
                throw new Error(`Unable to load announcements (${response.status}).`);
            }

            const data: { success?: boolean; announcements?: Announcement[] } =
                await response.json();
            if (!data.success || !Array.isArray(data.announcements)) {
                throw new Error("The announcements response was invalid.");
            }

            const nextAnnouncements = data.announcements
                .filter(
                    (item) =>
                        typeof item.id === "string" &&
                        item.id &&
                        typeof item.message === "string" &&
                        item.isActive,
                )
                .map((item) =>
                    item.linkHref && !/^(\/|https?:\/\/)/i.test(item.linkHref)
                        ? { ...item, linkHref: undefined, linkLabel: undefined }
                        : item,
                );

            if (initialized.current) {
                const priorIds = new Set(
                    announcementsRef.current.map((item) => item.id),
                );
                const newUpdates = nextAnnouncements.filter(
                    (item) => !priorIds.has(item.id),
                );
                if (newUpdates.length > 0) {
                    toast.info(
                        newUpdates.length === 1
                            ? "New THRIFTX update"
                            : `${newUpdates.length} new THRIFTX updates`,
                        {
                            description: newUpdates[0].message,
                            duration: 6000,
                        },
                    );
                }
            } else {
                initialized.current = true;
                setReadIds(readStoredIds());
            }

            announcementsRef.current = nextAnnouncements;
            setAnnouncements(nextAnnouncements);
            setError("");
        } catch (loadError) {
            console.error("Failed to load customer announcements:", loadError);
            setError("Updates couldn’t be loaded. Please try again.");
        } finally {
            setLoading(false);
            requestInFlight.current = false;
        }
    }, []);

    useEffect(() => {
        void loadAnnouncements();
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                void loadAnnouncements();
            }
        }, POLL_INTERVAL_MS);
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void loadAnnouncements();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [loadAnnouncements]);

    const loadPersonal = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await fetch("/api/notifications", {
                cache: "no-store",
            });
            if (!response.ok) return;
            const data: { success?: boolean; notifications?: UserNotification[] } =
                await response.json();
            if (!data.success || !Array.isArray(data.notifications)) return;

            const next = data.notifications;
            const prior = personalRef.current;
            if (prior) {
                const known = new Set(prior.map((item) => item.id));
                const fresh = next.filter((item) => !item.read && !known.has(item.id));
                fresh.slice(0, 2).forEach((item) =>
                    toast(item.title, { description: item.message, duration: 6000 }),
                );
            }
            personalRef.current = next;
            setPersonal(next);
        } catch (personalError) {
            console.error("Failed to load notifications:", personalError);
        }
    }, [userId]);

    useEffect(() => {
        personalRef.current = null;
        setPersonal([]);
        if (!userId) return;
        void loadPersonal();
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible") void loadPersonal();
        }, POLL_INTERVAL_MS);
        const onVisible = () => {
            if (document.visibilityState === "visible") void loadPersonal();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [userId, loadPersonal]);

    const markPersonalRead = useCallback(
        async (body: { all: true } | { ids: string[] }) => {
            setPersonal((items) =>
                items.map((item) =>
                    "all" in body || body.ids.includes(item.id)
                        ? { ...item, read: true }
                        : item,
                ),
            );
            try {
                await fetch("/api/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
            } catch (markError) {
                console.error("Could not mark notifications read:", markError);
            }
        },
        [],
    );

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                rootRef.current &&
                !rootRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const markAllRead = () => {
        persistReadIds(announcements.map((item) => item.id));
        if (unreadPersonal > 0) void markPersonalRead({ all: true });
    };

    const markRead = (id: string) => {
        if (!readIds.includes(id)) persistReadIds([...readIds, id]);
        setOpen(false);
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                aria-label={
                    unreadTotal
                        ? `Notifications, ${unreadTotal} unread`
                        : "Notifications"
                }
                aria-expanded={open}
                aria-controls="customer-notifications"
                onClick={() => setOpen((value) => !value)}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <Bell size={20} aria-hidden="true" />
                {unreadTotal > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white">
                        {unreadTotal > 9 ? "9+" : unreadTotal}
                    </span>
                )}
            </button>

            {open && (
                <section
                    id="customer-notifications"
                    role="region"
                    aria-label="Notifications"
                    className="absolute right-0 top-full z-[120] mt-2 flex max-h-[min(70dvh,32rem)] w-[min(22rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float"
                >
                    <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                        <div>
                            <h2 className="text-body-sm font-semibold text-foreground">
                                Updates
                            </h2>
                            <p className="mt-0.5 text-small text-muted-foreground">
                                {unreadTotal
                                    ? `${unreadTotal} unread`
                                    : "You’re all caught up"}
                            </p>
                        </div>
                        {unreadTotal > 0 && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-small font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Check size={15} aria-hidden="true" />
                                Mark all read
                            </button>
                        )}
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                        {loading ? (
                            <div className="space-y-3 p-4" role="status">
                                <div className="skeleton-glass h-14 rounded-xl" />
                                <div className="skeleton-glass h-14 rounded-xl" />
                                <span className="sr-only">Loading updates</span>
                            </div>
                        ) : error ? (
                            <div className="p-4">
                                <p className="text-body-sm text-error">{error}</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoading(true);
                                        void loadAnnouncements();
                                    }}
                                    className="mt-3 min-h-11 text-body-sm font-semibold text-foreground underline underline-offset-4"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : announcements.length === 0 && personal.length === 0 ? (
                            <p className="p-5 text-center text-body-sm text-muted-foreground">
                                No updates right now. Check back soon.
                            </p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {personal.map((item) => {
                                    const body = (
                                        <>
                                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                                <PersonalIcon type={item.type} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-body-sm font-semibold text-foreground">
                                                    {item.title}
                                                </span>
                                                <span className="mt-0.5 block text-small leading-relaxed text-muted-foreground">
                                                    {item.message}
                                                </span>
                                                <span className="mt-1 block text-small text-muted-foreground">
                                                    {timeAgo(item.createdAt)}
                                                </span>
                                            </span>
                                            {!item.read && (
                                                <span
                                                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-info"
                                                    aria-label="Unread"
                                                />
                                            )}
                                        </>
                                    );
                                    const rowClass = cn(
                                        "flex min-h-16 items-start gap-3 px-4 py-3",
                                        !item.read && "bg-muted/30",
                                    );
                                    return (
                                        <li key={item.id}>
                                            {item.href ? (
                                                <Link
                                                    href={item.href}
                                                    onClick={() => {
                                                        if (!item.read) {
                                                            void markPersonalRead({ ids: [item.id] });
                                                        }
                                                        setOpen(false);
                                                    }}
                                                    className={cn(
                                                        rowClass,
                                                        "transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                                                    )}
                                                >
                                                    {body}
                                                </Link>
                                            ) : (
                                                <div className={rowClass}>{body}</div>
                                            )}
                                        </li>
                                    );
                                })}
                                {announcements.map((item) => {
                                    const unread = !readIds.includes(item.id);
                                    return (
                                        <li key={item.id}>
                                            {item.linkHref ? (
                                                <Link
                                                    href={item.linkHref}
                                                    onClick={() => markRead(item.id)}
                                                    className={cn(
                                                        "flex min-h-16 items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                                                        unread && "bg-muted/30",
                                                    )}
                                                >
                                                    <NotificationItem
                                                        item={item}
                                                        unread={unread}
                                                    />
                                                </Link>
                                            ) : (
                                                <div
                                                    className={cn(
                                                        "flex min-h-16 items-start gap-3 px-4 py-3",
                                                        unread && "bg-muted/30",
                                                    )}
                                                >
                                                    <NotificationItem
                                                        item={item}
                                                        unread={unread}
                                                    />
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

function PersonalIcon({ type }: { type: UserNotification["type"] }) {
    const props = { size: 17, "aria-hidden": true } as const;
    switch (type) {
        case "order_shipped":
        case "tracking_ready":
            return <Truck {...props} />;
        case "order_cancelled":
            return <XCircle {...props} />;
        case "return_update":
            return <RotateCcw {...props} />;
        case "refund_update":
            return <Wallet {...props} />;
        default:
            return <PackageCheck {...props} />;
    }
}

function timeAgo(value: string) {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? "Yesterday" : `${days} days ago`;
}

function NotificationItem({
    item,
    unread,
}: {
    item: Announcement;
    unread: boolean;
}) {
    return (
        <>
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Megaphone size={17} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-body-sm font-medium leading-relaxed text-foreground">
                    {item.message}
                </span>
                {item.linkHref && item.linkLabel && (
                    <span className="mt-1 block text-small font-semibold text-muted-foreground">
                        {item.linkLabel}
                    </span>
                )}
            </span>
            {unread && (
                <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-info"
                    aria-label="Unread"
                />
            )}
        </>
    );
}
