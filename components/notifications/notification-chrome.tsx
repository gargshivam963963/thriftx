"use client";

import { Bell, Check, CheckCheck, X } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { motionTokens, press } from "@/components/animations/Motion";
import { FILTERS, type NotificationFilter } from "./notification-utils";

export function FilterTabs({ value, onChange, counts }: { value: NotificationFilter; onChange: (n: NotificationFilter) => void; counts?: Partial<Record<NotificationFilter, number>> }) {
    return (
        <div role="tablist" aria-label="Filter notifications" className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-border bg-muted/60 p-1.5">
            {FILTERS.map((filter) => {
                const active = value === filter.id;
                const count = counts?.[filter.id];
                return (
                    <motion.button
                        key={filter.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(filter.id)}
                        whileTap={press.chipTap}
                        transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.standard }}
                        className={cn(
                            "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-small font-semibold transition-colors",
                            active ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:bg-background hover:text-foreground",
                        )}
                    >
                        {filter.label}
                        {typeof count === "number" && count > 0 && (
                            <span className={cn("flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold", active ? "bg-background/20 text-background" : "bg-foreground/10 text-foreground")}>
                                {count > 99 ? "99+" : count}
                            </span>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

export function EmptyInbox({ hasFilter }: { hasFilter: boolean }) {
    return (
        <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
                <Bell size={24} aria-hidden="true" />
            </span>
            <p className="mt-4 text-body-sm font-bold text-foreground">{hasFilter ? "Nothing here yet" : "You're all caught up"}</p>
            <p className="mt-1 max-w-60 text-small leading-relaxed text-muted-foreground">
                {hasFilter ? "No notifications match this filter. Try another tab." : "Order updates, shipping alerts and offers will land here."}
            </p>
        </div>
    );
}

export function DrawerHeader({ unreadTotal, marking, onMarkAll, onClose }: { unreadTotal: number; marking: boolean; onMarkAll: () => void; onClose: () => void }) {
    return (
        <div className="border-b border-border bg-card px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 id="notifications-title" className="text-title-sm font-extrabold tracking-tight text-foreground">Notifications</h2>
                    <p className="mt-0.5 text-small font-medium text-muted-foreground">{unreadTotal > 0 ? `${unreadTotal} unread` : "You're all caught up"}</p>
                </div>
                <div className="flex items-center gap-1">
                    {unreadTotal > 0 && (
                        <motion.button type="button" onClick={onMarkAll} disabled={marking} whileTap={press.chipTap} className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-small font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-50">
                            {marking ? <Check size={15} className="animate-pulse" /> : <CheckCheck size={15} />}
                            Mark all read
                        </motion.button>
                    )}
                    <motion.button type="button" onClick={onClose} aria-label="Close notifications" whileTap={press.iconTap} className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <X size={17} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
