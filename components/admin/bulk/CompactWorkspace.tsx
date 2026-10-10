"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    closestCenter,
    pointerWithin,
    useSensor,
    useSensors,
    useDroppable,
    type CollisionDetection,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
    FolderOpen,
    Images,
    Plus,
    Sparkles,
    UploadCloud,
    Loader2,
    PackageOpen,
    Wand2,
    AlertTriangle,
    Star,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import ProductCard, { CardStatus } from "./ProductCard";
import SortableBulkImage from "./SortableBulkImage";

import type { BulkProduct } from "@/app/lib/bulk/types";
import {
    APPROVED_PRICE_SET,
    isApprovedPrice,
} from "@/app/lib/bulk/pricing";
import {
    GENDER_OPTIONS,
    CONDITION_OPTIONS,
    CATEGORY_OPTIONS,
} from "@/app/lib/bulk/validators";

export interface AiProcessingInfo {
    current: number;
    total: number;
    currentSku: string;
}

export interface CompactWorkspaceProps {
    products: BulkProduct[];
    aiLoadingSku: string | null;
    /** SKUs waiting in the background AI queue (shown as Processing). */
    aiPendingSkus?: string[];
    aiRunning: boolean;
    aiProcessingInfo: AiProcessingInfo | null;
    savingSku: string | null;
    uploading: boolean;
    onAddRow: () => void;
    /** Adds `count` blank products in one update (toolbar bulk add). */
    onAddRows?: (count: number) => void;
    onFilesSelected: (files: File[]) => void;
    onFolderSelected: (files: File[]) => void;
    onUpdate: (sku: string, updates: Partial<BulkProduct>) => void;
    /** Replaces all images of a product (editor "Replace" action). */
    onImagesChange?: (sku: string, files: File[]) => void;
    onDelete: (sku: string) => void;
    onDuplicate: (sku: string) => void;
    onAiFill: (sku: string) => void;
    onAiFillAll: () => void;
    onSaveSingle: (sku: string, publish: boolean) => void;
    onPublishAll: () => void;
    onReorderImage: (sku: string, fromIndex: number, toIndex: number) => void;
    onMoveImage: (
        fromSku: string,
        imageIndex: number,
        toSku: string,
        toIndex?: number,
    ) => void;
    onSetPrimary: (sku: string, imageIndex: number) => void;
    onRemoveImage: (sku: string, imageIndex: number) => void;
    onAppendImages: (sku: string, files: File[]) => void;
}

/** Derive the compact card status from validation + background activity. */
function deriveStatus(
    product: BulkProduct,
    aiLoadingSku: string | null,
    aiPendingSkus: string[],
    savingSku: string | null,
): CardStatus {
    if (aiLoadingSku === product.sku || aiPendingSkus.includes(product.sku)) {
        return "Processing";
    }
    if (savingSku === product.sku || product.status === "Uploading") {
        return "Uploading";
    }
    if (product.status === "Uploaded") return "Uploaded";
    if (product.status === "Invalid") return "Error";
    if (product.status === "Missing Images") return "Needs Review";
    if (product.aiNeedsReview && product.aiNeedsReview.length > 0) {
        return "Needs Review";
    }
    if (product.draftSaved) return "Draft";
    return "Ready";
}

function optionList(values: readonly string[]) {
    return values.map((value) => ({ value, label: value }));
}

interface ProductSlotProps {
    product: BulkProduct;
    status: CardStatus;
    aiLoading: boolean;
    uploading: boolean;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onAiFill: () => void;
    onUpload: () => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
    onSetPrimary: (index: number) => void;
    onRemove: (index: number) => void;
    onAppendFiles: (files: File[]) => void;
    onPreview: (index: number) => void;
}

/**
 * One product in the grid: card + image strip.
 *
 * The wrapper is a dnd-kit droppable, so dragging an image onto a product
 * that has no strip yet still moves it there (cross-product move). Native
 * HTML file drops onto the slot append images to that product.
 */
