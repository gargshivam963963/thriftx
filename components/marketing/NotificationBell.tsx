"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motionTokens, press } from "@/components/animations/Motion";
import { AnnouncementRow, PersonalRow } from "@/components/notifications/notification-rows";
import { DrawerHeader, EmptyInbox, FilterTabs } from "@/components/notifications/notification-chrome";
import { ChannelSettings } from "@/components/notifications/notification-settings";
import { filterPersonal, type NotificationFilter } from "@/components/notifications/notification-utils";
import { useNotificationCenter } from "@/components/notifications/use-notification-center";

export default function NotificationBell() {
    const center = useNotificationCenter();
    const { personal, announcements, readIds, unreadTotal, loading, marking, prefs, markAllRead } = center;
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<NotificationFilter>("all");
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    }, [open]);

    const filteredPersonal = useMemo(() => (tab === "offers" ? [] : filterPersonal(personal, tab)), [personal, tab]);
    const visibleAnnouncements = tab === "all" || tab === "offers" ? announcements : [];
    const unreadIds = useMemo(() => announcements.filter((a) => !readIds.includes(a.id)).map((a) => a.id), [announcements, readIds]);
    const hasContent = filteredPersonal.length > 0 || visibleAnnouncements.length > 0;

    return (
        <>
            <motion.button
                type="button"
                aria-label={unreadTotal ? `Notifications, ${unreadTotal} unread` : "Notifications"}
                aria-expanded={open}
                onClick={() => setOpen(true)}
                whileTap={press.iconTap}
                className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200",
                    unreadTotal > 0
                        ? "border-foreground/15 bg-card text-foreground shadow-card"
                        : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
            >
                <Bell size={20} aria-hidden="true" />
                {unreadTotal > 0 && (
                    <motion.span
                        key={unreadTotal}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold leading-none text-white shadow-md ring-2 ring-background"
                    >
                        {unreadTotal > 9 ? "9+" : unreadTotal}
                    </motion.span>
                )}
            </motion.button>
            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {open && (
                            <>
                        <motion.div
                            key="notif-backdrop"
                            aria-hidden="true"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: motionTokens.duration.fast, ease: "easeOut" }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 z-notifications-backdrop bg-black/55 backdrop-blur-[2px]"
                        />
                        <motion.aside
                            key="notif-drawer"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="notifications-title"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 32, stiffness: 320 }}
                            className="fixed inset-y-0 right-0 z-notifications flex h-dvh max-h-dvh w-[min(26rem,100dvw)] flex-col border-l border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-2xl"
                        >
                            <DrawerHeader unreadTotal={unreadTotal} marking={marking} onMarkAll={markAllRead} onClose={() => setOpen(false)} />
                            <div className="shrink-0 border-b border-border bg-card px-4 py-3">
                                <FilterTabs value={tab} onChange={setTab} />
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-card [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable]">
                                {loading ? (
                                    <div className="space-y-3 p-4" role="status" aria-label="Loading notifications">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="skeleton-glass h-20 rounded-2xl" />
                                        ))}
                                        <span className="sr-only">Loading notifications</span>
                                    </div>
                                ) : showSettings ? (
                                    <div className="p-4">
                                        <ChannelSettings value={prefs} onChange={center.setPrefs} />
                                        <p className="mt-3 px-1 text-small leading-relaxed text-muted-foreground">
                                            WhatsApp and SMS are saved to this device and will light up fully once connected. In-app alerts work right now.
                                        </p>
                                    </div>
                                ) : !hasContent ? (
                                    <EmptyInbox hasFilter={tab !== "all"} />
                                ) : (
                                    <ul className="divide-y divide-border">
                                        {filteredPersonal.map((item) => (
                                            <li key={item.id}>
                                                <PersonalRow item={item} onNavigate={() => setOpen(false)} onOpen={(id) => void center.markOneRead(id)} />
                                            </li>
                                        ))}
                                        {visibleAnnouncements.map((item) => {
                                            const unread = unreadIds.includes(item.id);
                                            const openAnnouncement = () => {
                                                if (unread) center.markAnnouncementRead(item.id);
                                                setOpen(false);
                                            };
                                            return (
                                                <li key={item.id}>
                                                    {item.linkHref ? (
                                                        <Link href={item.linkHref} onClick={openAnnouncement} className="block transition-colors hover:bg-muted/70">
                                                            <span className="flex min-h-16 items-start gap-3 px-4 py-3.5">
                                                                <AnnouncementRow item={item} unread={unread} />
                                                            </span>
                                                        </Link>
                                                    ) : (
                                                        <button type="button" onClick={openAnnouncement} className="block w-full text-left">
                                                            <span className="flex min-h-16 items-start gap-3 px-4 py-3.5">
                                                                <AnnouncementRow item={item} unread={unread} />
                                                            </span>
                                                        </button>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                            <div className="shrink-0 border-t border-border bg-card px-4 py-3 [padding-bottom:env(safe-area-inset-bottom)]">
                                <div className="flex items-center gap-2">
                                <motion.button
                                    type="button"
                                    onClick={() => setShowSettings((v) => !v)}
                                    whileTap={press.chipTap}
                                    className={cn(
                                        "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-small font-bold transition-colors",
                                        showSettings ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted",
                                    )}
                                >
                                    <Settings2 size={15} aria-hidden="true" />
                                    {showSettings ? "Back to inbox" : "Notification settings"}
                                </motion.button>
                                <Link
                                    href="/notifications"
                                    onClick={() => setOpen(false)}
                                    className="flex flex-1 items-center justify-center rounded-xl bg-foreground px-3 py-2.5 text-small font-bold text-background transition-opacity hover:opacity-90"
                                >
                                    View all
                                </Link>
                            </div>
                        </div>
                    </motion.aside>
                    </>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
}
