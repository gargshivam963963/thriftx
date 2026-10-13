"use client";

import {
    PackageCheck,
    RotateCcw,
    Truck,
    Wallet,
    XCircle,
} from "lucide-react";

import type { UserNotification } from "@/lib/notifications/types";

export type NotificationFilter = "all" | "orders" | "shipping" | "returns" | "offers";

export const FILTERS: { id: NotificationFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "orders", label: "Orders" },
    { id: "shipping", label: "Shipping" },
    { id: "returns", label: "Returns" },
    { id: "offers", label: "Offers" },
];

const ORDER_TYPES: ReadonlySet<UserNotification["type"]> = new Set([
    "order_placed",
    "order_processing",
    "order_cancelled",
    "order_delivered",
]);

const SHIPPING_TYPES: ReadonlySet<UserNotification["type"]> = new Set([
    "order_shipped",
    "tracking_ready",
]);

const RETURN_TYPES: ReadonlySet<UserNotification["type"]> = new Set([
    "return_update",
    "refund_update",
]);

export function filterPersonal(items: UserNotification[], filter: NotificationFilter) {
    if (filter === "all") return items;
    if (filter === "orders") return items.filter((i) => ORDER_TYPES.has(i.type));
    if (filter === "shipping") return items.filter((i) => SHIPPING_TYPES.has(i.type));
    if (filter === "returns") return items.filter((i) => RETURN_TYPES.has(i.type));
    return items;
}

export function PersonalTypeIcon({ type }: { type: UserNotification["type"] }) {
    const props = { size: 18, "aria-hidden": true } as const;
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

export function typeAccent(type: UserNotification["type"]): string {
    switch (type) {
        case "order_cancelled":
            return "bg-destructive/12 text-destructive";
        case "order_delivered":
            return "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400";
        case "order_shipped":
        case "tracking_ready":
            return "bg-sky-500/12 text-sky-600 dark:text-sky-400";
        case "return_update":
        case "refund_update":
            return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
        default:
            return "bg-foreground/[0.06] text-foreground";
    }
}

export function timeAgo(value: string) {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return days === 1 ? "Yesterday" : `${days}d ago`;
}

/** Repair raw `#order_xxx` ids that leaked into older stored messages. */
export function prettyMessage(message: string): string {
    return message.replace(/#order_([A-Za-z0-9]+)/gi, (_, rest: string) => {
        const clean = String(rest).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        if (!clean) return "#ORDER";
        return `#${clean.slice(-6)}`;
    });
}
