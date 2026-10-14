"use client";

import Link from "next/link";
import { Megaphone } from "lucide-react";

import type { Announcement } from "@/lib/marketing/types";
import type { UserNotification } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";
import {
    PersonalTypeIcon,
    prettyMessage,
    timeAgo,
    typeAccent,
} from "./notification-utils";

export function PersonalRow({ item, onNavigate, onOpen }: { item: UserNotification; onNavigate?: () => void; onOpen?: (id: string) => void }) {
    const handleClick = () => {
        if (!item.read) onOpen?.(item.id);
        onNavigate?.();
    };
    const body = (
        <span className={cn("flex min-h-16 items-start gap-3 px-4 py-3.5", !item.read && "bg-foreground/[0.035]")}>
            <span className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", typeAccent(item.type))}>
                <PersonalTypeIcon type={item.type} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                    <span className={cn("text-body-sm leading-snug text-foreground", item.read ? "font-semibold" : "font-bold")}>{item.title}</span>
                    {!item.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
                </span>
                <span className="mt-0.5 block text-body-sm leading-relaxed text-muted-foreground">{prettyMessage(item.message)}</span>
                <span className="mt-1 block text-small font-medium text-muted-foreground/80">{timeAgo(item.createdAt)}</span>
            </span>
        </span>
    );
    if (item.href) {
        return <Link href={item.href} onClick={handleClick} className="block transition-colors hover:bg-muted/70">{body}</Link>;
    }
    if (!item.read) {
        return <button type="button" onClick={handleClick} className="block w-full text-left">{body}</button>;
    }
    return <div>{body}</div>;
}

export function AnnouncementRow({ item, unread }: { item: Announcement; unread: boolean }) {
    return (
        <>
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-600 dark:text-violet-400">
                <Megaphone size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                    <span className={cn("text-body-sm leading-relaxed text-foreground", unread ? "font-bold" : "font-medium")}>{item.message}</span>
                    {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
                </span>
                {item.linkHref && item.linkLabel && (
                    <span className="mt-1 block text-small font-semibold text-muted-foreground">{item.linkLabel}</span>
                )}
            </span>
        </>
    );
}
