"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Expand,
    X,
    ZoomIn,
    ZoomOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getBlurPlaceholder } from "@/lib/imageOptimization";

interface ProductGalleryProps {
    title: string;
    primaryImage: string;
    images?: string[];
}

export default function ProductGallery({
    title,
    primaryImage,
    images = [],
}: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [zoomed, setZoomed] = useState(false);
    const [zoomScale, setZoomScale] = useState(2);
    const [transformOrigin, setTransformOrigin] = useState("50% 50%");
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const dragStartX = useRef(0);
    const lastTap = useRef(0);
    const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const gallery = useMemo(() => {
        const list = images.length > 0 ? images : [primaryImage];
        return [...new Set(list.filter(Boolean))];
    }, [primaryImage, images]);

    const galleryLength = gallery.length;
    const currentImage = gallery[selectedIndex] ?? gallery[0];

    const previous = useCallback(() => {
        setSelectedIndex((index) => (index - 1 + galleryLength) % galleryLength);
    }, [galleryLength]);

    const next = useCallback(() => {
        setSelectedIndex((index) => (index + 1) % galleryLength);
    }, [galleryLength]);

    // Reset internal state when the source image changes (edge case)
    const resetState = useCallback(() => {
        setZoomed(false);
        setZoomScale(2);
        setTransformOrigin("50% 50%");
        setDragX(0);
    }, []);

    // ── Keyboard navigation (always active) ────────────────────────────
    useEffect(() => {
        if (!fullscreen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault();
                    previous();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    next();
                    break;
                case "+":
                case "=":
                    setZoomScale((z) => Math.min(z + 0.25, 4));
                    setZoomed(true);
                    break;
                case "-":
                    setZoomScale((z) => Math.max(z - 0.25, 1));
                    break;
                case "Escape":
                    closeFullscreen();
                    break;
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [fullscreen, previous, next]);

    // ── Body scroll lock + focus management for fullscreen ─────────────
    useEffect(() => {
        if (!fullscreen) return;

        document.body.style.overflow = "hidden";
        closeButtonRef.current?.focus();

        const prevFocus = document.activeElement as HTMLElement | null;

        return () => {
            document.body.style.overflow = "";
            prevFocus?.focus();
        };
    }, [fullscreen]);

    // ── Preload neighbouring images (cache-friendly) ───────────────────
    useEffect(() => {
        const nextIndex = (selectedIndex + 1) % galleryLength;
        const prevIndex = (selectedIndex - 1 + galleryLength) % galleryLength;
        const preload = (src?: string) => {
            if (!src) return;
            const img = new window.Image();
            img.src = src;
        };

        preload(gallery[nextIndex]);
        preload(gallery[prevIndex]);
    }, [selectedIndex, gallery, galleryLength]);

    function openFullscreen() {
        setFullscreen(true);
    }

    function closeFullscreen() {
        setFullscreen(false);
        resetState();
    }

    // ── Mouse zoom ─────────────────────────────────────────────────────
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!zoomed || isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTransformOrigin(`${x}% ${y}%`);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        setZoomed(true);
        setZoomScale((prev) =>
            e.deltaY < 0 ? Math.min(prev + 0.2, 4) : Math.max(prev - 0.2, 1),
        );
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!zoomed) {
            setZoomed(true);
            setZoomScale(2.5);
        } else {
            resetState();
        }
    };

    const handleDoubleTap = () => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            if (!zoomed) {
                setZoomed(true);
                setZoomScale(2.5);
            } else {
                resetState();
            }
        }
        lastTap.current = now;
    };

    // ── Swipe (touch) ──────────────────────────────────────────────────
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
        handleDoubleTap();
    };

    const onTouchMove = (e: React.TouchEvent) => {
        const dx = e.targetTouches[0].clientX - touchStartX.current;
        const dy = e.targetTouches[0].clientY - touchStartY.current;
        // Only allow horizontal swipe when vertical movement is dominant
        if (Math.abs(dx) > Math.abs(dy)) {
            setDragX(dx);
        }
    };

    const onTouchEnd = () => {
        const finalX = dragX;
        setDragX(0);
        if (Math.abs(finalX) < 60) return;
        finalX < 0 ? next() : previous();
    };

    // ── Mouse drag ─────────────────────────────────────────────────────
    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartX.current = e.clientX;
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX.current;
        setDragX(dx);
    };

    const onMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        const finalX = dragX;
        setDragX(0);
        if (Math.abs(finalX) < 60) return;
        finalX < 0 ? next() : previous();
    };

    const imageAnimation = {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.04 },
        transition: { duration: 0.35, ease: "easeOut" as const },
    };

    // Hero image is priority; thumbnails lazy + blur
    const heroPriority = selectedIndex === 0;

    return (
        <>
            <div className="space-y-8">
                <div className="grid gap-5 lg:grid-cols-[96px_1fr]">
                    {/* ── Thumbnails ─────────────────────────────── */}
                    <div
                        className="order-2 flex gap-3 overflow-x-auto pb-2 lg:order-1 lg:flex-col lg:overflow-visible"
                        role="tablist"
                        aria-label="Product images"
                    >
                        {gallery.map((img, index) => {
                            const active = index === selectedIndex;
                            return (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    key={img}
                                    role="tab"
                                    aria-selected={active}
                                    aria-label={`View image ${index + 1}`}
                                    onClick={() => {
                                        setSelectedIndex(index);
                                        setIsLoaded(false);
                                    }}
                                    className={cn(
                                        "group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300",
                                        active
                                            ? "border-foreground ring-2 ring-foreground/10"
                                            : "border-border hover:border-foreground/50 hover:shadow-md",
                                    )}
                                >
                                    <Image
                                        src={img}
                                        alt={`${title} thumbnail ${index + 1}`}
                                        fill
                                        sizes="96px"
                                        priority={index === 0}
                                        blurDataURL={getBlurPlaceholder()}
                                        placeholder="blur"
                                        className="object-cover transition-all duration-500 group-hover:scale-110"
                                    />
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* ── Main Image ──────────────────────────────── */}
                    <div
                        className="group relative order-1 overflow-hidden rounded-[24px] border border-border bg-card shadow-sm"
                        onMouseMove={handleMouseMove}
                        onWheel={handleWheel}
                        onDoubleClick={handleDoubleClick}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                        onMouseLeave={() => {
                            setIsDragging(false);
                            setDragX(0);
                        }}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {/* Loading shimmer */}
                        {!isLoaded && (
                            <div className="absolute inset-0 z-10 overflow-hidden rounded-[24px]">
                                <div className="absolute inset-0 bg-muted" />
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentImage}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.04 }}
                                transition={{ duration: 0.35 }}
                                className="relative aspect-[6/5] w-full select-none"
                            >
                                <Image
                                    src={currentImage}
                                    alt={title}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 640px"
                                    priority={heroPriority}
                                    fetchPriority={heroPriority ? "high" : "auto"}
                                    draggable={false}
                                    blurDataURL={getBlurPlaceholder()}
                                    placeholder="blur"
                                    onLoadingComplete={() => setIsLoaded(true)}
                                    className="object-contain will-change-transform"
                                    style={{
                                        transform: `translateX(${dragX}px) scale(${zoomed ? zoomScale : 1})`,
                                        transformOrigin,
                                        transition: isDragging
                                            ? "none"
                                            : "transform .28s cubic-bezier(.22,.61,.36,1)",
                                    }}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Counter */}
                        <div className="absolute left-5 top-5 z-20 rounded-full border border-white/40 bg-white/80 px-3 py-1.5 text-small font-semibold text-black backdrop-blur-xl shadow-sm">
                            {selectedIndex + 1} / {galleryLength}
                        </div>

                        {/* Top actions */}
                        <div className="absolute right-5 top-5 z-20 flex flex-col gap-2">
                            <Button
                                variant="glass"
                                size="iconMd"
                                aria-label="Fullscreen"
                                onClick={openFullscreen}
                            >
                                <Expand className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Zoom controls (desktop hover) */}
                        {zoomed && (
                            <div className="absolute bottom-5 right-5 z-20 flex gap-2">
                                <Button
                                    variant="glass"
                                    size="iconSm"
                                    aria-label="Zoom out"
                                    onClick={() =>
                                        setZoomScale((z) => Math.max(z - 0.25, 1))
                                    }
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="glass"
                                    size="iconSm"
                                    aria-label="Zoom in"
                                    onClick={() =>
                                        setZoomScale((z) => Math.min(z + 0.25, 4))
                                    }
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Prev / Next */}
                        {galleryLength > 1 && (
                            <>
                                <Button
                                    variant="glass"
                                    size="iconMd"
                                    onClick={previous}
                                    aria-label="Previous image"
                                    className="absolute left-4 top-1/2 z-20 -translate-y-1/2"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="glass"
                                    size="iconMd"
                                    onClick={next}
                                    aria-label="Next image"
                                    className="absolute right-4 top-1/2 z-20 -translate-y-1/2"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Fullscreen Modal ─────────────────────────────────── */}
            <AnimatePresence>
                {fullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-modal flex items-center justify-center bg-black/95 backdrop-blur-lg"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Image fullscreen viewer"
                    >
                        <Button
                            ref={closeButtonRef}
                            variant="glass"
                            size="iconMd"
                            onClick={closeFullscreen}
                            aria-label="Close fullscreen"
                            className="absolute right-6 top-6 z-30"
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        <div className="relative flex h-full w-full items-center justify-center p-6">
                            {galleryLength > 1 && (
                                <>
                                    <Button
                                        variant="glass"
                                        size="iconLg"
                                        onClick={previous}
                                        aria-label="Previous image"
                                        className="absolute left-6 top-1/2 z-30 -translate-y-1/2"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </Button>
                                    <Button
                                        variant="glass"
                                        size="iconLg"
                                        onClick={next}
                                        aria-label="Next image"
                                        className="absolute right-6 top-1/2 z-30 -translate-y-1/2"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </Button>
                                </>
                            )}

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentImage}
                                    {...imageAnimation}
                                    className="relative flex h-full w-full items-center justify-center"
                                >
                                    <Image
                                        src={currentImage}
                                        alt={title}
                                        fill
                                        sizes="90vw"
                                        priority
                                        draggable={false}
                                        blurDataURL={getBlurPlaceholder()}
                                        placeholder="blur"
                                        className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain"
                                        style={{
                                            transform: `scale(${zoomed ? zoomScale : 1})`,
                                            transformOrigin,
                                            transition: "transform .28s cubic-bezier(.22,.61,.36,1)",
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-small font-medium text-white backdrop-blur-xl">
                                {selectedIndex + 1} / {galleryLength}
                            </div>

                            {/* Zoom hint on mobile */}
                            <div className="absolute bottom-6 right-6 z-30 hidden sm:flex gap-2">
                                <Button
                                    variant="glass"
                                    size="iconSm"
                                    onClick={() =>
                                        setZoomScale((z) => Math.max(z - 0.25, 1))
                                    }
                                    aria-label="Zoom out"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="glass"
                                    size="iconSm"
                                    onClick={() => {
                                        setZoomScale((z) => Math.min(z + 0.25, 4));
                                        setZoomed(true);
                                    }}
                                    aria-label="Zoom in"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
