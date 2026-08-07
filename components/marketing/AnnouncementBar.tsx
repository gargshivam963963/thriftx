"use client";


import { Button } from '@/components/ui/button';import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Megaphone, X } from "lucide-react";
import type { Announcement } from "@/lib/marketing/types";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export default function AnnouncementBar() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch("/api/marketing/announcements");
                const data = await res.json();
                if (active && data.success) {
                    setAnnouncements(data.announcements || []);
                }
            } catch {
                // Silently ignore — no announcements is a valid empty state.
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (announcements.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [announcements.length]);

    const hasAnnouncement = announcements.length > 0;
    const current = announcements[currentIndex];

    if (!hasAnnouncement || dismissed) return null;

    return (
        <div
            className={cn(
                "w-full bg-foreground text-background dark:bg-muted dark:text-foreground",
                current.bgColor && !current.bgColor.startsWith("#") ? "" : "",
            )}
        >
            <Container>
                <div className="relative flex h-10 items-center justify-center gap-3 px-9">
                    <Button
                        type="button"
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-background/50 transition hover:text-background dark:text-foreground/50 dark:hover:text-foreground"
                        onClick={() => setDismissed(true)}
                        aria-label="Dismiss announcement"
                    >
                        <X size={14} />
                    </Button>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="flex min-w-0 items-center gap-2"
                        >
                            <Megaphone
                                size={13}
                                className="shrink-0 text-background/60 dark:text-foreground/60"
                            />
                            <p className="truncate text-badge font-semibold uppercase tracking-wider">
                                {current.message}
                            </p>
                            {current.linkHref && (
                                <Link
                                    href={current.linkHref}
                                    className="group flex shrink-0 items-center gap-0.5 rounded-full bg-background/10 px-2.5 py-1 text-badge font-bold uppercase tracking-wider transition hover:bg-background/20 dark:bg-foreground/10 dark:hover:bg-foreground/20"
                                >
                                    {current.linkLabel || "Shop Now"}
                                    <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Dot indicators when multiple */}
                    {announcements.length > 1 && (
                        <div className="absolute right-0 flex items-center gap-1">
                            {announcements.map((_, i) => (
                                <Button
                                    key={i}
                                    type="button"
                                    onClick={() => setCurrentIndex(i)}
                                    className={cn(
                                        "h-1 rounded-full transition-all",
                                        i === currentIndex
                                            ? "w-4 bg-background dark:bg-foreground"
                                            : "w-1 bg-background/30 dark:bg-foreground/30",
                                    )}
                                    aria-label={`Announcement ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