function ProductSlot({
    product,
    status,
    aiLoading,
    uploading,
    onEdit,
    onDuplicate,
    onDelete,
    onAiFill,
    onUpload,
    onReorder,
    onSetPrimary,
    onRemove,
    onAppendFiles,
    onPreview,
}: ProductSlotProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: `product::${product.sku}`,
        data: { type: "product", sku: product.sku },
    });

    const imageIds = product.imageUrls.map(
        (_, index) => `${product.sku}::${index}`,
    );

    const handleDrop = useCallback(
        (event: React.DragEvent) => {
            const files = Array.from(event.dataTransfer?.files ?? []);

            if (files.length === 0) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            onAppendFiles(files);
        },
        [onAppendFiles],
    );

    return (
        <div
            ref={setNodeRef}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className={cn(
                "flex flex-col gap-1.5 transition",
                isOver && "outline-2 outline-offset-2 outline-primary",
            )}
        >
            <ProductCard
                product={product}
                status={status}
                aiLoading={aiLoading}
                uploading={uploading}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onAiFill={onAiFill}
                onUpload={onUpload}
            />

            {imageIds.length > 0 && (
                <SortableContext
                    items={imageIds}
                    strategy={rectSortingStrategy}
                >
                    <div
                        title="Drag photos to reorder · Click a photo to enlarge"
                        className="grid grid-cols-3 gap-2.5 rounded-xl border bg-card p-2"
                    >
                        {product.imageUrls.map((src, index) => (
                            <SortableBulkImage
                                key={imageIds[index]}
                                id={imageIds[index]}
                                sku={product.sku}
                                index={index}
                                src={src}
                                isPrimary={
                                    product.primaryImage
                                        ? src === product.primaryImage
                                        : index === 0
                                }
                                total={product.imageUrls.length}
                                size="lg"
                                onSetPrimary={() => onSetPrimary(index)}
                                onRemove={() => onRemove(index)}
                                onMoveLeft={() => onReorder(index, index - 1)}
                                onMoveRight={() => onReorder(index, index + 1)}
                                onPreview={() => onPreview(index)}
                            />
                        ))}
                    </div>
                </SortableContext>
            )}
        </div>
    );
}

interface ImagePreviewModalProps {
    sku: string;
    title: string;
    images: string[];
    index: number;
    isPrimary: (imageIndex: number) => boolean;
    onNavigate: (nextIndex: number) => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
    onSetPrimary: (imageIndex: number) => void;
    onRemove: (imageIndex: number) => void;
    onClose: () => void;
}

/**
 * Full-size preview: arrows + keyboard cycle photos, footer acts in place.
 */
