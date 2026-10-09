"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clapperboard, Instagram, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import PremiumImage from "@/components/ui/PremiumImage";
import {
    FadeUp,
    StaggerContainer,
    StaggerItem,
} from "@/components/animations";
import { cn } from "@/lib/utils";
import { contactInfo } from "@/lib/contact";

// ─────────────────────────────────────────────────────────────────────────────
// Instagram / Lookbook Section
//
// Integration-ready: pass `items` from a server component. To go live with the
// Instagram Graph API, build the array there (map media URLs → `src`, set
// `type: "reel"` for VIDEO/MEDIA_TYPE_REEL, point `href` at the permalink) —
// nothing in this component needs to change.
//
// Two rules keep this section honest:
//   1. Tabs are derived from the data actually present. A "Reels" tab that
//      renders an empty grid is worse than no tab at all, so it is only shown
//      when at least one reel exists.
//   2. `filtered` compares against the active tab instead of short-circuiting
//      on it, so Posts really does show only posts.
// ─────────────────────────────────────────────────────────────────────────────

export interface InstagramMediaItem {
    id: string;
    type: "post" | "reel";
    src: string;
    alt: string;
    href: string;
    /** Optional hover overlay caption. */
    caption?: string;
}

interface InstagramFeedProps {
    handle?: string;
    /** Media to render. Empty array → the section renders its empty state. */
    items?: InstagramMediaItem[];
    /** Follow/profile URL. */
    profileUrl?: string;
    /**
     * Real follower count, formatted by the caller (e.g. "12K").
     * Omitted rather than invented — a made-up number here is a trust problem.
     */
    followerCount?: string;
}

const INSTAGRAM_HANDLE = "ThriftX";
const INSTAGRAM_PROFILE_URL = contactInfo.instagramUrl;

const tabConfig = [
    { key: "post", label: "Posts", icon: Instagram },
    { key: "reel", label: "Reels", icon: Clapperboard },
] as const;

type TabKey = (typeof tabConfig)[number]["key"];

export default function InstagramFeed({
    handle = INSTAGRAM_HANDLE,
    items = [],
    profileUrl = INSTAGRAM_PROFILE_URL,
    followerCount,
}: InstagramFeedProps) {
    const media = items;

    const availableTabs = tabConfig.filter(({ key }) =>
        media.some((item) => item.type === key),
    );

    // With a single media type the tab bar is pure decoration, so skip it.
    const showTabs = availableTabs.length > 1;

    const [activeTab, setActiveTab] = useState<TabKey>(
        availableTabs[0]?.key ?? "post",
    );

    // If injected data changes (or arrives without the active type), fall back
    // to a tab that actually has content instead of showing an empty grid.
    const effectiveTab = availableTabs.some((t) => t.key === activeTab)
        ? activeTab
        : (availableTabs[0]?.key ?? "post");

    const filtered = media.filter((item) => item.type === effectiveTab);

    return (
        <section className="bg-card/50 py-16 md:py-24">
            <Container>
                <FadeUp>
                    <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                        <div className="max-w-xl space-y-4">
                            <Badge variant="secondary" size="md" rounded="full">
                                <Instagram size={14} /> The Lookbook
                            </Badge>
                            <h2 className="text-h2 font-bold text-foreground">
                                Styled straight from our racks
                            </h2>
                            <p className="max-w-xl text-body text-muted-foreground">
                                Real pieces from our latest drops, photographed in-house.
                                Tap any shot to open the item — every one is single-stock,
                                so it goes to whoever checks out first.
                            </p>
                            {followerCount && (
                                <p className="inline-flex items-center gap-2 text-body font-semibold text-foreground">
                                    <Instagram size={18} className="text-muted-foreground" />
                                    {followerCount} followers
                                </p>
                            )}
                        </div>

                        <Link href={profileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="lg" leftIcon={<Instagram />}>
                                Follow @{handle}
                            </Button>
                        </Link>
                    </div>
                </FadeUp>

                {/* ── Tabs ─────────────────────────────────────────── */}
                {showTabs && (
                <div
                    role="tablist"
                    aria-label="Instagram content"
                    className="mb-8 inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1"
                >
                    {availableTabs.map(({ key, label, icon: Icon }) => (
                        <Button
                            key={key}
                            role="tab"
                            aria-selected={effectiveTab === key}
                            aria-label={`Show ${label}`}
                            onClick={() => setActiveTab(key)}
                            className={cn(
                                "relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-button transition-colors",
                                effectiveTab === key
                                    ? "text-background"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {effectiveTab === key && (
                                <motion.span
                                    layoutId="igTab"
                                    className="absolute inset-0 rounded-full bg-foreground"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <Icon size={16} className="relative z-10" />
                            <span className="relative z-10">{label}</span>
                        </Button>
                    ))}
                </div>
                )}

                {/* ── Media grid ───────────────────────────────────── */}
                {filtered.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-body text-muted-foreground">
                        No posts to show yet — follow{" "}
                        <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-foreground underline underline-offset-4"
                        >
                            @{handle}
                        </a>{" "}
                        for the latest drops.
                    </p>
                ) : (
                <StaggerContainer className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
                    {filtered.map((mediaItem) => {
                        // Instagram permalinks are external; our own product
                        // pages are internal and must navigate in-place.
                        const isInternal = mediaItem.href.startsWith("/");
                        return (
                        <StaggerItem key={mediaItem.id}>
                            <Link
                                href={mediaItem.href}
                                target={isInternal ? undefined : "_blank"}
                                rel={isInternal ? undefined : "noopener noreferrer"}
                                className="group block"
                                aria-label={mediaItem.alt}
                            >
                                <div className="relative aspect-square overflow-hidden rounded-2xl">
                                    <PremiumImage
                                        src={mediaItem.src}
                                        alt={mediaItem.alt}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 33vw"
                                        className="object-cover transition-all duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/40" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                                        <div className="rounded-full bg-card/90 p-3 shadow-lg backdrop-blur-sm">
                                            {mediaItem.type === "reel" ? (
                                                <Play className="h-5 w-5 fill-foreground text-foreground" />
                                            ) : (
                                                <Instagram className="h-5 w-5 text-foreground" />
                                            )}
                                        </div>
                                    </div>
                                    {mediaItem.type === "reel" && (
                                        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-badge font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                                            Reel
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </StaggerItem>
                        );
                    })}
                </StaggerContainer>
                )}
            </Container>
        </section>
    );
}
