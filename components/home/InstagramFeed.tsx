"use client";

import { useEffect, useState } from "react";
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
// Instagram Community Section
// Reusable and integration-ready: swap the STATIC_POSTS source with a live
// Instagram API/Graph responder by implementing `fetchInstagramContent()`.
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
    /** Optional injected data (e.g. from a server component). */
    items?: InstagramMediaItem[];
    /** Follow/profile URL. */
    profileUrl?: string;
    followerCount?: string;
}

const INSTAGRAM_HANDLE = "ThriftX";
const INSTAGRAM_PROFILE_URL = contactInfo.instagramUrl;

// Static fallback content — replace with live API data when available.
const STATIC_POSTS: InstagramMediaItem[] = [
    "/images/instagram/1.jpg",
    "/images/instagram/2.jpg",
    "/images/instagram/3.jpg",
    "/images/instagram/4.jpg",
    "/images/instagram/5.jpg",
    "/images/instagram/6.jpg",
].map((src, i) => ({
    id: `post-${i}`,
    type: "post" as const,
    src,
    alt: `THRIFTX Instagram post ${i + 1}`,
    href: INSTAGRAM_PROFILE_URL,
}));

const tabConfig = [
    { key: "post", label: "Posts", icon: Instagram },
    { key: "reel", label: "Reels", icon: Clapperboard },
] as const;

type TabKey = (typeof tabConfig)[number]["key"];

export default function InstagramFeed({
    handle = INSTAGRAM_HANDLE,
    items = STATIC_POSTS,
    profileUrl = INSTAGRAM_PROFILE_URL,
    followerCount = "12K+",
}: InstagramFeedProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("post");
    const [media, setMedia] = useState<InstagramMediaItem[]>(items);

    // Keep in sync if parent injects new data.
    useEffect(() => {
        setMedia(items);
    }, [items]);

    const filtered = media.filter(
        (item) => activeTab === "post" || item.type === "reel",
    );

    return (
        <section className="bg-card py-16 md:py-24">
            <Container>
                <FadeUp>
                    <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                        <div className="max-w-xl space-y-4">
                            <Badge variant="secondary" size="md" rounded="full">
                                <Instagram size={14} /> Instagram Community
                            </Badge>
                            <h2 className="text-h2 font-bold text-foreground">
                                Join our journey on Instagram
                            </h2>
                            <p className="max-w-xl text-body text-muted-foreground">
                                Watch styling videos, new arrivals, thrift finds, behind-the-scenes
                                content and exclusive drops. Follow <span className="font-semibold text-foreground">@{handle}</span> and
                                never miss a moment.
                            </p>
                            <p className="inline-flex items-center gap-2 text-body font-semibold text-foreground">
                                <Instagram size={18} className="text-muted-foreground" />
                                {followerCount} followers
                            </p>
                        </div>

                        <Link href={profileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="lg" leftIcon={<Instagram />}>
                                Follow @{handle}
                            </Button>
                        </Link>
                    </div>
                </FadeUp>

                {/* ── Tabs ─────────────────────────────────────────── */}
                <div
                    role="tablist"
                    aria-label="Instagram content"
                    className="mb-8 inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1"
                >
                    {tabConfig.map(({ key, label, icon: Icon }) => (
                        <Button
                            key={key}
                            role="tab"
                            aria-selected={activeTab === key}
                            aria-label={`Show ${label}`}
                            onClick={() => setActiveTab(key)}
                            className={cn(
                                "relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-button transition-colors",
                                activeTab === key
                                    ? "text-background"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {activeTab === key && (
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

                {/* ── Media grid ───────────────────────────────────── */}
                <StaggerContainer className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
                    {filtered.map((mediaItem) => (
                        <StaggerItem key={mediaItem.id}>
                            <Link
                                href={mediaItem.href}
                                target="_blank"
                                rel="noopener noreferrer"
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
                    ))}
                </StaggerContainer>
            </Container>
        </section>
    );
}
