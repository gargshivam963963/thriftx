"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, Megaphone } from "lucide-react";
import { toast } from "sonner";

import type { Announcement } from "@/lib/marketing/types";
import { cn } from "@/lib/utils";

const READ_ANNOUNCEMENTS_KEY = "thriftx:read-announcements";
const POLL_INTERVAL_MS = 15_000;

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
                    unreadIds.length
                        ? `Notifications, ${unreadIds.length} unread`
                        : "Notifications"
                }
                aria-expanded={open}
                aria-controls="customer-notifications"
                onClick={() => setOpen((value) => !value)}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <Bell size={20} aria-hidden="true" />
                {unreadIds.length > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white">
                        {unreadIds.length > 9 ? "9+" : unreadIds.length}
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
                                {unreadIds.length
                                    ? `${unreadIds.length} unread`
                                    : "You’re all caught up"}
                            </p>
                        </div>
                        {unreadIds.length > 0 && (
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
                        ) : announcements.length === 0 ? (
                            <p className="p-5 text-center text-body-sm text-muted-foreground">
                                No updates right now. Check back soon.
                            </p>
                        ) : (
                            <ul className="divide-y divide-border">
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
