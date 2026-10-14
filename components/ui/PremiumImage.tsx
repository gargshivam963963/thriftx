
"use client";

import Image, { type ImageProps } from "@/components/ui/Image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import ImageSkeleton from "./ImageSkeleton";

interface PremiumImageProps extends Omit<ImageProps, "onLoad"> {
    wrapperClassName?: string;
    fallbackSrc?: string;
    rounded?: boolean;
}

function isMissingImage(src: ImageProps["src"]): boolean {
    if (typeof src !== "string") return false;

    const normalized = src.trim();

    return (
        normalized.length === 0 ||
        normalized === "/images/placeholder.jpg"
    );
}

export default function PremiumImage(props: PremiumImageProps) {
    return <PremiumImageInner key={String(props.src)} {...props} />;
}

function PremiumImageInner({
    wrapperClassName,
    className,
    fallbackSrc,
    rounded = false,
    src,
    alt,
    ...props
}: PremiumImageProps) {
    const missingInitially = isMissingImage(src);

    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(missingInitially);
    const [imageSrc, setImageSrc] = useState<ImageProps["src"]>(
        missingInitially ? "" : src
    );

    const showFallback = failed || !imageSrc;

    return (
        <div
            className={cn(
                "relative h-full w-full overflow-hidden",
                rounded && "rounded-[inherit]",
                wrapperClassName
            )}
            role={showFallback ? "img" : undefined}
            aria-label={showFallback ? `${alt || "Product"} image unavailable` : undefined}
        >
            {!loaded && !showFallback && (
                <ImageSkeleton className="z-10" />
            )}

            {showFallback ? (
                <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-neutral-100"
                >
                    <svg
                        viewBox="0 0 64 64"
                        width="42"
                        height="42"
                        fill="none"
                        className="text-neutral-400"
                    >
                        <rect
                            x="10"
                            y="10"
                            width="44"
                            height="44"
                            rx="5"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <circle
                            cx="24"
                            cy="24"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            d="M14 46L27 33L35 40L42 32L50 42"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            ) : (
                <Image
                    {...props}
                    src={imageSrc}
                    alt={alt}
                    onLoad={() => setLoaded(true)}
                    onError={() => {
                        setLoaded(false);
                        setFailed(true);
                    }}
                    className={cn(
                        "duration-700 ease-out",
                        loaded
                            ? "scale-100 opacity-100"
                            : "scale-[1.08] opacity-0",
                        className
                    )}
                />
            )}
        </div>
    );
}