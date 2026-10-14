"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnnouncementRow, PersonalRow } from "@/components/notifications/notification-rows";
import { EmptyInbox } from "@/components/notifications/notification-chrome";
import { ChannelSettings } from "@/components/notifications/notification-settings";

export function InboxList({ loading, hasContent, tab, filteredPersonal, visibleAnnouncements, unreadIds, onOpenPersonal, onOpenAnnouncement }: {
    loading: boolean;
    hasContent: boolean;
    tab: string;
    filteredPersonal: Parameters<typeof PersonalRow>[0]["item"][];
    visibleAnnouncements: Parameters<typeof AnnouncementRow>[0]["item"][];
    unreadIds: string[];
    onOpenPersonal?: (id: string) => void;
    onOpenAnnouncement?: (id: string) => void;
}) {
    return (
        <section aria-label="Notifications list" className={cn("mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-card")}>
            {loading ? (
                <div className="space-y-3 p-4" role="status" aria-label="Loading notifications">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton-glass h-20 rounded-2xl" />
                    ))}
                </div>
            ) : !hasContent ? (
                <EmptyInbox hasFilter={tab !== "all"} />
            ) : (
                <ul className="divide-y divide-border">
                    {filteredPersonal.map((item) => (
                        <li key={item.id}>
                            <PersonalRow item={item} onOpen={onOpenPersonal} />
                        </li>
                    ))}
                    {visibleAnnouncements.map((item) => (
                        <li key={item.id}>
                            {item.linkHref ? (
                                <Link href={item.linkHref} onClick={() => onOpenAnnouncement?.(item.id)} className="block transition-colors hover:bg-muted/70">
                                    <span className="flex min-h-16 items-start gap-3 px-4 py-3.5">
                                        <AnnouncementRow item={item} unread={unreadIds.includes(item.id)} />
                                    </span>
                                </Link>
                            ) : (
                                <button type="button" onClick={() => onOpenAnnouncement?.(item.id)} className="block w-full text-left">
                                    <span className="flex min-h-16 items-start gap-3 px-4 py-3.5">
                                        <AnnouncementRow item={item} unread={unreadIds.includes(item.id)} />
                                    </span>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export function InboxSettings({ prefs, onChange }: { prefs: Parameters<typeof ChannelSettings>[0]["value"]; onChange: Parameters<typeof ChannelSettings>[0]["onChange"] }) {
    return (
        <section aria-label="Notification settings" className="mt-6">
            <h2 className="mb-3 text-body font-bold text-foreground">Notification settings</h2>
            <ChannelSettings value={prefs} onChange={onChange} />
            <p className="mt-3 text-small leading-relaxed text-muted-foreground">
                WhatsApp and SMS are saved to this device and will light up fully once connected. In-app alerts work right now.
            </p>
        </section>
    );
}
