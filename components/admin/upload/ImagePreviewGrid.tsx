"use client";

import ImageCard from "./ImageCard";

interface ImagePreviewGridProps {
    previews: string[];
    onRemove: (index: number) => void;
    primaryIndex?: number;
    onPrimary?: (index: number) => void;
}

export default function ImagePreviewGrid({
    previews,
    onRemove,
    primaryIndex = 0,
    onPrimary,
}: ImagePreviewGridProps) {
    if (!previews.length) {
        return (
            <div className="mt-8 rounded-3xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-16 text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-9 w-9 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-10h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>

                </div>

                <h3 className="mt-6 text-xl font-semibold">
                    No Images Uploaded
                </h3>

                <p className="mt-2 text-neutral-500">
                    Uploaded product images will appear here.
                </p>

            </div>
        );
    }

    return (
        <div className="mt-8 space-y-6">

            <div className="flex items-center justify-between">

                <div>

                    <h3 className="text-lg font-semibold">
                        Image Gallery
                    </h3>

                    <p className="text-sm text-neutral-500">
                        First image is used as the cover image.
                    </p>

                </div>

                <span className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
                    {previews.length} Images
                </span>

            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {previews.map((preview, index) => (

                    <ImageCard
                        key={`${preview}-${index}`}
                        preview={preview}
                        index={index}
                        total={previews.length}
                        onRemove={onRemove}
                        onPrimary={onPrimary}
                        isPrimary={primaryIndex === index}
                    />

                ))}

            </div>

        </div>
    );
}