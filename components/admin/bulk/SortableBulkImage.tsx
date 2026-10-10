"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import Image from "next/image";
import { Star, Trash2, GripVertical, ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableBulkImageProps {
  /** Unique id within the DndContext: `${sku}::${index}`. */
  id: string;
  /** Captured at drag start so the move is computed from stable data. */
  sku: string;
  index: number;
  src: string;
  isPrimary: boolean;
  total: number;
  /** Larger layout used inside the editor organizer. */
  size?: "sm" | "md";
  onSetPrimary: () => void;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

/**
 * A single, draggable product image tile.
 *
 * - Desktop: drag via the grip handle to reorder within a product or move the
 *   image to another product's strip (the parent `DndContext` resolves this).
 * - Touch/keyboard: explicit move-left / move-right buttons and a "set primary"
 *   control, so rearranging never depends on dragging.
 */
export default function SortableBulkImage({
  id,
  sku,
  index,
  src,
  isPrimary,
  total,
  size = "sm",
  onSetPrimary,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: SortableBulkImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { sku, index } });

  const box = size === "md" ? "w-24" : "w-16";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative shrink-0 rounded-xl border bg-card shadow-sm transition-all",
        isPrimary && "ring-2 ring-amber-500",
        isDragging && "z-50 scale-105 opacity-90 shadow-lg",
      )}
      data-testid="bulk-image-tile"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-t-xl bg-muted",
          size === "md" ? "h-24" : "h-16",
        )}
      >
        <Image
          src={src}
          alt={`Image ${index + 1}`}
          fill
          unoptimized
          sizes={size === "md" ? "96px" : "64px"}
          className="object-cover"
        />
      </div>

      {/* Drag handle (the whole bottom bar doubles as the handle) */}
      <div className="flex items-center justify-between gap-0.5 border-t border-border px-1 py-0.5">
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing"
          title="Drag to reorder or move between products"
          aria-label={`Drag image ${index + 1}`}
        >
          <GripVertical size={13} />
        </button>

        <span className="text-2xs font-medium text-muted-foreground tabular-nums">
          {isPrimary ? "Cover" : `#${index + 1}`}
        </span>

        <button
          type="button"
          onClick={onRemove}
          className="rounded p-0.5 text-red-400 hover:text-red-600"
          title="Remove image"
          aria-label={`Remove image ${index + 1}`}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Hover actions: set primary */}
      {!isPrimary && (
        <button
          type="button"
          onClick={onSetPrimary}
          className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-amber-500 opacity-0 shadow transition-opacity hover:text-amber-600 focus-visible:opacity-100 group-hover:opacity-100"
          title="Make cover"
          aria-label={`Make image ${index + 1} the cover`}
        >
          <Star size={12} className="fill-current" />
        </button>
      )}

      {/* Touch / keyboard move controls (always visible on md, hover on sm) */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-6 flex items-center justify-center gap-1",
          size === "md" ? "" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="iconSm"
          onClick={onMoveLeft}
          disabled={index === 0}
          className="h-6 w-6 rounded-full bg-background/80 p-0 shadow"
          title="Move left"
          aria-label={`Move image ${index + 1} left`}
        >
          <ArrowLeft size={11} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="iconSm"
          onClick={onMoveRight}
          disabled={index === total - 1}
          className="h-6 w-6 rounded-full bg-background/80 p-0 shadow"
          title="Move right"
          aria-label={`Move image ${index + 1} right`}
        >
          <ArrowRight size={11} />
        </Button>
      </div>
    </div>
  );
}
