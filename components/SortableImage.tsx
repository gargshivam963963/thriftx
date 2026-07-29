"use client";

import Image from "next/image";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Trash2, Star, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
    id: string;
    src: string;
    index: number;
    isCover?: boolean;
    onDelete: () => void;
    onPreview: () => void;
}

export default function SortableImage({
    id,
    src,
    index,
    isCover,
    onDelete,
    onPreview,
}: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={cn(
                "group relative rounded-xl border bg-white shadow-sm transition-all dark:bg-neutral-800 dark:border-neutral-700",
                isDragging && "z-50 shadow-2xl scale-105 opacity-90 ring-2 ring-neutral-900/20 dark:ring-neutral-100/20"
            )}
        >
            {/* Image preview */}
            <button
                onClick={onPreview}
                type="button"
                className="relative block aspect-square w-full overflow-hidden rounded-t-xl"
            >
                <Image
                    src={src}
                    alt={`Image ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover transition duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 20vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                    <Expand size={20} className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
            </button>

            {/* Bottom bar */}
            <div className="flex items-center justify-between gap-1 border-t border-neutral-100 px-2 py-1.5 dark:border-neutral-700">
                <div className="flex items-center gap-1.5">
                    {isCover ? (
                        <Badge variant="default" size="xs" rounded="md" className="bg-amber-500 text-white dark:bg-amber-500 dark:text-white">
                            <Star size={10} className="fill-current" />
                            Cover
                        </Badge>
                    ) : (
                        <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                            #{index + 1}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-0.5">
                    {/* Drag handle */}
                    <button
                        type="button"
                        {...listeners}
                        {...attributes}
                        className="cursor-grab touch-none rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 active:cursor-grabbing dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                        title="Drag to reorder"
                    >
                        <GripVertical size={14} />
                    </button>

                    {/* Delete button */}
                    <button
                        type="button"
                        onClick={onDelete}
                        className="rounded-md p-1 text-red-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Delete image"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

