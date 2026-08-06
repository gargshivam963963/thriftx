"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Megaphone, X } from "lucide-react";
import type { Announcement } from "@/lib/marketing/types";

export default function AnnouncementBar() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch("/api/marketing/announcements");
                const data = await res.json();
                if (active && data.success) {
                    setAnnouncements(data.announcements || []);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to load announcements:", error);
                setLoading(false);
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

    if (loading) return null;
    if (announcements.length === 0 || dismissed) return null;

    const current = announcements[currentIndex];

    return (
        <div className={current.bgColor || "bg-foreground"}>
            <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2.5">
                <button
                    type="button"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white lg:left-6"
                    onClick={() => setDismissed(true)}
                    aria-label="Dismiss announcement"
                >
                    <X size={14} />
                </button>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="flex min-w-0 items-center gap-2"
                    >
                        <Megaphone size={13} className="shrink-0 text-white/60" />
                        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-white sm:text-xs">
                            {current.message}
                        </p>
                        {current.linkHref && (
                            <Link
                                href={current.linkHref}
                                className="group flex shrink-0 items-center gap-0.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-white/20"
                            >
                                {current.linkLabel || "Shop Now"}
                                <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Dot indicators when multiple */}
                {announcements.length > 1 && (
                    <div className="absolute right-4 flex items-center gap-1 lg:right-6">
                        {announcements.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setCurrentIndex(i)}
                                className={`h-1 rounded-full transition-all ${i === currentIndex ? "w-4 bg-white" : "w-1 bg-white/30"
                                    }`}
                                aria-label={`Announcement ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
