"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
} from "lucide-react";

import IconButton from "@/components/ui/IconButton";

interface ProductGalleryProps {
    title: string;
    image: string;
    images?: string[];
}

export default function ProductGallery({
    title,
    image,
    images = [],
}: ProductGalleryProps) {
    const gallery = useMemo(() => {
        const list = images.length ? images : [image];

        return list.filter(Boolean);
    }, [image, images]);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const currentImage =
        gallery[selectedIndex] ?? gallery[0];

    const previous = () => {
        setSelectedIndex((prev) =>
            prev === 0 ? gallery.length - 1 : prev - 1
        );
    };

    const next = () => {
        setSelectedIndex((prev) =>
            prev === gallery.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <div className="space-y-8">
            <div className="grid gap-4 lg:grid-cols-[90px_1fr]">
                {/* Thumbnails */}

                <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:flex-col lg:overflow-visible">
                    {gallery.map((img, index) => {
                        const active = index === selectedIndex;

                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={[
                                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200",
                                    active
                                        ? "border-black"
                                        : "border-neutral-200 hover:border-neutral-400",
                                ].join(" ")}
                            >
                                <Image
                                    src={img}
                                    alt={`${title} ${index + 1}`}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </button>
                        );
                    })}
                </div>

                {/* Main Image */}

                <div className="relative order-1 overflow-hidden rounded-[28px] bg-neutral-100">
                    <Image
                        key={currentImage}
                        src={currentImage}
                        alt={title}
                        width={1200}
                        height={1500}
                        priority
                        className="aspect-[6/5] w-full object-cover transition-all duration-300"
                    />

                    {/* Previous */}

                    {gallery.length > 1 && (
                        <IconButton
                            variant="secondary"
                            onClick={previous}
                            className="absolute left-4 top-1/2 -translate-y-1/2 shadow-lg"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </IconButton>
                    )}

                    {/* Next */}

                    {gallery.length > 1 && (
                        <IconButton
                            variant="secondary"
                            onClick={next}
                            className="absolute right-4 top-1/2 -translate-y-1/2 shadow-lg"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </IconButton>
                    )}

                    {/* Zoom */}

                    <IconButton
                        variant="secondary"
                        className="absolute right-4 top-4 shadow-lg"
                        aria-label="Zoom Image"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </IconButton>

                    {/* Counter */}

                    <div className="absolute bottom-4 left-4 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                        {selectedIndex + 1} / {gallery.length}
                    </div>
                </div>
            </div>
        </div>
    );
}