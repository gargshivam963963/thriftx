"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Share2,
    Link2,
    MessageCircle,
    Mail,
    X,
    Check,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
    title: string;
    price: number;
}

/**
 * ShareButton — native sharing via navigator.share() with a
 * fallback popover (Copy Link / WhatsApp / Instagram / Email).
 */
export default function ShareButton({ title, price }: ShareButtonProps) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const getText = () =>
        `${title}\n\n₹${price.toLocaleString("en-IN")}\n\nOnly 1 Piece Available\n\nShop now on THRIFTX`;

    async function handleShare() {
        const url = window.location.href;

        const shareData = {
            title,
            text: getText(),
            url,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch {
                // User cancelled or sharing failed — fall through to popover
            }
        }

        setOpen(true);
    }

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            toast.success("Product link copied.");
            setTimeout(() => {
                setCopied(false);
                setOpen(false);
            }, 1200);
        } catch {
            toast.error("Unable to copy link.");
        }
    }

    function handleWhatsApp() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(getText());
        window.open(`https://wa.me/?text=${text}%20${url}`, "_blank", "noopener");
        setOpen(false);
    }

    function handleEmail() {
        const subject = encodeURIComponent(`${title} — THRIFTX`);
        const body = encodeURIComponent(`${getText()}\n\n${window.location.href}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        setOpen(false);
    }

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="iconMd"
                aria-label="Share Product"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={handleShare}
            >
                <Share2 className="h-5 w-5" />
            </Button>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60]"
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full z-tooltip mt-2 w-56 origin-top-right rounded-2xl border border-border bg-card p-2 shadow-float"
                        >
                            <div className="flex items-center justify-between px-2 py-1">
                                <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                                    Share
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="iconSm"
                                    onClick={() => setOpen(false)}
                                    aria-label="Close share menu"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="mt-1 space-y-0.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium text-foreground transition hover:bg-muted"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-success" />
                                    ) : (
                                        <Link2 className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    {copied ? "Copied!" : "Copy Link"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleWhatsApp}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium text-foreground transition hover:bg-muted"
                                >
                                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                                    WhatsApp
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleEmail}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium text-foreground transition hover:bg-muted"
                                >
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    Email
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
