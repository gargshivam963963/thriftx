"use client";
import {
    useMemo,
    useState,
    useEffect,
    useCallback,
    useRef
} from "react";

import Image from "next/image";

import { AnimatePresence, motion } from "framer-motion";

import {
    ChevronLeft,
    ChevronRight,
    Expand,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

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

    const [transformOrigin, setTransformOrigin] =
        useState("50% 50%");

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const imageContainerRef =
        useRef<HTMLDivElement>(null);

    const lastTap = useRef(0);
    const gallery = useMemo(() => {
        const list =
            images.length > 0
                ? images
                : [primaryImage];

        return [...new Set(list.filter(Boolean))];
    }, [primaryImage, images]);

    const galleryLength = gallery.length;

    const currentImage =
        gallery[selectedIndex] ?? gallery[0];

    const previous = useCallback(() => {
        setSelectedIndex((index) =>
            (index - 1 + galleryLength) %
            galleryLength
        );
    }, [galleryLength]);

    const next = useCallback(() => {
        setSelectedIndex((index) =>
            (index + 1) % galleryLength
        );
    }, [galleryLength]);

    const handleMouseMove = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        if (
            !zoomed ||
            !imageContainerRef.current
        )
            return;

        const rect =
            imageContainerRef.current.getBoundingClientRect();

        const x =
            ((e.clientX - rect.left) /
                rect.width) *
            100;

        const y =
            ((e.clientY - rect.top) /
                rect.height) *
            100;

        setTransformOrigin(
            `${x}% ${y}%`
        );
    };

    const handleWheel = (
        e: React.WheelEvent
    ) => {
        e.preventDefault();

        setZoomed(true);

        setZoomScale((prev) => {
            if (e.deltaY < 0) {
                return Math.min(prev + 0.2, 4);
            }

            return Math.max(prev - 0.2, 1);
        });
    };

    const handleDoubleClick = () => {
        if (!zoomed) {
            setZoomed(true);
            setZoomScale(2.5);
        } else {
            setZoomed(false);
            setZoomScale(2);
        }
    };

    const handleDoubleTap = () => {
        const now = Date.now();

        if (now - lastTap.current < 300) {
            handleDoubleClick();
        }

        lastTap.current = now;
    };

    const onTouchStart = (
        e: React.TouchEvent
    ) => {
        touchStartX.current =
            e.targetTouches[0].clientX;

        handleDoubleTap();
    };

    const onTouchMove = (
        e: React.TouchEvent
    ) => {
        touchEndX.current =
            e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        const distance =
            touchStartX.current -
            touchEndX.current;

        if (Math.abs(distance) < 60)
            return;

        if (distance > 0) {
            next();
        } else {
            previous();
        }
    };

    useEffect(() => {
        if (!fullscreen) return;

        const onKeyDown = (
            e: KeyboardEvent
        ) => {
            switch (e.key) {
                case "ArrowLeft":
                    previous();
                    break;

                case "ArrowRight":
                    next();
                    break;

                case "+":
                    setZoomScale((z) =>
                        Math.min(z + 0.25, 4)
                    );
                    break;

                case "-":
                    setZoomScale((z) =>
                        Math.max(z - 0.25, 1)
                    );
                    break;

                case "Escape":
                    setFullscreen(false);
                    setZoomed(false);
                    setZoomScale(2);
                    break;
            }
        };

        window.addEventListener(
            "keydown",
            onKeyDown
        );

        return () =>
            window.removeEventListener(
                "keydown",
                onKeyDown
            );
    }, [
        fullscreen,
        previous,
        next,
    ]);

    useEffect(() => {
        if (!fullscreen) return;

        document.body.style.overflow =
            "hidden";

        return () => {
            document.body.style.overflow =
                "";
        };
    }, [fullscreen]);

    useEffect(() => {
        const preload = (
            src?: string
        ) => {
            if (!src) return;

            const img =
                new window.Image();

            img.src = src;
        };

        const nextIndex =
            (selectedIndex + 1) %
            galleryLength;

        const previousIndex =
            (selectedIndex -
                1 +
                galleryLength) %
            galleryLength;

        preload(gallery[nextIndex]);
        preload(gallery[previousIndex]);
    }, [
        selectedIndex,
        gallery,
        galleryLength,
    ]);

    const imageAnimation = {
        initial: {
            opacity: 0,
            scale: 0.96,
        },

        animate: {
            opacity: 1,
            scale: 1,
        },

        exit: {
            opacity: 0,
            scale: 1.04,
        },

        transition: {
            duration: 0.35,
            ease: "easeOut" as const,
        },
    };

    const overlayAnimation = {
        initial: {
            opacity: 0,
        },

        animate: {
            opacity: 1,
        },

        exit: {
            opacity: 0,
        },

        transition: {
            duration: 0.25,
        },
    };

    return (
        <>
            <div className="space-y-8">
                <div className="grid gap-5 lg:grid-cols-[96px_1fr]">

                    {/* Thumbnails */}

                    <div className="order-2 flex gap-3 overflow-x-auto pb-2 lg:order-1 lg:flex-col lg:overflow-visible">

                        {gallery.map((img, index) => {
                            const active =
                                index === selectedIndex;

                            return (
                                <motion.button
                                    whileHover={{
                                        y: -4,
                                        scale: 1.05,
                                    }}

                                    whileTap={{
                                        scale: .95,
                                    }}
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    className={[
                                        "group relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300",
                                        active
                                            ? "border-black shadow-xl ring-2 ring-black/10"
                                            : "border-neutral-200 hover:border-neutral-400 hover:shadow-md",
                                    ].join(" ")}
                                >
                                    <Image
                                        src={img}
                                        alt={`${title} ${index + 1}`}
                                        fill
                                        sizes="96px"
                                        className="object-cover transition-all duration-500 group-hover:scale-110"
                                    />

                                    <AnimatePresence>
                                        {active && (
                                            <motion.div
                                                layoutId="thumb-active"
                                                className="absolute inset-0 rounded-3xl ring-2 ring-black"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 32,
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Main Image */}
                    <div
                        ref={imageContainerRef}
                        className="group relative order-1 overflow-hidden rounded-[32px] border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 shadow-xl"
                        onMouseEnter={() => setZoomed(true)}
                        onMouseLeave={() => {
                            setZoomed(false);
                            setZoomScale(2);
                        }}
                        onMouseMove={handleMouseMove}
                        onWheel={handleWheel}
                        onDoubleClick={handleDoubleClick}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {!isLoaded && (
                            <motion.div
                                initial={{ opacity: 1 }}
                                animate={{ opacity: isLoaded ? 0 : 1 }}
                                transition={{ duration: 0.35 }}
                                className="absolute inset-0 z-10 overflow-hidden rounded-[32px]"
                            >
                                <div className="absolute inset-0 bg-neutral-100" />

                                <motion.div
                                    animate={{
                                        x: ["-100%", "100%"],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.4,
                                        ease: "linear",
                                    }}
                                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                                />
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentImage}
                                initial={{
                                    opacity: 0,
                                    scale: 0.96,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 1.04,
                                }}
                                transition={{
                                    duration: 0.35,
                                }}
                                className="relative"
                            >
                                <Image
                                    key={currentImage}
                                    src={currentImage}
                                    alt={title}
                                    width={1600}
                                    height={2000}
                                    priority
                                    draggable={false}
                                    onLoadingComplete={() => setIsLoaded(true)}
                                    className="aspect-[6/5] w-full select-none object-contain will-change-transform"
                                    style={{
                                        transformOrigin,
                                        transform: `scale(${zoomed ? zoomScale : 1})`,
                                        transition: "transform .28s cubic-bezier(.22,.61,.36,1)",
                                    }}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Counter */}
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -8,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            className="absolute left-6 top-6 z-20 rounded-full border border-white/40 bg-white/80 px-4 py-2 text-sm font-semibold text-black backdrop-blur-xl shadow-lg"
                        >
                            {selectedIndex + 1} / {galleryLength}
                        </motion.div>

                        {/* Top Actions */}
                        <div className="absolute right-6 top-6 z-20 flex flex-col gap-3">
                            <motion.div
                                whileHover={{
                                    scale: 1.08,
                                }}
                                whileTap={{
                                    scale: .94,
                                }}
                            >
                                <Button
                                    variant="glass"
                                    size="iconMd"
                                    aria-label="Zoom"
                                    onClick={() =>
                                        setFullscreen(true)
                                    }
                                >
                                    <Expand />
                                </Button>
                            </motion.div>
                        </div>

                        {/* Previous */}
                        {galleryLength > 1 && (
                            <motion.div
                                whileHover={{
                                    x: -3,
                                    scale: 1.05,
                                }}
                                whileTap={{
                                    scale: .92,
                                }}
                            >
                                <Button
                                    variant="glass"
                                    size="iconMd"
                                    onClick={previous}
                                    aria-label="Previous Image"
                                    className="absolute left-5 top-1/2 z-20 -translate-y-1/2"
                                >
                                    <ChevronLeft />
                                </Button>
                            </motion.div>
                        )}

                        {/* Next */}
                        {galleryLength > 1 && (
                            <motion.div
                                whileHover={{
                                    x: 3,
                                    scale: 1.05,
                                }}
                                whileTap={{
                                    scale: .92,
                                }}
                            >
                                <Button
                                    variant="glass"
                                    size="iconMd"
                                    onClick={next}
                                    aria-label="Next Image"
                                    className="absolute right-5 top-1/2 z-20 -translate-y-1/2"
                                >
                                    <ChevronRight />
                                </Button>
                            </motion.div>
                        )}

                    </div>

                </div>
            </div >

            <AnimatePresence>

                {fullscreen && (
                    <motion.div
                        {...overlayAnimation}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg"
                    >
                        <Button
                            variant="glass"
                            size="iconMd"
                            onClick={() =>
                                setFullscreen(false)
                            }
                            className="absolute right-8 top-8"
                        >
                            <X />
                        </Button>
                        <div className="relative flex h-full w-full items-center justify-center p-6">

                            {galleryLength > 1 && (
                                <Button
                                    variant="glass"
                                    size="iconLg"
                                    onClick={previous}
                                    className="absolute left-8 top-1/2 -translate-y-1/2"
                                >
                                    <ChevronLeft />
                                </Button>
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
                                        width={1800}
                                        height={2200}
                                        priority
                                        draggable={false}
                                        className="max-h-[90vh] max-w-[92vw] rounded-3xl object-contain transition duration-300 hover:scale-[1.03]"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {galleryLength > 1 && (
                                <Button
                                    variant="glass"
                                    size="iconLg"
                                    onClick={next}
                                    className="absolute right-8 top-1/2 -translate-y-1/2"
                                >
                                    <ChevronRight />
                                </Button>
                            )}

                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-xl">
                                {selectedIndex + 1} / {galleryLength}
                            </div>

                        </div>

                    </motion.div>

                )}

            </AnimatePresence>

        </>
    );
}