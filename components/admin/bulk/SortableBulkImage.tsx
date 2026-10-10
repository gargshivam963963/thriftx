"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import Image from "next/image";
import { useRef } from "react";
import { Star, Trash2, GripVertical, ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";

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
  /**
   * `sm` = tiny tile, `md` = editor organizer tile,
   * `lg` = big 3-per-row preview tile on the product card.
   */
  size?: "sm" | "md" | "lg";
  onSetPrimary: () => void;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  /** Opens the full-size preview modal for this image. */
  onPreview?: () => void;
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
  onPreview,
}: SortableBulkImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { sku, index } });

  const downAt = useRef<{ x: number; y: number } | null>(null);

  const box = size === "lg" ? "w-full" : size === "md" ? "w-11" : "w-9";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-lg border bg-card shadow-sm transition-all",
        box,
        isPrimary
          ? "border-amber-500 ring-2 ring-amber-500/70"
          : "hover:border-foreground/40",
        isDragging && "z-50 scale-105 opacity-90 shadow-xl ring-2 ring-primary",
      )}
      data-testid="bulk-image-tile"
    >
      <button
        type="button"
        onPointerDown={(e) => {
          downAt.current = { x: e.clientX, y: e.clientY };
        }}
        onClick={(e) => {
          // Drag ends also fire click — only open preview on a true tap.
          const start = downAt.current;
          downAt.current = null;
          if (start) {
            const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
            if (moved > 6) return;
          }
          onPreview?.();
        }}
        className={cn(
          "relative block w-full cursor-zoom-in overflow-hidden bg-muted",
          size === "lg" ? "h-36" : size === "md" ? "h-8" : "h-[22px]",
        )}
        title={
          onPreview
            ? "Click photo to preview full size · drag the grip below to reorder"
            : "Photo thumbnail"
        }
        aria-label={onPreview ? `Preview image ${index + 1} full size` : `Image ${index + 1}`}
      >
        <Image
          src={src}
          alt={`Image ${index + 1}`}
          fill
          unoptimized
          loading="lazy"
          decoding="async"
          draggable={false}
          sizes={size === "lg" ? "360px" : size === "md" ? "48px" : "40px"}
          className="pointer-events-none object-cover"
        />
        {onPreview && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/25 hover:opacity-100">
            <Maximize2 size={size === "lg" ? 20 : 12} className="text-white drop-shadow" />
          </span>
        )}
        {/* position pill — always visible so order is obvious */}
        <span className="absolute left-0.5 top-0.5 rounded-full bg-black/65 px-1.5 py-px text-[10px] font-semibold leading-4 text-white tabular-nums">
          {isPrimary ? "★ Cover" : `#${index + 1}`}
        </span>
      </button>

      {/* Slim control bar: grip = drag, star = cover, trash = remove */}
      <div className="flex items-center justify-between gap-0.5 border-t border-border bg-card px-0.5 py-px" title="Drag the grip to reorder — drag a tile onto another product to move it there">
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="cursor-grab touch-none rounded bg-muted p-1 text-foreground/70 hover:bg-accent hover:text-foreground active:cursor-grabbing"
          title="Drag to reorder or move between products"
          aria-label={`Drag image ${index + 1}`}
        >
          <GripVertical size={size === "lg" ? 14 : 12} />
        </button>

        {!isPrimary ? (
          <button
            type="button"
            onClick={onSetPrimary}
            className="rounded p-1 text-amber-500/70 hover:bg-muted hover:text-amber-600"
            title="Make cover"
            aria-label={`Make image ${index + 1} the cover`}
          >
            <Star size={size === "lg" ? 13 : 11} />
          </button>
        ) : (
          <Star size={size === "lg" ? 13 : 11} className="mr-0.5 fill-amber-500 text-amber-500" />
        )}

        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
          title="Remove image"
          aria-label={`Remove image ${index + 1}`}
        >
          <Trash2 size={size === "lg" ? 13 : 11} />
        </button>
      </div>

      {/* Touch / keyboard nudge controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-5 flex items-center justify-center gap-1",
          size === "sm" ? "opacity-0 group-hover:opacity-100" : "",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="iconSm"
          onClick={onMoveLeft}
          disabled={index === 0}
          className="h-5 w-5 rounded-full bg-background/80 p-0 shadow"
          title="Move left"
          aria-label={`Move image ${index + 1} left`}
        >
          <ArrowLeft size={10} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="iconSm"
          onClick={onMoveRight}
          disabled={index === total - 1}
          className="h-5 w-5 rounded-full bg-background/80 p-0 shadow"
          title="Move right"
          aria-label={`Move image ${index + 1} right`}
        >
          <ArrowRight size={10} />
        </Button>
      </div>
    </div>
  );
}
