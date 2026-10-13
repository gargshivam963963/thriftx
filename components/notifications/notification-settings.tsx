"use client";

import { BellRing, MessageCircle, Smartphone } from "lucide-react";

import { Switch } from "@/components/ui/Switch";
import type { NotificationPreferences } from "@/lib/notifications/types";

const CHANNELS: { key: "inapp" | "whatsapp" | "sms"; title: string; hint: string; icon: typeof BellRing }[] = [
    { key: "inapp", title: "In-app alerts", hint: "Bell + inbox, always instant", icon: BellRing },
    { key: "whatsapp", title: "WhatsApp", hint: "Order + shipping updates", icon: MessageCircle },
    { key: "sms", title: "SMS", hint: "Critical updates only", icon: Smartphone },
];

const CATEGORIES: { key: "orderUpdates" | "shippingUpdates" | "returnsRefunds" | "offersAnnouncements"; title: string; hint: string }[] = [
    { key: "orderUpdates", title: "Order updates", hint: "Placed, cancelled, delivered" },
    { key: "shippingUpdates", title: "Shipping updates", hint: "Shipped, tracking, out for delivery" },
    { key: "returnsRefunds", title: "Returns & refunds", hint: "Return status, refund progress" },
    { key: "offersAnnouncements", title: "Offers & announcements", hint: "Sales, new drops, news" },
];

export function ChannelSettings({ value, onChange }: { value: NotificationPreferences; onChange: (n: NotificationPreferences) => void }) {
    return (
        <div className="rounded-2xl border border-border bg-card">
            <p className="border-b border-border px-4 py-3 text-small font-bold uppercase tracking-wider text-muted-foreground">How you get notified</p>
            <ul className="divide-y divide-border">
                {CHANNELS.map((channel) => {
                    const Icon = channel.icon;
                    return (
                        <li key={channel.key} className="flex items-center gap-3 px-4 py-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                                <Icon size={16} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-body-sm font-semibold text-foreground">{channel.title}</span>
                                <span className="block text-small text-muted-foreground">{channel.hint}</span>
                            </span>
                            <Switch checked={value[channel.key]} onChange={(next) => onChange({ ...value, [channel.key]: next })} aria-label={channel.title} />
                        </li>
                    );
                })}
            </ul>
            <p className="border-t border-border px-4 py-3 text-small font-bold uppercase tracking-wider text-muted-foreground">What you hear about</p>
            <ul className="divide-y divide-border">
                {CATEGORIES.map((cat) => (
                    <li key={cat.key} className="flex items-center gap-3 px-4 py-3">
                        <span className="min-w-0 flex-1">
                            <span className="block text-body-sm font-semibold text-foreground">{cat.title}</span>
                            <span className="block text-small text-muted-foreground">{cat.hint}</span>
                        </span>
                        <Switch checked={value[cat.key]} onChange={(next) => onChange({ ...value, [cat.key]: next })} aria-label={cat.title} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
