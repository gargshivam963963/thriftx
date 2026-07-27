"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { GripVertical, ImageIcon, Check, AlertCircle } from "lucide-react";
import type { ImageLabel } from "@/app/lib/bulk/image-sorter";
import { getImageLabels } from "@/app/lib/bulk/image-sorter";

export interface ReorderableImage {
    id: string;
    file: File;
    url: string;
    label: ImageLabel;
    index: number;
}

interface SmartReorderGridProps {
    images: ReorderableImage[];
    onReorder: (images: ReorderableImage[]) => void;
    maxImages?: number;
}

const LABEL_OPTIONS: ImageLabel[] = [
    "Front",
    "Back",
    "Brand Tag",
    "Size Tag",
    "Fabric",
    "Defect",
];

const LABEL_COLORS: Record<string, string> = {
    Front: "bg-blue-500 text-white",
    Back: "bg-purple-500 text-white",
    "Brand Tag": "bg-amber-500 text-white",
    "Size Tag": "bg-emerald-500 text-white",
    Fabric: "bg-rose-500 text-white",
    Defect: "bg-red-500 text-white",
};

export default function SmartReorderGrid({
    images,
    onReorder,
    maxImages = 12,
}: SmartReorderGridProps) {
    const [editingLabel, setEditingLabel] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleLabelChange = useCallback(
        (imageId: string, newLabel: ImageLabel) => {
            const updated = images.map((img) =>
                img.id === imageId ? { ...img, label: newLabel } : img,
            );
            onReorder(updated);
            setEditingLabel(null);
        },
        [images, onReorder],
    );

    if (images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-12 dark:border-neutral-700 dark:bg-neutral-800/50">
                <ImageIcon size={40} className="mb-3 text-neutral-300 dark:text-neutral-600" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    No images to reorder
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    Upload a folder with images to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        Image Order
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Drag to reorder &middot; Click label to change
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                    <Check size={12} className="text-emerald-500" />
                    {images.length} of {maxImages}
                </div>
            </div>

            <Reorder.Group
                axis="y"
                values={images}
                onReorder={(ordered) => {
                    const relabeled = ordered.map((img, i) => ({
                        ...img,
                        label: getImageLabels(ordered.length)[i] || img.label,
                        index: i,
                    }));
                    onReorder(relabeled);
                }}
                className="space-y-2"
            >
                <AnimatePresence>
                    {images.map((image) => (
                        <Reorder.Item
                            key={image.id}
                            value={image}
                            className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
                            onDragStart={() => setIsDragging(true)}
                            onDragEnd={() => setIsDragging(false)}
                        >
                            <motion.div
                                layout
                                className="flex items-center gap-3 p-2 pr-4"
                            >
                                {/* Drag Handle */}
                                <div className="flex cursor-grab touch-none items-center justify-center rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 active:cursor-grabbing dark:hover:bg-neutral-700 dark:hover:text-neutral-300">
                                    <GripVertical size={18} />
                                </div>

                                {/* Thumbnail */}
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-700">
                                    <Image
                                        src={image.url}
                                        alt={image.label}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                        unoptimized
                                    />
                                    {/* Position badge */}
                                    <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white backdrop-blur-sm">
                                        {image.index + 1}
                                    </span>
                                </div>

                                {/* File Info + Label */}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                        {image.file.name}
                                    </p>
                                    <div className="mt-1.5">
                                        {editingLabel === image.id ? (
                                            <div className="flex flex-wrap gap-1">
                                                {LABEL_OPTIONS.map((option) => (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => handleLabelChange(image.id, option)}
                                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-all ${image.label === option
                                                                ? `${LABEL_COLORS[option] || "bg-neutral-900 text-white"} ring-2 ring-offset-1 ring-neutral-900/20 dark:ring-offset-neutral-800`
                                                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                                                            }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingLabel(null)}
                                                    className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setEditingLabel(image.id)}
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition hover:opacity-80 ${LABEL_COLORS[image.label] || "bg-neutral-200 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-200"
                                                    }`}
                                            >
                                                {image.label}
                                                <span className="text-white/70">&#9998;</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* File size */}
                                <span className="hidden shrink-0 text-xs text-neutral-400 sm:block">
                                    {image.file.size > 1024 * 1024
                                        ? `${(image.file.size / (1024 * 1024)).toFixed(1)} MB`
                                        : `${(image.file.size / 1024).toFixed(0)} KB`}
                                </span>
                            </motion.div>
                        </Reorder.Item>
                    ))}
                </AnimatePresence>
            </Reorder.Group>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-800/50">
                <span className="mr-1 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                    Auto-labels:
                </span>
                {LABEL_OPTIONS.map((label) => (
                    <span
                        key={label}
                        className={`rounded px-2 py-0.5 text-[9px] font-semibold ${LABEL_COLORS[label] || "bg-neutral-200 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-300"}`}
                    >
                        {label}
                    </span>
                ))}
                <span className="ml-auto text-[9px] text-neutral-400 dark:text-neutral-500">
                    1st → 6th image order
                </span>
            </div>
        </div>
    );
}

