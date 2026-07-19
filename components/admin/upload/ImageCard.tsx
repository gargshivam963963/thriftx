"use client";

import { X, Star } from "lucide-react";

interface ImageCardProps {
    preview: string;
    index: number;
    total: number;
    onRemove: (index: number) => void;
    onPrimary?: (index: number) => void;
    isPrimary?: boolean;
}

export default function ImageCard({
    preview,
    index,
    total,
    onRemove,
    onPrimary,
    isPrimary = false,
}: ImageCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

            <img
                src={preview}
                alt={`Product ${index + 1}`}
                className="aspect-square w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

            <div className="absolute left-3 top-3 flex items-center gap-2">

                <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {index + 1} / {total}
                </span>

                {isPrimary && (
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                        Cover
                    </span>
                )}

            </div>

            <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition duration-300 group-hover:opacity-100">

                {onPrimary && (
                    <button
                        type="button"
                        onClick={() => onPrimary(index)}
                        className="rounded-full bg-white p-2 shadow-lg transition hover:scale-105"
                    >
                        <Star
                            size={18}
                            className={
                                isPrimary
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-neutral-700"
                            }
                        />
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="rounded-full bg-red-500 p-2 text-white shadow-lg transition hover:scale-105 hover:bg-red-600"
                >
                    <X size={18} />
                </button>

            </div>

            <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-white/95 p-3 backdrop-blur transition duration-300 group-hover:translate-y-0">

                <p className="truncate text-sm font-medium">
                    Image {index + 1}
                </p>

                <p className="text-xs text-neutral-500">
                    High Resolution Preview
                </p>

            </div>

        </div>
    );
}