"use client";

import { X, Star } from "lucide-react";
import Image from "next/image";

interface MeasurementField {
    key: string;
    label: string;
    placeholder: string;
}

interface ImageCardProps {
    preview: string;
    index: number;
    total: number;
    onRemove: (index: number) => void;
    onPrimary?: (index: number) => void;
    isPrimary?: boolean;
    measurements?: MeasurementField[];
    form?: Record<string, string>;
    onMeasurementChange?: (key: string, value: string) => void;
}

export default function ImageCard({
    preview,
    index,
    total,
    onRemove,
    onPrimary,
    isPrimary = false,
    measurements = [],
    form = {},
    onMeasurementChange,
}: ImageCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="relative aspect-square overflow-hidden">
                <Image
                    src={preview}
                    alt=""
                    width={300}
                    height={300}
                    className="h-full w-full object-cover"
                    unoptimized
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
            </div>

            {/* Measurement Fields - Always Visible Below Image */}
            {measurements.length > 0 && (
                <div className="border-t border-neutral-200 bg-neutral-50 p-3 space-y-2">
                    {measurements.map((m) => (
                        <div key={m.key} className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-neutral-600 w-14 shrink-0">
                                {m.label}
                            </label>
                            <input
                                type="text"
                                value={form[m.key] ?? ""}
                                onChange={(e) =>
                                    onMeasurementChange?.(m.key, e.target.value)
                                }
                                placeholder={m.placeholder}
                                className="h-8 w-full rounded-lg border border-neutral-300 bg-white px-2 text-xs text-center outline-none transition focus:border-black focus:ring-1 focus:ring-black/5"
                            />
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
