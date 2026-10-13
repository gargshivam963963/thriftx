"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { press } from "@/components/animations/Motion";
import { FilterTabs } from "@/components/notifications/notification-chrome";
import { filterPersonal, type NotificationFilter } from "@/components/notifications/notification-utils";
import { useNotificationCenter } from "@/components/notifications/use-notification-center";
import { InboxList, InboxSettings } from "./inbox-sections";

export default function NotificationsPage() {
    const center = useNotificationCenter();
    const { personal, announcements, readIds, unreadTotal, loading, marking, prefs, markAllRead } = center;
    const [tab, setTab] = useState<NotificationFilter>("all");

    const filteredPersonal = useMemo(() => (tab === "offers" ? [] : filterPersonal(personal, tab)), [personal, tab]);
    const visibleAnnouncements = tab === "all" || tab === "offers" ? announcements : [];
    const unreadIds = useMemo(() => announcements.filter((a) => !readIds.includes(a.id)).map((a) => a.id), [announcements, readIds]);
    const hasContent = filteredPersonal.length > 0 || visibleAnnouncements.length > 0;

    return (
        <main className="min-h-dvh bg-background pb-20">
            <Container className="max-w-3xl pt-6">
                <div className="flex items-center justify-between gap-3">
                    <Link href="/shop" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border text-foreground transition-colors hover:bg-muted" aria-label="Back to shop">
                        <ArrowLeft size={18} />
                    </Link>
                    {unreadTotal > 0 && (
                        <motion.button
                            type="button"
                            onClick={markAllRead}
                            disabled={marking}
                            whileTap={press.chipTap}
                            className="flex items-center gap-2 rounded-2xl bg-foreground px-4 py-2.5 text-small font-bold text-background shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            <CheckCheck size={15} />
                            {marking ? "Marking…" : "Mark all read"}
                        </motion.button>
                    )}
                </div>
                <div className="mt-5 flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-foreground text-background shadow-md">
                        <Bell size={24} aria-hidden="true" />
                    </span>
                    <div>
                        <h1 className="text-title font-extrabold tracking-tight text-foreground">Notifications</h1>
                        <p className="mt-0.5 text-body-sm text-muted-foreground">
                            {unreadTotal > 0 ? `${unreadTotal} unread — orders, shipping, returns & offers` : "You're all caught up"}
                        </p>
                    </div>
                </div>
                <div className="mt-5">
                    <FilterTabs value={tab} onChange={setTab} />
                </div>
                <InboxList
                    loading={loading}
                    hasContent={hasContent}
                    tab={tab}
                    filteredPersonal={filteredPersonal}
                    visibleAnnouncements={visibleAnnouncements}
                    unreadIds={unreadIds}
                />
                <InboxSettings prefs={prefs} onChange={center.setPrefs} />
            </Container>
        </main>
    );
}
