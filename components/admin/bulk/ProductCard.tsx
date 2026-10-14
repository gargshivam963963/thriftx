"use client";
import { useState } from "react";

import Image from "@/components/ui/Image";
import {
  MoreHorizontal,
  Pencil,
  Sparkles,
  Loader2,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  CircleDashed,
  FileCheck,
  UploadCloud,
  RefreshCw,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { BulkProduct } from "@/app/lib/bulk/types";

export type CardStatus =
  | "Processing"
  | "Needs Review"
  | "Ready"
  | "Uploading"
  | "Uploaded"
  | "Error";

interface ProductCardProps {
  product: BulkProduct;
  status: CardStatus;
  aiLoading?: boolean;
  uploading?: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAiFill: () => void;
  onUpload: () => void;
  /** Inline field edits from the card (price / chest / waist). */
  onUpdate?: (updates: Partial<BulkProduct>) => void;
}

function statusMeta(status: CardStatus): {
  variant: "success" | "warning" | "info" | "error" | "secondary" | "default";
  icon: typeof CheckCircle2;
} {
  switch (status) {
    case "Ready":
      return { variant: "success", icon: CheckCircle2 };
    case "Needs Review":
      return { variant: "warning", icon: AlertTriangle };
    case "Uploaded":
      return { variant: "info", icon: CheckCircle2 };
    case "Uploading":
      return { variant: "secondary", icon: Loader2 };
    case "Error":
      return { variant: "error", icon: AlertTriangle };
    case "Processing":
    default:
      return { variant: "secondary", icon: Loader2 };
  }
}

const RUPEE = "\u20b9";

function formatPrice(value: number | undefined | null): string {
  if (!value || !Number.isFinite(value) || value <= 0) return "\u2014";
  return `${RUPEE}${value.toLocaleString("en-IN")}`;
}

/**
 * A borderless inline-editable field used directly on the card so admins can
 * tweak chest / waist / price without opening the editor modal. It commits on
 * every change (the parent re-validates), and stops pointer/click propagation
 * so it never interferes with the card's drag / hover behaviour.
 */
function InlineNumber({
  value,
  onCommit,
  ariaLabel,
  prefix,
  placeholder = "—",
  inputClassName,
  wrapperClassName,
}: {
  value: string;
  onCommit: (next: string) => void;
  ariaLabel: string;
  prefix?: string;
  placeholder?: string;
  inputClassName?: string;
  wrapperClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-0.5",
        wrapperClassName,
      )}
    >
      {prefix && (
        <span className="select-none font-bold text-foreground">{prefix}</span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        aria-label={ariaLabel}
        placeholder={placeholder}
        onChange={(event) => onCommit(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        className={cn(
          "min-w-0 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-right tabular-nums outline-none transition",
          "hover:border-border focus:border-foreground/40 focus:bg-card",
          inputClassName,
        )}
      />
    </span>
  );
}


export default function ProductCard({
  product,
  status,
  aiLoading = false,
  uploading = false,
  onEdit,
  onDuplicate,
  onDelete,
  onAiFill,
  onUpload,
  onUpdate,
}: ProductCardProps) {
  const meta = statusMeta(status);
  const StatusIcon = meta.icon;

  const cover = product.primaryImage ?? product.imageUrls[0];
  const imageCount = product.imageFiles.length;

  const measurementBits: string[] = [];
  if (product.chest?.trim()) measurementBits.push(`Chest ${product.chest}`);
  if (product.waist?.trim()) measurementBits.push(`Waist ${product.waist}`);
  if (product.length?.trim()) measurementBits.push(`Length ${product.length}`);

  const [hover, setHover] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const isProcessing = status === "Processing" || aiLoading;
  const canUpload =
    status === "Ready" &&
    product.status !== "Uploaded" &&
    !uploading;

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all",
        "hover:border-foreground/20 hover:shadow-md",
        product.status === "Uploaded" && "ring-1 ring-emerald-500/30",
      )}
      data-testid="bulk-product-card"
      onMouseMove={handleMouseMove}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={product.title?.trim() || `Product ${product.sku}`}
            fill
            unoptimized
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <CircleDashed size={26} />
            <span className="text-xs">No image</span>
          </div>
        )}

        {imageCount > 1 && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-2xs font-medium text-white backdrop-blur">
            {imageCount} images
          </span>
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <Loader2 size={28} className="animate-spin text-white drop-shadow" />
          </div>
        )}

        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="iconSm"
                aria-label="Product actions"
                className="bg-black/40 text-white backdrop-blur hover:bg-black/60 hover:text-white"
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil size={14} className="mr-2" />
                Edit details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onAiFill}
                disabled={aiLoading || imageCount === 0}
              >
                {aiLoading ? (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                ) : (
                  <Sparkles size={14} className="mr-2" />
                )}
                {product.aiGenerated ? "Re-run AI fill" : "AI fill"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy size={14} className="mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600 dark:text-red-400"
              >
                <Trash2 size={14} className="mr-2" />
                Remove product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {product.title?.trim() || (
              <span className="text-muted-foreground">Untitled product</span>
            )}
          </p>
          <Badge
            variant={meta.variant}
            size="xs"
            rounded="md"
            className="shrink-0"
          >
            <StatusIcon
              size={11}
              className={cn(
                "mr-1",
                (status === "Uploading" || isProcessing) && "animate-spin",
              )}
            />
            {status}
          </Badge>
        </div>

        <div className="flex items-baseline gap-2">
          {onUpdate ? (
            <InlineNumber
              ariaLabel="Price"
              prefix={RUPEE}
              value={product.price > 0 ? String(product.price) : ""}
              onCommit={(next) =>
                onUpdate({ price: Number(next) || 0 })
              }
              placeholder="0"
              inputClassName="w-16 text-base font-bold text-foreground"
            />
          ) : (
            <span className="text-base font-bold text-foreground tabular-nums">
              {formatPrice(product.price)}
            </span>
          )}
          {product.aiGenerated && product.price > 0 && (
            <span className="text-2xs text-muted-foreground">suggested</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {product.size?.trim() && (
            <Badge variant="outline" size="xs" rounded="md">
              Size {product.size}
            </Badge>
          )}
          {product.condition?.trim() && (
            <Badge variant="outline" size="xs" rounded="md">
              {product.condition}
            </Badge>
          )}
        </div>

        {onUpdate ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-baseline gap-1">
              Chest
              <InlineNumber
                ariaLabel="Chest"
                value={product.chest ?? ""}
                onCommit={(next) => onUpdate({ chest: next })}
                placeholder="—"
                inputClassName="w-10 text-xs text-foreground"
              />
            </span>
            <span className="flex items-baseline gap-1">
              Waist
              <InlineNumber
                ariaLabel="Waist"
                value={product.waist ?? ""}
                onCommit={(next) => onUpdate({ waist: next })}
                placeholder="—"
                inputClassName="w-10 text-xs text-foreground"
              />
            </span>
            {product.length?.trim() && (
              <span className="tabular-nums">Length {product.length}</span>
            )}
          </div>
        ) : (
          measurementBits.length > 0 && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {measurementBits.join(" \u00b7 ")}
            </p>
          )
        )}

        {product.errors.length > 0 && status !== "Uploaded" && (
          <ul className="mt-auto space-y-0.5">
            {product.errors.slice(0, 2).map((error) => (
              <li key={error} className="text-2xs text-red-600 dark:text-red-400">
                {error}
              </li>
            ))}
            {product.errors.length > 2 && (
              <li className="text-2xs text-muted-foreground">
                +{product.errors.length - 2} more
              </li>
            )}
          </ul>
        )}

        {hover && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl border border-border bg-black/60 p-3 backdrop-blur-sm transition-all duration-200"
            style={{ top: tooltipPos.y, left: tooltipPos.x }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">
                  {product.title?.trim() || `Product ${product.sku}`}
                </p>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setHover(false);
                  }}
                  className="text-white/70 hover:text-white transition"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60 mb-1">Measurements</p>
                  <div className="space-y-1">
                    {product.chest && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">Chest</span>
                        <span className="text-lg font-bold text-white tabular-nums">
                          {product.chest}
                        </span>
                      </div>
                    )}
                    {product.waist && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">Waist</span>
                        <span className="text-lg font-bold text-white tabular-nums">
                          {product.waist}
                        </span>
                      </div>
                    )}
                    {product.length && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">Length</span>
                        <span className="text-lg font-bold text-white tabular-nums">
                          {product.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs text-white/50">
                  {formatPrice(product.price)}
                </span>
                <div className="flex gap-1">
                  {product.size && (
                    <button className="text-xs text-white/60 hover:text-white transition">
                      Size {product.size}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="flex-1"
          >
            <Pencil size={13} className="mr-1.5" />
            Edit
          </Button>
          {product.status === "Uploaded" ? (
            <Badge
              variant="info"
              size="sm"
              rounded="md"
              className="flex-1 justify-center"
            >
              <CheckCircle2 size={13} className="mr-1.5" />
              Saved
            </Badge>
          ) : canUpload ? (
            <Button
              type="button"
              size="sm"
              onClick={onUpload}
              disabled={uploading}
              className="flex-1"
            >
              <UploadCloud size={13} className="mr-1.5" />
              Publish
            </Button>
          ) : status === "Error" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onUpload}
              className="flex-1"
            >
              <RefreshCw size={13} className="mr-1.5" />
              Retry
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="flex-1 text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <Trash2 size={13} className="mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
