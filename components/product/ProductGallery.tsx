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
import { BLUR_PLACEHOLDER } from "@/lib/imageOptimization";
import { cn } from "@/lib/utils";
import { transitions } from "@/components/animations/Motion";

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
    const gallery = useMemo(() => {
        const sources = [primaryImage, ...images].filter(
            (src): src is string =>
                typeof src === "string" && src.trim().length > 0,
        );

        return [...new Set(sources)];
    }, [primaryImage, images]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [zoomed, setZoomed] = useState(false);
    const [zoomScale, setZoomScale] = useState(2);
    const [transformOrigin, setTransformOrigin] = useState("50% 50%");

    const dragStartX = useRef<number | null>(null);
    const lastTap = useRef(0);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const galleryLength = gallery.length;
    const currentImage = gallery[selectedIndex] ?? primaryImage;

    const previous = useCallback(() => {
        setSelectedIndex((index) =>
            galleryLength > 1
                ? (index - 1 + galleryLength) % galleryLength
                : 0,
        );
        setZoomed(false);
        setZoomScale(2);
    }, [galleryLength]);

    const next = useCallback(() => {
        setSelectedIndex((index) =>
            galleryLength > 1 ? (index + 1) % galleryLength : 0,
        );
        setZoomed(false);
        setZoomScale(2);
    }, [galleryLength]);

    const closeFullscreen = useCallback(() => {
        setFullscreen(false);
        setZoomed(false);
        setZoomScale(2);
    }, []);

    useEffect(() => {
        if (!fullscreen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [fullscreen]);

    useEffect(() => {
        if (!fullscreen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeFullscreen();
            if (event.key === "ArrowLeft") previous();
            if (event.key === "ArrowRight") next();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [fullscreen, closeFullscreen, previous, next]);

    useEffect(() => {
        if (galleryLength < 2) return;

        const adjacent = [
            gallery[(selectedIndex + 1) % galleryLength],
            gallery[(selectedIndex - 1 + galleryLength) % galleryLength],
        ];

        adjacent.forEach((src) => {
            if (!src) return;
            const image = new window.Image();
            image.src = src;
        });
    }, [selectedIndex, gallery, galleryLength]);

    const handleMouseMove = (
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        if (!zoomed || !imageContainerRef.current) return;

        const rect = imageContainerRef.current.getBoundingClientRect();

        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        setTransformOrigin(`${x}% ${y}%`);
    };

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        if (!fullscreen) return;

        event.preventDefault();
        setZoomed(true);

        setZoomScale((scale) =>
            event.deltaY < 0
                ? Math.min(scale + 0.2, 4)
                : Math.max(scale - 0.2, 1),
        );
    };

    const toggleZoom = () => {
        setZoomed((value) => !value);
        setZoomScale(2.5);
    };

    const handleTouchStart = (event: React.TouchEvent) => {
        dragStartX.current = event.touches[0]?.clientX ?? null;

        const now = Date.now();

        if (now - lastTap.current < 300) {
            toggleZoom();
        }

        lastTap.current = now;
    };

    const handleTouchEnd = (event: React.TouchEvent) => {
        if (dragStartX.current === null) return;

        const distance =
            dragStartX.current - (event.changedTouches[0]?.clientX ?? 0);

        dragStartX.current = null;

        if (Math.abs(distance) < 60) return;

        if (distance > 0) next();
        else previous();
    };

    const handlePointerDown = (event: React.PointerEvent) => {
        if (event.pointerType === "mouse") {
            dragStartX.current = event.clientX;
        }
    };

    const handlePointerUp = (event: React.PointerEvent) => {
        if (event.pointerType !== "mouse" || dragStartX.current === null) {
            return;
        }

        const distance = dragStartX.current - event.clientX;
        dragStartX.current = null;

        if (Math.abs(distance) < 60) return;

        if (distance > 0) next();
        else previous();
    };

    const imageSizes =
        "(max-width: 639px) calc(100vw - 32px), " +
        "(max-width: 1023px) calc(100vw - 64px), " +
        "(max-width: 1279px) 58vw, 680px";

    return (
        <>
            <section className="w-full min-w-0 space-y-4 sm:space-y-5">
                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[84px_minmax(0,1fr)] lg:gap-4">

                    {/* Thumbnails */}
                    {galleryLength > 1 && (
                        <div
                            aria-label="Product image thumbnails"
                            className="order-2 flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:pb-0"
                        >
                            {gallery.map((src, index) => {
                                const active = index === selectedIndex;

                                return (
                                    <button
                                        key={`${src}-${index}`}
                                        type="button"
                                        onClick={() => {
                                            setSelectedIndex(index);
                                            setZoomed(false);
                                        }}
                                        aria-label={`View product image ${index + 1}`}
                                        aria-pressed={active}
                                        className={cn(
                                            "relative aspect-[4/5] w-[64px] shrink-0 overflow-hidden rounded-xl border bg-muted/30 transition-all duration-200 sm:w-full sm:rounded-2xl",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                            active
                                                ? "border-foreground ring-2 ring-foreground/15"
                                                : "border-border/60 hover:border-foreground/40",
                                        )}
                                    >
                                        <Image
                                            src={src}
                                            alt={`${title}, view ${index + 1}`}
                                            fill
                                            sizes="(max-width: 639px) 64px, 84px"
                                            quality={75}
                                            loading="lazy"
                                            placeholder="blur"
                                            blurDataURL={BLUR_PLACEHOLDER}
                                            className="object-cover"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Main image */}
                    <div
                        ref={imageContainerRef}
                        className="group relative order-1 min-w-0 overflow-hidden rounded-[24px] border border-border/60 bg-muted/20 shadow-sm sm:order-2 sm:rounded-[28px]"
                        onMouseMove={handleMouseMove}
                        onDoubleClick={toggleZoom}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={() => {
                            dragStartX.current = null;
                        }}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={currentImage}
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0.5 }}
                                transition={transitions.micro}
                                className="relative aspect-[4/5] w-full"
                            >
                                <Image
                                    src={currentImage}
                                    alt={title}
                                    fill
                                    priority={selectedIndex === 0}
                                    loading={selectedIndex === 0 ? "eager" : "lazy"}
                                    fetchPriority={selectedIndex === 0 ? "high" : "auto"}
                                    sizes={imageSizes}
                                    quality={82}
                                    placeholder="blur"
                                    blurDataURL={BLUR_PLACEHOLDER}
                                    draggable={false}
                                    className="select-none object-contain"
                                    style={{
                                        transformOrigin,
                                        transform: `scale(${zoomed ? zoomScale : 1})`,
                                        transition:
                                            "transform .28s cubic-bezier(.22,.61,.36,1)",
                                    }}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Image counter */}
                        <div className="absolute left-3 top-3 z-10 rounded-full border border-border/50 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-xl sm:left-5 sm:top-5">
                            {selectedIndex + 1} / {galleryLength}
                        </div>

                        {/* Fullscreen */}
                        <Button
                            type="button"
                            variant="glass"
                            size="iconMd"
                            aria-label="Open fullscreen gallery"
                            onClick={() => setFullscreen(true)}
                            className="absolute right-3 top-3 z-10 sm:right-5 sm:top-5"
                        >
                            <Expand />
                        </Button>

                        {galleryLength > 1 && (
                            <>
                                <Button
                                    type="button"
                                    variant="glass"
                                    size="iconMd"
                                    aria-label="Previous image"
                                    onClick={previous}
                                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 opacity-100 transition-opacity sm:left-4 sm:opacity-0 sm:group-hover:opacity-100"
                                >
                                    <ChevronLeft />
                                </Button>

                                <Button
                                    type="button"
                                    variant="glass"
                                    size="iconMd"
                                    aria-label="Next image"
                                    onClick={next}
                                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 opacity-100 transition-opacity sm:right-4 sm:opacity-0 sm:group-hover:opacity-100"
                                >
                                    <ChevronRight />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Fullscreen gallery */}
            <AnimatePresence>
                {fullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Fullscreen product gallery"
                        onWheel={handleWheel}
                    >
                        <Button
                            type="button"
                            variant="glass"
                            size="iconMd"
                            rounded="full"
                            onClick={closeFullscreen}
                            aria-label="Close fullscreen gallery"
                            className="absolute right-4 top-4 z-50 border-white/20 bg-black/40 text-white hover:bg-white/15 hover:text-white sm:right-6 sm:top-6"
                        >
                            <X size={22} />
                        </Button>

                        <div className="absolute bottom-5 right-5 z-50 flex gap-2">
                            <Button
                                type="button"
                                variant="glass"
                                size="iconMd"
                                rounded="full"
                                disabled={zoomScale >= 4 && zoomed}
                                aria-label="Zoom in"
                                onClick={() => {
                                    setZoomed(true);
                                    setZoomScale((scale) => Math.min(scale + 0.25, 4));
                                }}
                                className="border-white/20 bg-black/40 text-white hover:bg-white/15 hover:text-white"
                            >
                                <ZoomIn />
                            </Button>

                            <Button
                                type="button"
                                variant="glass"
                                size="iconMd"
                                rounded="full"
                                disabled={!zoomed || zoomScale <= 1}
                                aria-label="Zoom out"
                                onClick={() => {
                                    setZoomScale((scale) => {
                                        const nextScale = Math.max(scale - 0.25, 1);

                                        if (nextScale === 1) setZoomed(false);

                                        return nextScale;
                                    });
                                }}
                                className="border-white/20 bg-black/40 text-white hover:bg-white/15 hover:text-white"
                            >
                                <ZoomOut />
                            </Button>
                        </div>

                        {galleryLength > 1 && (
                            <>
                                <Button
                                    type="button"
                                    variant="glass"
                                    size="iconMd"
                                    rounded="full"
                                    aria-label="Previous image"
                                    onClick={previous}
                                    className="absolute left-3 top-1/2 z-50 -translate-y-1/2 border-white/20 bg-black/40 text-white hover:bg-white/15 hover:text-white sm:left-6"
                                >
                                    <ChevronLeft />
                                </Button>

                                <Button
                                    type="button"
                                    variant="glass"
                                    size="iconMd"
                                    rounded="full"
                                    aria-label="Next image"
                                    onClick={next}
                                    className="absolute right-3 top-1/2 z-50 -translate-y-1/2 border-white/20 bg-black/40 text-white hover:bg-white/15 hover:text-white sm:right-6"
                                >
                                    <ChevronRight />
                                </Button>
                            </>
                        )}

                        <div
                            className="relative flex h-full w-full items-center justify-center overflow-hidden p-5 sm:p-12"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            onPointerDown={handlePointerDown}
                            onPointerUp={handlePointerUp}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={currentImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={transitions.micro}
                                    className="relative h-full w-full"
                                >
                                    <Image
                                        src={currentImage}
                                        alt={`${title} — fullscreen view`}
                                        fill
                                        sizes="100vw"
                                        quality={85}
                                        priority={selectedIndex === 0}
                                        loading={selectedIndex === 0 ? "eager" : "lazy"}
                                        placeholder="blur"
                                        blurDataURL={BLUR_PLACEHOLDER}
                                        draggable={false}
                                        className="select-none object-contain"
                                        style={{
                                            transform: `scale(${zoomed ? zoomScale : 1})`,
                                            transition:
                                                "transform .28s cubic-bezier(.22,.61,.36,1)",
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="absolute bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-medium text-white backdrop-blur-xl">
                            {selectedIndex + 1} / {galleryLength}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}