function ImagePreviewModal({
    sku,
    title,
    images,
    index,
    isPrimary,
    onNavigate,
    onReorder,
    onSetPrimary,
    onRemove,
    onClose,
}: ImagePreviewModalProps) {
    const total = images.length;
    const src = images[index] ?? "";
    const primary = isPrimary(index);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft" && index > 0) {
                event.preventDefault();
                onNavigate(index - 1);
            } else if (event.key === "ArrowRight" && index < total - 1) {
                event.preventDefault();
                onNavigate(index + 1);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [index, total, onNavigate]);

    return (
        <Modal
            open
            onClose={onClose}
            title={title.trim() || `Product ${sku}`}
            description={`SKU ${sku} · Photo ${total === 0 ? 0 : index + 1} of ${total}`}
            className="max-w-4xl"
            footer={
                <div className="flex w-full flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate(index - 1)}
                            disabled={index <= 0}
                        >
                            <ChevronLeft size={14} className="mr-1" />
                            Prev
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate(index + 1)}
                            disabled={index >= total - 1}
                        >
                            Next
                            <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => onSetPrimary(index)}
                            disabled={primary || !src}
                        >
                            <Star size={14} className="mr-1.5" />
                            {primary ? "Cover photo" : "Make cover"}
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => onRemove(index)}
                            disabled={!src || total <= 1}
                        >
                            <Trash2 size={14} className="mr-1.5" />
                            Delete
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                {src ? (
                    <div className="relative max-h-[68dvh] w-full">
                        <Image
                            src={src}
                            alt={`${title.trim() || sku} photo ${index + 1}`}
                            width={1200}
                            height={900}
                            unoptimized
                            className="mx-auto h-auto max-h-[68dvh] w-auto max-w-full rounded-xl object-contain"
                        />
                        {total > 1 && (
                            <>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="iconSm"
                                    onClick={() => onNavigate(index - 1)}
                                    disabled={index <= 0}
                                    aria-label="Previous photo"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow"
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="iconSm"
                                    onClick={() => onNavigate(index + 1)}
                                    disabled={index >= total - 1}
                                    aria-label="Next photo"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <p className="py-16 text-sm text-muted-foreground">
                        No photo to preview.
                    </p>
                )}
                {total > 1 && (
                    <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                        {images.map((_, dotIndex) => (
                            <span
                                key={dotIndex}
                                className={
                                    dotIndex === index
                                        ? "h-1.5 w-4 rounded-full bg-white"
                                        : "h-1.5 w-1.5 rounded-full bg-white/50"
                                }
                            />
                        ))}
                    </div>
                )}
                {/* In-place reorder: move this photo earlier / later in its product */}
                <div className="absolute right-2 top-2 flex gap-1">
                    <Button
                        type="button"
                        variant="secondary"
                        size="iconSm"
                        onClick={() => onReorder(index, index - 1)}
                        disabled={index <= 0}
                        title="Move photo earlier"
                        aria-label="Move photo earlier"
                        className="rounded-full shadow"
                    >
                        <ArrowLeft size={14} />
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="iconSm"
                        onClick={() => onReorder(index, index + 1)}
                        disabled={index >= total - 1}
                        title="Move photo later"
                        aria-label="Move photo later"
                        className="rounded-full shadow"
                    >
                        <ArrowRight size={14} />
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

interface CompactEditorProps {
    product: BulkProduct;
    saving: boolean;
    onUpdate: (updates: Partial<BulkProduct>) => void;
    onClose: () => void;
    onSaveDraft: () => void;
    onPublish: () => void;
    onAiFill: () => void;
    aiLoading: boolean;
    onReorder: (fromIndex: number, toIndex: number) => void;
    onMove: (index: number, toSku: string, toIndex?: number) => void;
    onSetPrimary: (index: number) => void;
    onRemove: (index: number) => void;
    onAppendFiles: (files: File[]) => void;
    /** Replaces all images of the product (optional). */
    onImagesChange?: (files: File[]) => void;
    onPreview: (index: number) => void;
    otherProducts: { sku: string; label: string }[];
}

/**
 * Side-panel editor for a single product: image organizer first, then the
 * compact field grid. Save Draft and Publish are independent per product.
 */
function CompactEditor({
    product,
    saving,
    onUpdate,
    onClose,
    onSaveDraft,
    onPublish,
    onAiFill,
    aiLoading,
    onReorder,
    onMove,
    onSetPrimary,
    onRemove,
    onAppendFiles,
    onImagesChange,
    onPreview,
    otherProducts,
}: CompactEditorProps) {
    const appendInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const [moveFrom, setMoveFrom] = useState("0");
    const [moveTo, setMoveTo] = useState("");

    const priceOptions = useMemo(() => {
        const options = APPROVED_PRICE_SET.map((tier) => ({
            value: String(tier),
            label: `₹${tier}`,
        }));

        if (product.price > 0 && !isApprovedPrice(product.price)) {
            options.push({
                value: String(product.price),
                label: `₹${product.price} (custom)`,
            });
        }

        return options;
    }, [product.price]);

    const tileIds = product.imageUrls.map(
        (_, index) => `${product.sku}::${index}`,
    );

    const canPublish =
        product.status === "Ready" || product.status === "Uploaded";
    const suggestedTier = isApprovedPrice(product.price);

    return (
        <Modal
            open
            onClose={onClose}
            title={product.title?.trim() || `Product ${product.sku}`}
            description={`SKU ${product.sku} · ${product.imageUrls.length} image(s)`}
            className="max-w-3xl"
            dismissible={!saving}
            footer={
                <div className="flex w-full flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onAiFill}
                            disabled={aiLoading || product.imageFiles.length === 0}
                        >
                            {aiLoading ? (
                                <Loader2 size={14} className="mr-1.5 animate-spin" />
                            ) : (
                                <Sparkles size={14} className="mr-1.5" />
                            )}
                            {product.aiGenerated ? "Re-run AI" : "AI fill"}
                        </Button>
                        {product.errors.length > 0 && (
                            <span className="flex items-center gap-1 text-2xs text-red-600 dark:text-red-400">
                                <AlertTriangle size={12} />
                                {product.errors.length} issue(s)
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onSaveDraft}
                            disabled={saving}
                        >
                            Save draft
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={onPublish}
                            disabled={saving || !canPublish}
                            title={canPublish ? undefined : "Fix validation issues first"}
                        >
                            {saving ? (
                                <Loader2 size={14} className="mr-1.5 animate-spin" />
                            ) : (
                                <UploadCloud size={14} className="mr-1.5" />
                            )}
                            {product.status === "Uploaded"
                                ? "Save & publish"
                                : "Publish"}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Image organizer */}
                <section>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Images
                        </h4>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendInputRef.current?.click()}
                        >
                            <Images size={14} className="mr-1.5" />
                            Add images
                        </Button>
                        <input
                            ref={appendInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(event) => {
                                const files = Array.from(
                                    event.target.files ?? [],
                                );
                                if (files.length > 0) {
                                    onAppendFiles(files);
                                }
                                event.target.value = "";
                            }}
                        />
                        {onImagesChange && (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        replaceInputRef.current?.click()
                                    }
                                >
                                    Replace all
                                </Button>
                                <input
                                    ref={replaceInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(event) => {
                                        const files = Array.from(
                                            event.target.files ?? [],
                                        );
                                        if (files.length > 0) {
                                            onImagesChange(files);
                                        }
                                        event.target.value = "";
                                    }}
                                />
                            </>
                        )}
                    </div>

                    <SortableContext
                        items={tileIds}
                        strategy={horizontalListSortingStrategy}
                    >
                        <div className="grid grid-cols-4 gap-2">
                            {product.imageUrls.map((src, index) => (
                                <SortableBulkImage
                                    key={tileIds[index]}
                                    id={tileIds[index]}
                                    sku={product.sku}
                                    index={index}
                                    src={src}
                                    isPrimary={
                                        product.primaryImage
                                            ? src === product.primaryImage
                                            : index === 0
                                    }
                                    total={product.imageUrls.length}
                                    size="sm"
                                    onSetPrimary={() => onSetPrimary(index)}
                                    onRemove={() => onRemove(index)}
                                    onMoveLeft={() => onReorder(index, index - 1)}
                                    onMoveRight={() => onReorder(index, index + 1)}
                                    onPreview={() => onPreview(index)}
                                />
                            ))}
                            {product.imageUrls.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No images yet. Drop files on the card or
                                    use “Add images”.
                                </p>
                            )}
                        </div>
                    </SortableContext>

                    {/* Touch fallback: move an image to another product */}
                    {otherProducts.length > 0 &&
                        product.imageUrls.length > 0 && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Select
                                    value={moveFrom}
                                    onChange={(event) =>
                                        setMoveFrom(event.target.value)
                                    }
                                    options={product.imageUrls.map(
                                        (_, index) => ({
                                            value: String(index),
                                            label: `Image ${index + 1}`,
                                        }),
                                    )}
                                    className="h-8 w-32 text-xs"
                                    aria-label="Image to move"
                                />
                                <Select
                                    value={moveTo}
                                    onChange={(event) => {
                                        const toSku = event.target.value;
                                        if (!toSku) return;
                                        onMove(Number(moveFrom), toSku);
                                        setMoveTo("");
                                    }}
                                    options={[
                                        { value: "", label: "Move to product…" },
                                        ...otherProducts.map((product) => ({
                                            value: product.sku,
                                            label: product.label,
                                        })),
                                    ]}
                                    className="h-8 w-44 text-xs"
                                    aria-label="Move image to product"
                                />
                            </div>
                        )}
                </section>

                {/* Field grid */}
                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <label className="col-span-2 flex flex-col gap-1 sm:col-span-3">
                        <span className="text-xs font-medium text-muted-foreground">
                            Title
                        </span>
                        <Input
                            value={product.title}
                            onChange={(event) =>
                                onUpdate({ title: event.target.value })
                            }
                            placeholder="Vintage Levi's 501"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Brand
                        </span>
                        <Input
                            value={product.brand}
                            onChange={(event) =>
                                onUpdate({ brand: event.target.value })
                            }
                            placeholder="Levi's"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Price
                        </span>
                        <Select
                            value={
                                product.price > 0 ? String(product.price) : ""
                            }
                            onChange={(event) =>
                                onUpdate({ price: Number(event.target.value) })
                            }
                            options={priceOptions}
                            placeholder="Select price"
                        />
                        <span className="text-2xs text-muted-foreground">
                            {suggestedTier
                                ? "Approved tier"
                                : product.aiGenerated
                                    ? "AI price is not an approved tier"
                                    : "Tiers: ₹99 · ₹199 · ₹299 · ₹320 · ₹799 · ₹899"}
                        </span>
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Condition
                        </span>
                        <Select
                            value={product.condition}
                            onChange={(event) =>
                                onUpdate({ condition: event.target.value })
                            }
                            options={optionList(CONDITION_OPTIONS)}
                            placeholder="Select condition"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Gender
                        </span>
                        <Select
                            value={product.gender}
                            onChange={(event) =>
                                onUpdate({
                                    gender: event.target
                                        .value as BulkProduct["gender"],
                                })
                            }
                            options={optionList(GENDER_OPTIONS)}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Category
                        </span>
                        <Select
                            value={product.category}
                            onChange={(event) =>
                                onUpdate({ category: event.target.value })
                            }
                            options={optionList(CATEGORY_OPTIONS)}
                            placeholder="Select category"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Size
                        </span>
                        <Input
                            value={product.size}
                            onChange={(event) =>
                                onUpdate({ size: event.target.value })
                            }
                            placeholder="M / 32"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Color
                        </span>
                        <Input
                            value={product.color ?? ""}
                            onChange={(event) =>
                                onUpdate({ color: event.target.value })
                            }
                            placeholder="Blue"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Material
                        </span>
                        <Input
                            value={product.material}
                            onChange={(event) =>
                                onUpdate({ material: event.target.value })
                            }
                            placeholder="Cotton"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Chest (in)
                        </span>
                        <Input
                            value={product.chest ?? ""}
                            onChange={(event) =>
                                onUpdate({ chest: event.target.value })
                            }
                            placeholder="20"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Waist (in)
                        </span>
                        <Input
                            value={product.waist ?? ""}
                            onChange={(event) =>
                                onUpdate({ waist: event.target.value })
                            }
                            placeholder="16"
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Length (in)
                        </span>
                        <Input
                            value={product.length ?? ""}
                            onChange={(event) =>
                                onUpdate({ length: event.target.value })
                            }
                            placeholder="27"
                        />
                    </label>

                    <label className="col-span-2 flex flex-col gap-1 sm:col-span-3">
                        <span className="text-xs font-medium text-muted-foreground">
                            Description
                        </span>
                        <Textarea
                            value={product.description ?? ""}
                            rows={3}
                            onChange={(event) =>
                                onUpdate({ description: event.target.value })
                            }
                            placeholder="Condition details, fit notes, flaws…"
                        />
                    </label>
                </section>

                {product.errors.length > 0 && (
                    <ul className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/40">
                        {product.errors.map((error) => (
                            <li
                                key={error}
                                className="text-2xs text-red-700 dark:text-red-300"
                            >
                                {error}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Modal>
    );
}

/**
 * CompactWorkspace — image-first bulk upload workspace.
 *
 * - Toolbar: folder / image / blank-product pickers plus batch actions.
 * - Grid of ProductSlot cards with per-product image strips, all under one
 *   DndContext so images can be reordered within a product or dragged onto
 *   another product. Native file drops land on individual cards.
 * - CompactEditor opens as a side modal for one product; Save Draft and
 *   Publish are independent per product.
 * - Background AI runs non-blockingly: progress shows as an inline banner,
 *   never a modal.
 */
export default function CompactWorkspace({
    products,
    aiLoadingSku,
    aiPendingSkus = [],
    aiRunning,
    aiProcessingInfo,
    savingSku,
    uploading,
    onAddRow,
    onAddRows,
    onFilesSelected,
    onFolderSelected,
    onUpdate,
    onImagesChange,
    onDelete,
    onDuplicate,
    onAiFill,
    onAiFillAll,
    onSaveSingle,
    onPublishAll,
    onReorderImage,
    onMoveImage,
    onSetPrimary,
    onRemoveImage,
    onAppendImages,
}: CompactWorkspaceProps) {
    const folderInputRef = useRef<HTMLInputElement>(null);
    const imagesInputRef = useRef<HTMLInputElement>(null);
    const [editingSku, setEditingSku] = useState<string | null>(null);
    const [preview, setPreview] = useState<{ sku: string; index: number } | null>(
        null,
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
        useSensor(KeyboardSensor),
    );

    const editingProduct =
        products.find((product) => product.sku === editingSku) ?? null;

    const previewProduct = useMemo(
        () => products.find((p) => p.sku === preview?.sku) ?? null,
        [products, preview],
    );

    const stats = useMemo(() => {
        let ready = 0;
        let needsAttention = 0;
        let saved = 0;

        for (const product of products) {
            if (product.status === "Uploaded") {
                saved += 1;
            } else if (product.status === "Ready") {
                ready += 1;
            } else {
                needsAttention += 1;
            }
        }

        return { ready, needsAttention, saved };
    }, [products]);

    /* Prefer image tiles over their product wrappers when both are hit. */
    const collisionDetection: CollisionDetection = useCallback((args) => {
        const pointerHits = pointerWithin(args);

        if (pointerHits.length > 0) {
            const tileHit = pointerHits.find(
                (hit) => !String(hit.id).startsWith("product::"),
            );
            if (tileHit) {
                return [tileHit];
            }
            return pointerHits;
        }

        return closestCenter(args);
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over) {
                return;
            }

            const from = active.data.current as
                | { sku?: string; index?: number }
                | undefined;

            if (!from?.sku || typeof from.index !== "number") {
                return;
            }

            const to = over.data.current as
                | { sku?: string; index?: number; type?: string }
                | undefined;

            if (to?.type === "product" && to.sku) {
                if (to.sku !== from.sku) {
                    onMoveImage(from.sku, from.index, to.sku);
                }
                return;
            }

            if (!to?.sku || typeof to.index !== "number") {
                return;
            }

            if (to.sku === from.sku) {
                if (to.index !== from.index) {
                    onReorderImage(from.sku, from.index, to.index);
                }
            } else {
                onMoveImage(from.sku, from.index, to.sku, to.index);
            }
        },
        [onMoveImage, onReorderImage],
    );

    const otherProducts = products
        .filter((product) => product.sku !== editingSku)
        .map((product) => ({
            sku: product.sku,
            label: product.title?.trim() || product.sku,
        }));

    const aiStatus = aiRunning
        ? aiProcessingInfo
            ? `AI analyzing ${aiProcessingInfo.current}/${aiProcessingInfo.total} · ${aiProcessingInfo.currentSku}`
            : "AI analyzing…"
        : null;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => folderInputRef.current?.click()}
                >
                    <FolderOpen size={14} className="mr-1.5" />
                    Choose folder
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => imagesInputRef.current?.click()}
                >
                    <Images size={14} className="mr-1.5" />
                    Add images
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={onAddRow}
                >
                    <Plus size={14} className="mr-1.5" />
                    Blank product
                </Button>

                {onAddRows && (
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            min={1}
                            max={50}
                            defaultValue={5}
                            aria-label="Number of blank products"
                            className="h-8 w-16 rounded-lg border border-border bg-card px-2 text-xs outline-none focus:border-foreground"
                            onKeyDown={(event) => {
                                if (event.key !== "Enter") return;
                                const value = Number(
                                    event.currentTarget.value,
                                );
                                if (Number.isFinite(value) && value >= 1) {
                                    onAddRows(value);
                                }
                            }}
                        />
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(event) => {
                                const input =
                                    event.currentTarget
                                        .previousElementSibling;
                                const value =
                                    input instanceof HTMLInputElement
                                        ? Number(input.value)
                                        : NaN;
                                if (Number.isFinite(value) && value >= 1) {
                                    onAddRows(value);
                                }
                            }}
                        >
                            Add N
                        </Button>
                    </div>
                )}

                <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onAiFillAll}
                    disabled={aiRunning || products.length === 0}
                >
                    <Wand2 size={14} className="mr-1.5" />
                    AI fill all
                </Button>

                <div className="ml-auto flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        onClick={onPublishAll}
                        disabled={uploading || stats.ready === 0}
                        title={
                            stats.ready === 0
                                ? "No validated products to publish"
                                : undefined
                        }
                    >
                        <UploadCloud size={14} className="mr-1.5" />
                        Publish ready ({stats.ready})
                    </Button>
                </div>

                <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    {...({ webkitdirectory: "", directory: "" } as Record<
                        string,
                        string
                    >)}
                    onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        if (files.length > 0) {
                            onFolderSelected(files);
                        }
                        event.target.value = "";
                    }}
                />
                <input
                    ref={imagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        if (files.length > 0) {
                            onFilesSelected(files);
                        }
                        event.target.value = "";
                    }}
                />
            </div>

            {/* Inline status strip: counts + non-blocking AI progress */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{products.length} product(s)</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                    {stats.ready} ready
                </span>
                {stats.needsAttention > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                        {stats.needsAttention} need attention
                    </span>
                )}
                <span>{stats.saved} saved</span>

                {aiStatus && (
                    <span className="ml-auto flex items-center gap-1.5 text-foreground">
                        <Loader2 size={12} className="animate-spin" />
                        {aiStatus}
                    </span>
                )}
                {!aiStatus && aiLoadingSku && (
                    <span className="ml-auto flex items-center gap-1.5 text-foreground">
                        <Loader2 size={12} className="animate-spin" />
                        AI on {aiLoadingSku}
                    </span>
                )}
            </div>

            {/* Grid */}
            {products.length === 0 ? (
                <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                        event.preventDefault();
                        const files = Array.from(
                            event.dataTransfer?.files ?? [],
                        );
                        if (files.length > 0) {
                            onFilesSelected(files);
                        }
                    }}
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center"
                >
                    <PackageOpen size={36} className="text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">
                            Drop a folder or images here
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Photos are grouped into products automatically.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => folderInputRef.current?.click()}
                        >
                            <FolderOpen size={14} className="mr-1.5" />
                            Choose folder
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => imagesInputRef.current?.click()}
                        >
                            <Images size={14} className="mr-1.5" />
                            Add images
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={onAddRow}
                        >
                            <Plus size={14} className="mr-1.5" />
                            Blank product
                        </Button>
                    </div>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={collisionDetection}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {products.map((product) => (
                            <ProductSlot
                                key={product.sku}
                                product={product}
                                status={deriveStatus(
                                    product,
                                    aiLoadingSku,
                                    aiPendingSkus,
                                    savingSku,
                                )}
                                aiLoading={aiLoadingSku === product.sku}
                                uploading={
                                    uploading || savingSku === product.sku
                                }
                                onEdit={() => setEditingSku(product.sku)}
                                onDuplicate={() => onDuplicate(product.sku)}
                                onDelete={() => onDelete(product.sku)}
                                onAiFill={() => onAiFill(product.sku)}
                                onUpload={() => onSaveSingle(product.sku, true)}
                                onReorder={(fromIndex, toIndex) =>
                                    onReorderImage(
                                        product.sku,
                                        fromIndex,
                                        toIndex,
                                    )
                                }
                                onSetPrimary={(index) =>
                                    onSetPrimary(product.sku, index)
                                }
                                onRemove={(index) =>
                                    onRemoveImage(product.sku, index)
                                }
                                onAppendFiles={(files) =>
                                    onAppendImages(product.sku, files)
                                }
                                onPreview={(index) =>
                                    setPreview({
                                        sku: product.sku,
                                        index,
                                    })
                                }
                            />
                        ))}
                    </div>

                    {editingProduct && (
                        <CompactEditor
                            product={editingProduct}
                            saving={savingSku === editingProduct.sku}
                            aiLoading={aiLoadingSku === editingProduct.sku}
                            onUpdate={(updates) =>
                                onUpdate(editingProduct.sku, updates)
                            }
                            onClose={() => setEditingSku(null)}
                            onSaveDraft={() =>
                                onSaveSingle(editingProduct.sku, false)
                            }
                            onPublish={() =>
                                onSaveSingle(editingProduct.sku, true)
                            }
                            onAiFill={() => onAiFill(editingProduct.sku)}
                            onReorder={(fromIndex, toIndex) =>
                                onReorderImage(
                                    editingProduct.sku,
                                    fromIndex,
                                    toIndex,
                                )
                            }
                            onMove={(index, toSku, toIndex) =>
                                onMoveImage(
                                    editingProduct.sku,
                                    index,
                                    toSku,
                                    toIndex,
                                )
                            }
                            onSetPrimary={(index) =>
                                onSetPrimary(editingProduct.sku, index)
                            }
                            onRemove={(index) =>
                                onRemoveImage(editingProduct.sku, index)
                            }
                            onAppendFiles={(files) =>
                                onAppendImages(editingProduct.sku, files)
                            }
                            onImagesChange={(files) =>
                                onImagesChange?.(editingProduct.sku, files)
                            }
                            onPreview={(index) =>
                                setPreview({
                                    sku: editingProduct.sku,
                                    index,
                                })
                            }
                            otherProducts={otherProducts}
                        />
                    )}

                    {previewProduct && preview && (
                        <ImagePreviewModal
                            sku={previewProduct.sku}
                            title={previewProduct.title}
                            images={previewProduct.imageUrls}
                            index={Math.min(
                                preview.index,
                                Math.max(previewProduct.imageUrls.length - 1, 0),
                            )}
                            isPrimary={(imageIndex) =>
                                previewProduct.primaryImage
                                    ? previewProduct.imageUrls[imageIndex] ===
                                      previewProduct.primaryImage
                                    : imageIndex === 0
                            }
                            onNavigate={(nextIndex) =>
                                setPreview({ sku: previewProduct.sku, index: nextIndex })
                            }
                            onReorder={(fromIndex, toIndex) => {
                                onReorderImage(
                                    previewProduct.sku,
                                    fromIndex,
                                    toIndex,
                                );
                                setPreview({
                                    sku: previewProduct.sku,
                                    index: toIndex,
                                });
                            }}
                            onSetPrimary={(imageIndex) =>
                                onSetPrimary(previewProduct.sku, imageIndex)
                            }
                            onRemove={(imageIndex) => {
                                onRemoveImage(previewProduct.sku, imageIndex);
                                const remaining = previewProduct.imageUrls.length - 1;
                                if (remaining <= 0) {
                                    setPreview(null);
                                } else {
                                    setPreview({
                                        sku: previewProduct.sku,
                                        index: Math.min(imageIndex, remaining - 1),
                                    });
                                }
                            }}
                            onClose={() => setPreview(null)}
                        />
                    )}
                </DndContext>
            )}
        </div>
    );
}


