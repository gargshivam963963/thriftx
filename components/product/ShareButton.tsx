"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Link2, MessageCircle, Mail, Twitter, Instagram, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
    title: string;
    price: number;
}

/**
 * ShareButton — native sharing with graceful fallback menu.
 *
 * 1. Tries `navigator.share()` (native share sheet on mobile/desktop).
 * 2. If unavailable, opens an inline menu with Copy Link, WhatsApp,
 *    Twitter/X, Instagram, and Email options.
 */
export default function ShareButton({ title, price }: ShareButtonProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const buildShareData = () => {
        const url = window.location.href;
        return {
            url,
            text: `${title}\n\n₹${price.toLocaleString("en-IN")}\n\n🔥 1-of-1 curated piece — Shop now on THRIFTX`,
        };
    };

    async function handleShare() {
        const { url, text } = buildShareData();

        try {
            if (navigator.share) {
                await navigator.share({ title, text, url });
                return;
            }
            setOpen(true);
        } catch {
            // User cancelled native share — fall back to menu
            setOpen(true);
        }
    }

    async function copyLink() {
        const { url } = buildShareData();
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Product link copied");
            setOpen(false);
        } catch {
            toast.error("Unable to copy link");
        }
    }

    function openSocial(kind: "whatsapp" | "twitter" | "instagram" | "email") {
        const { url, text } = buildShareData();
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent(text);

        let href = "";
        switch (kind) {
            case "whatsapp":
                href = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
                break;
            case "twitter":
                href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
                break;
            case "instagram":
                href = `https://www.instagram.com/`;
                break;
            case "email":
                href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%20${encodedUrl}`;
                break;
        }
        window.open(href, "_blank", "noopener,noreferrer");
        setOpen(false);
    }

    const options = [
        { kind: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle },
        { kind: "twitter" as const, label: "Twitter / X", icon: Twitter },
        { kind: "instagram" as const, label: "Instagram", icon: Instagram },
        { kind: "email" as const, label: "Email", icon: Mail },
    ];

    return (
        <div className="relative" ref={ref}>
            <Button
                variant="outline"
                size="iconMd"
                aria-label="Share product"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={handleShare}
            >
                <Share2 className="h-5 w-5" />
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        role="menu"
                        className="absolute right-0 top-full z-[70] mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-float"
                    >
                        {options.map((opt) => (
                            <Button
                                key={opt.kind}
                                type="button"
                                variant="ghost"
                                size="sm"
                                fullWidth
                                role="menuitem"
                                onClick={() => openSocial(opt.kind)}
                                className="justify-start rounded-xl px-3 text-foreground"
                            >
                                <opt.icon className="h-4 w-4 text-muted-foreground" />
                                {opt.label}
                            </Button>
                        ))}
                        <div className="my-1.5 h-px bg-border" />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            fullWidth
                            role="menuitem"
                            onClick={copyLink}
                            className="justify-start rounded-xl px-3 text-foreground"
                        >
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                            Copy Link
                            <Check className="ml-auto h-3.5 w-3.5 text-success" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
