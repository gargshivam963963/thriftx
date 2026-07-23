"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import ImageSkeleton from "./ImageSkeleton";

interface PremiumImageProps extends Omit<ImageProps, "onLoad"> {
    wrapperClassName?: string;
    fallbackSrc?: string;
    rounded?: boolean;
}

export default function PremiumImage(props: PremiumImageProps) {
    return <PremiumImageInner key={String(props.src)} {...props} />;
}

function PremiumImageInner({
    wrapperClassName,
    className,
    fallbackSrc = "/images/placeholder.jpg",
    rounded = false,
    src,
    alt,
    ...props
}: PremiumImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [imageSrc, setImageSrc] = useState(src);

    return (
        <div
            className={cn(
                "relative h-full w-full overflow-hidden",
                rounded && "rounded-[inherit]",
                wrapperClassName,
            )}
        >
            {!loaded && <ImageSkeleton className="z-10" />}

            <Image
                {...props}
                src={imageSrc}
                alt={alt}
                onLoad={() => setLoaded(true)}
                onError={() => {
                    if (imageSrc !== fallbackSrc) {
                        setLoaded(false);
                        setImageSrc(fallbackSrc);
                    }
                }}
                className={cn(
                    "duration-700 ease-out",
                    loaded
                        ? "scale-100 opacity-100"
                        : "scale-[1.08] opacity-0",
                    className,
                )}
            />
        </div>
    );
}
