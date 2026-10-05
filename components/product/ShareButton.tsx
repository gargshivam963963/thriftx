"use client";

import {
    useState,
    useRef,
    useEffect,
    useCallback,
} from "react";

import {
    Share2,
    Link2,
    MessageCircle,
    Mail,
    Smartphone,
    Check,
    X,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
    title: string;
    price: number;
}

export default function ShareButton({
    title,
    price,
}: ShareButtonProps) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [nativeSharing, setNativeSharing] = useState(false);

    const ref = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    const buildShareData = useCallback(() => {
        const url = window.location.href;

        const text = `${title} \n₹${price.toLocaleString(
            "en-IN",
        )
            } \n\nA 1 - of - 1 curated find from THRIFTX.`;

        return { url, text };
    }, [title, price]);

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (
                ref.current &&
                !ref.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);

            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);

    async function copyLink() {
        const { url } = buildShareData();

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                const input = document.createElement("textarea");

                input.value = url;
                input.style.position = "fixed";
                input.style.opacity = "0";

                document.body.appendChild(input);
                input.select();

                const success = document.execCommand("copy");
                input.remove();

                if (!success) {
                    throw new Error("Copy failed");
                }
            }

            setCopied(true);
            toast.success("Product link copied");

            copyTimeoutRef.current = setTimeout(() => {
                setCopied(false);
                setOpen(false);
            }, 900);
        } catch {
            toast.error("Unable to copy product link");
        }
    }

    async function shareNative() {
        const { url, text } = buildShareData();

        if (!navigator.share) {
            toast.error("Native sharing is not supported on this device");
            return;
        }

        try {
            setNativeSharing(true);

            await navigator.share({
                title: `THRIFTX | ${title} `,
                text,
                url,
            });

            setOpen(false);
        } catch (error) {
            if (
                error instanceof Error &&
                error.name !== "AbortError"
            ) {
                toast.error("Unable to open sharing options");
            }
        } finally {
            setNativeSharing(false);
        }
    }

    function openSocial(kind: "whatsapp" | "email") {
        const { url, text } = buildShareData();

        const message = `${text} \n${url} `;

        const href =
            kind === "whatsapp"
                ? `https://wa.me/?text=${encodeURIComponent(message)}`
                : `mailto:?subject=${encodeURIComponent(
                    `Check out ${title} on THRIFTX`,
                )}&body=${encodeURIComponent(message)}`;

        window.open(href, "_blank", "noopener,noreferrer");
        setOpen(false);
    }

    const options = [
        {
            label: "WhatsApp",
            icon: MessageCircle,
            action: () => openSocial("whatsapp"),
        },
        {
            label: "Email",
            icon: Mail,
            action: () => openSocial("email"),
        },
    ];

    return (
        <div className="relative" ref={ref}>
            <Button
                ref={triggerRef}
                type="button"
                variant="glass"
                size="iconMd"
                rounded="full"
                shadow="sm"
                aria-label="Share product"
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen((previous) => !previous)}
                className="
          relative isolate h-11 w-11 shrink-0 overflow-hidden
          border border-border/70
          bg-card/75 text-foreground
          shadow-sm backdrop-blur-xl
          transition-[transform,border-color,background-color,box-shadow]
          duration-300 ease-out
          hover:-translate-y-0.5
          hover:border-border
          hover:shadow-md
          active:translate-y-0 active:scale-90
          motion-reduce:transform-none motion-reduce:transition-none
        "
            >
                <motion.span
                    animate={{
                        rotate: open ? 12 : 0,
                        scale: open ? 0.94 : 1,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22,
                    }}
                    className="flex items-center justify-center"
                >
                    {open ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Share2 className="h-5 w-5" />
                    )}
                </motion.span>
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 30,
                        }}
                        role="dialog"
                        aria-label="Share this THRIFTX product"
                        className="
              absolute right-0 top-full z-[80] mt-3
              w-[min(19rem,calc(100vw-2rem))]
              origin-top-right overflow-hidden
              rounded-2xl border border-border
              bg-card p-3 text-card-foreground
              shadow-xl backdrop-blur-2xl
              ring-1 ring-foreground/[0.04]
            "
                    >
                        <div className="px-2 pb-3 pt-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                THRIFTX
                            </p>

                            <p className="mt-1 text-sm font-semibold leading-snug text-card-foreground">
                                Share this curated find
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {title} · ₹{price.toLocaleString("en-IN")}
                            </p>
                        </div>

                        <div className="h-px bg-border" />

                        <div className="space-y-1 py-2">
                            {options.map((option) => {
                                const Icon = option.icon;

                                return (
                                    <Button
                                        key={option.label}
                                        type="button"
                                        variant="ghost"
                                        size="lg"
                                        fullWidth
                                        onClick={option.action}
                                        className="
                      h-11 justify-start gap-3 rounded-xl
                      px-3 text-foreground
                      hover:bg-muted hover:text-foreground
                    "
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground">
                                            <Icon className="h-4 w-4" />
                                        </span>

                                        {option.label}
                                    </Button>
                                );
                            })}

                            {typeof navigator !== "undefined" &&
                                typeof navigator.share === "function" && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="lg"
                                        fullWidth
                                        disabled={nativeSharing}
                                        onClick={shareNative}
                                        className="
                      h-11 justify-start gap-3 rounded-xl
                      px-3 text-foreground
                      hover:bg-muted hover:text-foreground
                    "
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground">
                                            <Smartphone className="h-4 w-4" />
                                        </span>

                                        {nativeSharing
                                            ? "Opening…"
                                            : "More sharing options"}
                                    </Button>
                                )}
                        </div>

                        <div className="h-px bg-border" />

                        <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            fullWidth
                            onClick={copyLink}
                            className="
                mt-2 h-11 justify-start gap-3 rounded-xl
                border border-border
                px-3 text-secondary-foreground
              "
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                                {copied ? (
                                    <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <Link2 className="h-4 w-4" />
                                )}
                            </span>

                            {copied ? "Link copied" : "Copy product link"}

                            <span className="ml-auto text-xs text-muted-foreground">
                                {copied ? "Done" : "Copy"}
                            </span>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}