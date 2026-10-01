"use client";

import {
    useMemo,
    useState,
    useEffect,
    useCallback,
    useRef,
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
import { BLUR_PLACEHOLDER } from "@/lib/imageOptimization";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    title: string;
    primaryImage: string;
    images?: string[];
}

/**
 * ProductGallery — premium, production-grade image gallery.
 *
 * - Sane, resilient image list (dedupes, filters empties)
 * - Keyboard navigation (← →, +/-, Escape) — always active, not just fullscreen
 * - Mouse drag + touch swipe on mobile
 * - Thumbnail selection
 * - Fullscreen mode with its own close button + Escape
 * - Blur-up loading with `blurDataURL`, `priority` hero, lazy non-hero images
 * - Responsive `sizes` to never load unnecessary resolutions
 */
export default function ProductGallery({
    title,
    primaryImage,
    images = [],
}: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [zoomed, setZoomed] = useState(false);
    const [zoomScale, setZoomScale] = useState(2);
    const [transformOrigin, setTransformOrigin] = useState("50% 50%");

    const dragStartX = useRef<number | null>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const lastTap = useRef(0);

    const gallery = useMemo(() => {
        const list = images.length > 0 ? images : [primaryImage];
        return [...new Set(list.filter(Boolean))];
    }, [primaryImage, images]);

    const galleryLength = gallery.length;
    const currentImage = gallery[selectedIndex] ?? gallery[0];

    const previous = useCallback(() => {
        setSelectedIndex((index) =>
            galleryLength > 0 ? (index - 1 + galleryLength) % galleryLength : 0,
        );
    }, [galleryLength]);

    const next = useCallback(() => {
        setSelectedIndex((index) =>
            galleryLength > 0 ? (index + 1) % galleryLength : 0,
        );
    }, [galleryLength]);

    /* ── Keyboard navigation — active in both normal + fullscreen ── */
    useEffect(() => {
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
                case "Escape":
                    if (fullscreen) {
                        setFullscreen(false);
                        setZoomed(false);
                        setZoomScale(2);
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [previous, next, fullscreen]);

    /* ── Lock body scroll while fullscreen ── */
    useEffect(() => {
        if (!fullscreen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [fullscreen]);

    /* ── Preload adjacent images ── */
    useEffect(() => {
        if (galleryLength <= 1) return;
        const nextIndex = (selectedIndex + 1) % galleryLength;
        const previousIndex = (selectedIndex - 1 + galleryLength) % galleryLength;
        [gallery[nextIndex], gallery[previousIndex]].forEach((src) => {
            if (!src) return;
            const img = new window.Image();
            img.src = src;
        });
    }, [selectedIndex, gallery, galleryLength]);

    /* ── Zoom handlers ── */
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!zoomed || !imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTransformOrigin(`${x}% ${y}%`);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!fullscreen) return;
        e.preventDefault();
        setZoomed(true);
        setZoomScale((prev) => {
            if (e.deltaY < 0) return Math.min(prev + 0.2, 4);
            return Math.max(prev - 0.2, 1);
        });
    };

    const handleDoubleClick = () => {
        setZoomed((z) => !z);
        setZoomScale(2.5);
    };

    const handleDoubleTap = () => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            handleDoubleClick();
        }
        lastTap.current = now;
    };

    /* ── Touch / drag swipe ── */
    const onTouchStart = (e: React.TouchEvent) => {
        dragStartX.current = e.targetTouches[0].clientX;
        handleDoubleTap();
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (dragStartX.current === null) return;
        const endX = e.changedTouches[0].clientX;
        const distance = dragStartX.current - endX;
        dragStartX.current = null;
        if (Math.abs(distance) < 60) return;
        if (distance > 0) next();
        else previous();
    };

    const onPointerDown = (e: React.PointerEvent) => {
        dragStartX.current = e.clientX;
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (dragStartX.current === null) return;
        const distance = dragStartX.current - e.clientX;
        dragStartX.current = null;
        if (Math.abs(distance) < 60) return;
        if (distance > 0) next();
        else previous();
    };

    const imageTransition = {
        duration: 0.35,
        ease: "easeOut" as const,
    };

    return (
        <>
            <div className="space-y-6">
                <div className="grid gap-5 lg:grid-cols-[96px_1fr]">
                    {/* ── Thumbnails ── */}
                    <div className="order-2 flex gap-3 overflow-x-auto pb-2 lg:order-1 lg:flex-col lg:overflow-visible lg:pb-0">
                        {gallery.map((img, index) => {
                            const active = index === selectedIndex;
                            return (
                                <Button
                                    key={`${img}-${index}`}
                                    type="button"
                                    variant={active ? "primary" : "outline"}
                                    size="iconXl"
                                    rounded="xl"
                                    onClick={() => setSelectedIndex(index)}
                                    aria-label={`View image ${index + 1}`}
                                    aria-current={active}
                                    className={cn(
                                        "group relative h-20 w-20 shrink-0 overflow-hidden border bg-card p-0 transition-all duration-300 lg:h-[88px] lg:w-[88px]",
                                        active
                                            ? "border-foreground shadow-lg ring-2 ring-foreground/10"
                                            : "border-border hover:border-foreground/50 hover:shadow-md",
                                    )}
                                >
                                    <Image
                                        src={img}
                                        alt={`${title} — thumbnail ${index + 1}`}
                                        fill
                                        sizes="88px"
                                        placeholder="blur"
                                        blurDataURL={BLUR_PLACEHOLDER}
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </Button>
                            );
                        })}
                    </div>

                    {/* ── Main Image ── */}
                    <div
                        ref={imageContainerRef}
                        className="group relative order-1 overflow-hidden rounded-[28px] border border-border bg-card shadow-sm"
                        onMouseMove={handleMouseMove}
                        onWheel={handleWheel}
                        onDoubleClick={handleDoubleClick}
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                        onPointerDown={onPointerDown}
                        onPointerUp={onPointerUp}
                        onPointerLeave={() => {
                            dragStartX.current = null;
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentImage}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={imageTransition}
                                className="relative"
                            >
                                <Image
                                    src={currentImage}
                                    alt={title}
                                    width={1600}
                                    height={2000}
                                    priority
                                    placeholder="blur"
                                    blurDataURL={BLUR_PLACEHOLDER}
                                    draggable={false}
                                    className="aspect-[6/5] w-full touch-pan-y select-none object-contain"
                                    style={{
                                        transformOrigin,
                                        transform: `scale(${zoomed ? zoomScale : 1})`,
                                        transition: "transform .28s cubic-bezier(.22,.61,.36,1)",
                                    }}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Counter */}
                        <div className="absolute left-5 top-5 z-20 rounded-full border border-border bg-background/80 px-3 py-1.5 text-small font-semibold text-foreground backdrop-blur-xl shadow-sm">
                            {selectedIndex + 1} / {galleryLength}
                        </div>

                        {/* Top action — fullscreen */}
                        <div className="absolute right-5 top-5 z-20">
                            <Button
                                variant="glass"
                                size="iconMd"
                                aria-label="Open fullscreen gallery"
                                onClick={() => setFullscreen(true)}
                            >
                                <Expand />
                            </Button>
                        </div>

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
                                    <ChevronLeft />
                                </Button>
                                <Button
                                    variant="glass"
                                    size="iconMd"
                                    onClick={next}
                                    aria-label="Next image"
                                    className="absolute right-4 top-1/2 z-20 -translate-y-1/2"
                                >
                                    <ChevronRight />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Fullscreen ── */}
            {/* ── Fullscreen ── */}
            <AnimatePresence>
                {fullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Fullscreen gallery"
                    >
                        {/* ── Close ── */}
                        <Button
                            type="button"
                            variant="glass"
                            size="iconMd"
                            rounded="full"
                            onClick={() => {
                                setFullscreen(false);
                                setZoomed(false);
                                setZoomScale(2);
                            }}
                            aria-label="Close fullscreen"
                            className="absolute right-5 top-5 z-40 border-white/20 bg-black/40 text-white shadow-lg shadow-black/20 backdrop-blur-md hover:bg-white/15 hover:text-white focus-visible:ring-white/80 focus-visible:ring-offset-black"
                        >
                            <X size={22} strokeWidth={2} />
                        </Button>

                        {/* ── Zoom controls ── */}
                        <div className="absolute bottom-5 right-5 z-40 flex items-center gap-2">
                            <Button
                                type="button"
                                variant="glass"
                                size="iconMd"
                                rounded="full"
                                onClick={() => {
                                    setZoomed(true);
                                    setZoomScale((z) => Math.min(z + 0.25, 4));
                                }}
                                disabled={zoomed && zoomScale >= 4}
                                aria-label="Zoom in"
                                className="border-white/20 bg-black/40 text-white shadow-lg shadow-black/20 backdrop-blur-md hover:bg-white/15 hover:text-white focus-visible:ring-white/80 focus-visible:ring-offset-black disabled:opacity-35"
                            >
                                <ZoomIn size={20} strokeWidth={2} />
                            </Button>

                            <Button
                                type="button"
                                variant="glass"
                                size="iconMd"
                                rounded="full"
                                onClick={() => {
                                    setZoomScale((z) => {
                                        const nextScale = Math.max(z - 0.25, 1);

                                        if (nextScale <= 1) {
                                            setZoomed(false);
                                        }

                                        return nextScale;
                                    });
                                }}
                                disabled={!zoomed || zoomScale <= 1}
                                aria-label="Zoom out"
                                className="border-white/20 bg-black/40 text-white shadow-lg shadow-black/20 backdrop-blur-md hover:bg-white/15 hover:text-white focus-visible:ring-white/80 focus-visible:ring-offset-black disabled:opacity-35"
                            >
                                <ZoomOut size={20} strokeWidth={2} />
                            </Button>
                        </div>

                        {/* ── Previous / Next ── */}
                        {galleryLength > 1 && (
                            <>
                                <Button
                                    type="button"
                                    variant="glass"
                                    size="iconMd"
                                    rounded="full"
                                    onClick={previous}
                                    aria-label="Previous image"
                                    className="absolute left-5 top-1/2 z-40 -translate-y-1/2 border-white/20 bg-black/40 text-white shadow-lg shadow-black/20 backdrop-blur-md hover:bg-white/15 hover:text-white focus-visible:ring-white/80 focus-visible:ring-offset-black"
                                >
                                    <ChevronLeft size={24} strokeWidth={2} />
                                </Button>

                                <Button
                                    type="button"
                                    variant="glass"
                                    size="iconMd"
                                    rounded="full"
                                    onClick={next}
                                    aria-label="Next image"
                                    className="absolute right-5 top-1/2 z-40 -translate-y-1/2 border-white/20 bg-black/40 text-white shadow-lg shadow-black/20 backdrop-blur-md hover:bg-white/15 hover:text-white focus-visible:ring-white/80 focus-visible:ring-offset-black"
                                >
                                    <ChevronRight size={24} strokeWidth={2} />
                                </Button>
                            </>
                        )}

                        {/* ── Fullscreen image area ── */}
                        <div
                            className="relative flex h-full w-full select-none items-center justify-center p-6 sm:p-12"
                            onWheel={handleWheel}
                            onDoubleClick={handleDoubleClick}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                            onPointerDown={onPointerDown}
                            onPointerUp={onPointerUp}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentImage}
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.03 }}
                                    transition={imageTransition}
                                    className="relative flex h-full w-full items-center justify-center"
                                >
                                    <Image
                                        src={currentImage}
                                        alt={title}
                                        width={1800}
                                        height={2200}
                                        priority
                                        placeholder="blur"
                                        blurDataURL={BLUR_PLACEHOLDER}
                                        draggable={false}
                                        className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain"
                                        style={{
                                            transform: `scale(${zoomed ? zoomScale : 1})`,
                                            transition:
                                                "transform .28s cubic-bezier(.22,.61,.36,1)",
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* ── Counter ── */}
                            <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-small font-medium text-white backdrop-blur-xl">
                                {selectedIndex + 1} / {galleryLength}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
