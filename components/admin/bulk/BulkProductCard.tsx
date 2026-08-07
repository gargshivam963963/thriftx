"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Trash2,
    Copy,
    MoreHorizontal,
    Plus,
    X,
    GripVertical,
    Star,
    Eye,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BulkProduct } from "@/app/lib/bulk/types";
import { getImageLabels } from "@/app/lib/bulk/image-sorter";
import {
    getCategoryMeasurements,
    type MeasurementConfig,
} from "@/app/lib/bulk/categoryMeasurements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/Card";

const GENDER_OPTIONS = ["Men", "Women", "Kids", "Unisex"];
const CONDITION_OPTIONS = [
    "Brand New with Tags",
    "Brand New without Tags",
    "Like New",
    "Excellent",
    "Very Good",
    "Good",
    "Fair",
];
const ALL_CATEGORIES = [
    "T-Shirts", "Shirts", "Hoodies", "Sweatshirts", "Jackets", "Blazers",
    "Tops", "Jeans", "Cargo", "Trousers", "Shorts", "Skirts", "Dresses", "Lower",
];

const LABEL_COLORS: Record<string, string> = {
    Front: "bg-blue-500",
    Back: "bg-purple-500",
    "Brand Tag": "bg-amber-500",
    "Size Tag": "bg-emerald-500",
    Fabric: "bg-rose-500",
    Defect: "bg-red-500",
};

// ── Confidence Badge ────────────────────────────────────────────────
function ConfidenceBadge({ score, label }: { score: number; label: string }) {
    const isLow = score < 70;
    const isMedium = score >= 70 && score < 85;

    return (
        <Tooltip content={`${label} · AI confidence ${score}%`}>
            <span
                className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-badge font-semibold",
                    isLow
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : isMedium
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                )}
            >
                <span className="capitalize">{label}</span>
                <span className="opacity-75">{score}%</span>
                {isLow && (
                    <AlertCircle size={8} className="shrink-0" />
                )}
            </span>
        </Tooltip>
    );
}

// ── Image Preview Modal ────────────────────────────────────────────
function ImagePreviewModal({
    images,
    currentIndex,
    onClose,
    onPrev,
    onNext,
}: {
    images: { src: string; label: string }[];
    currentIndex: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}) {
    const img = images[currentIndex];
    if (!img) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="relative max-h-[90vh] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
            >
                <Button
                    onClick={onClose}
                    variant="secondary"
                    size="iconSm"
                    rounded="full"
                    className="absolute -top-3 -right-3 z-10 shadow-lg"
                >
                    <X size={14} />
                </Button>

                {images.length > 1 && (
                    <Button
                        onClick={onPrev}
                        variant="secondary"
                        size="iconSm"
                        rounded="full"
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                    >
                        <ChevronLeft size={18} />
                    </Button>
                )}

                <div className="relative overflow-hidden rounded-2xl bg-foreground shadow-2xl">
                    <Image
                        src={img.src}
                        alt={img.label}
                        width={1200}
                        height={1600}
                        className="max-h-[80vh] w-auto object-contain"
                        priority
                        unoptimized
                        style={{ maxWidth: "80vw", height: "auto" }}
                    />
                    <span
                        className={cn(
                            "absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-lg",
                            LABEL_COLORS[img.label] || "bg-muted-foreground",
                        )}
                    >
                        {img.label} · {currentIndex + 1}/{images.length}
                    </span>
                </div>

                {images.length > 1 && (
                    <Button
                        onClick={onNext}
                        variant="secondary"
                        size="iconSm"
                        rounded="full"
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                    >
                        <ChevronRight size={18} />
                    </Button>
                )}
            </motion.div>
        </motion.div>
    );
}

// ── Field (inline editable) ────────────────────────────────────────
function Field({
    label,
    value,
    placeholder,
    onChange,
    required,
    prefix,
    confidence,
    className,
}: {
    label: string;
    value: string;
    placeholder: string;
    onChange: (v: string) => void;
    required?: boolean;
    prefix?: string;
    confidence?: number;
    className?: string;
}) {
    return (
        <div className={cn("space-y-1", className)}>
            <div className="flex items-center justify-between gap-1">
                <label className="flex items-center gap-0.5 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                    {required && <span className="text-red-400">*</span>}
                </label>
                {confidence !== undefined && (
                    <ConfidenceBadge score={confidence} label="" />
                )}
            </div>
            <div className="relative">
                {prefix && (
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                        {prefix}
                    </span>
                )}
                <Input
                    type={prefix ? "number" : "text"}
                    value={prefix && value ? value : value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "h-8 rounded-lg text-xs px-2.5",
                        prefix && "pl-6",
                    )}
                />
            </div>
        </div>
    );
}

function SelectField({
    label,
    value,
    options,
    onChange,
    required,
    confidence,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
    required?: boolean;
    confidence?: number;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-1">
                <label className="flex items-center gap-0.5 text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                    {required && <span className="text-red-400">*</span>}
                </label>
                {confidence !== undefined && (
                    <ConfidenceBadge score={confidence} label="" />
                )}
            </div>
            <Select
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Select..."
                options={options.map((o) => ({ value: o, label: o }))}
                className="h-8 py-0 rounded-lg text-xs px-2.5"
            />
        </div>
    );
}

// ── Main Product Card ──────────────────────────────────────────────
interface BulkProductCardProps {
    product: BulkProduct;
    index: number;
    onUpdate: (sku: string, updates: Partial<BulkProduct>) => void;
    onImagesChange: (sku: string, files: File[]) => void;
    onDeleteRow: (sku: string) => void;
    onDuplicate: (sku: string) => void;
    onAiFill: (sku: string) => void;
    aiLoading: boolean;
}

export default function BulkProductCard({
    product,
    index,
    onUpdate,
    onImagesChange,
    onDeleteRow,
    onDuplicate,
    onAiFill,
    aiLoading,
}: BulkProductCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [previewModal, setPreviewModal] = useState<{
        images: { src: string; label: string }[];
        currentIndex: number;
    } | null>(null);

    const hasErrors = product.errors.length > 0;
    const imageCount = product.imageFiles.length;
    const rule = getCategoryMeasurements(product.category);
    const measurements =
        product.category.trim() === "" ? [] : rule.measurements;
    const labels = getImageLabels(imageCount);

    const conf = product.aiConfidence || {};

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (files.length) {
            onImagesChange(product.sku, [...product.imageFiles, ...files]);
        }
        e.target.value = "";
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/"),
        );
        if (files.length) {
            onImagesChange(product.sku, [...product.imageFiles, ...files]);
        }
        setDragOverIndex(null);
    }

    function handleImageDragStart(e: React.DragEvent, fromIndex: number) {
        e.dataTransfer.setData("text/plain", String(fromIndex));
    }

    function handleImageDrop(e: React.DragEvent, toIndex: number) {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (isNaN(fromIndex) || fromIndex === toIndex) return;
        const newFiles = [...product.imageFiles];
        const [moved] = newFiles.splice(fromIndex, 1);
        newFiles.splice(toIndex, 0, moved);
        onImagesChange(product.sku, newFiles);
        setDragOverIndex(null);
    }

    function removeImage(idx: number) {
        onImagesChange(
            product.sku,
            product.imageFiles.filter((_, i) => i !== idx),
        );
    }

    function setCover(idx: number) {
        const newFiles = [...product.imageFiles];
        const [moved] = newFiles.splice(idx, 1);
        newFiles.unshift(moved);
        onImagesChange(product.sku, newFiles);
    }

    function openPreview(idx: number) {
        const images = product.imageFiles.map((f, i) => ({
            src: URL.createObjectURL(f),
            label: labels[i] || `Img ${i + 1}`,
        }));
        if (images.length) setPreviewModal({ images, currentIndex: idx });
    }

    return (
        <>
            <Card
                className={cn(
                    "group/card relative overflow-hidden rounded-2xl border bg-white transition-all duration-300",
                    hasErrors
                        ? "border-red-200 shadow-sm dark:border-red-800/50"
                        : "border-border shadow-sm hover:shadow-xl hover:-translate-y-0.5 dark:border-border/60",
                )}
            >
                <CardContent className="p-0">
                    {/* ═══ Header ═══ */}
                    <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5 dark:border-border">
                        <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-muted-foreground">
                                #{String(index + 1).padStart(2, "0")}
                            </span>
                            <Badge variant="secondary" size="xs" rounded="md" className="font-mono tracking-tight">
                                {product.sku}
                            </Badge>
                            {hasErrors ? (
                                <Badge variant="error" size="xs" className="gap-1">
                                    <AlertCircle size={9} />
                                    {product.errors.length}
                                </Badge>
                            ) : (
                                <Badge variant="success" size="xs" className="gap-1">
                                    <CheckCircle2 size={9} />
                                    Ready
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-0.5">
                            <Tooltip content="Duplicate product">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="iconXs"
                                    onClick={() => onDuplicate(product.sku)}
                                    className="text-muted-foreground hover:text-muted-foreground"
                                >
                                    <Copy size={12} />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Delete product">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="iconXs"
                                    onClick={() => onDeleteRow(product.sku)}
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    <Trash2 size={12} />
                                </Button>
                            </Tooltip>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="iconXs" className="text-muted-foreground">
                                        <MoreHorizontal size={13} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem
                                        onClick={() => onAiFill(product.sku)}
                                        disabled={aiLoading || imageCount === 0}
                                    >
                                        <Sparkles size={12} className="mr-2" />
                                        AI Fill
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDuplicate(product.sku)}>
                                        <Copy size={12} className="mr-2" />
                                        Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDeleteRow(product.sku)}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Trash2 size={12} className="mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="space-y-3.5 p-3.5">
                        {/* ═══ Cover + Thumbnail strip ═══ */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className={cn(
                                "rounded-xl border-2 border-dashed p-2 transition-colors",
                                dragOverIndex === -1
                                    ? "border-violet-400 bg-violet-50/60 dark:border-violet-500 dark:bg-violet-950/20"
                                    : "border-border",
                            )}
                        >
                            {imageCount === 0 ? (
                                <Button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex w-full flex-col items-center justify-center gap-1.5 py-8 text-center"
                                >
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                        <Plus size={15} className="text-muted-foreground" />
                                    </div>
                                    <p className="text-[11px] font-medium text-muted-foreground">
                                        Add images (first = cover)
                                    </p>
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    {/* Cover image */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
                                        <Button
                                            type="button"
                                            onClick={() => openPreview(0)}
                                            className="group/cover relative h-full w-full"
                                        >
                                            <Image
                                                src={URL.createObjectURL(product.imageFiles[0])}
                                                alt={labels[0] || "Cover"}
                                                fill
                                                unoptimized
                                                className="object-cover transition duration-300 group-hover/cover:scale-105"
                                                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover/cover:bg-black/20">
                                                <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 backdrop-blur-sm transition group-hover/cover:opacity-100">
                                                    <Eye size={11} />
                                                    Preview
                                                </span>
                                            </div>
                                        </Button>

                                        {/* +N badge */}
                                        {imageCount > 1 && (
                                            <div className="absolute bottom-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-md bg-black/60 px-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
                                                +{imageCount - 1}
                                            </div>
                                        )}
                                        <div className="absolute left-2 top-2">
                                            <Badge variant="default" size="xs" rounded="md" className="bg-amber-500 text-white dark:bg-amber-500 dark:text-white">
                                                <Star size={9} className="fill-current" />
                                                Cover
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Thumbnail strip */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.imageFiles.map((file, i) => (
                                            <div
                                                key={i}
                                                draggable
                                                onDragStart={(e) => handleImageDragStart(e, i)}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setDragOverIndex(i);
                                                }}
                                                onDragLeave={() => setDragOverIndex(null)}
                                                onDrop={(e) => handleImageDrop(e, i)}
                                                className={cn(
                                                    "group/thumb relative h-11 w-11 shrink-0 overflow-hidden rounded-md border bg-muted transition",
                                                    dragOverIndex === i
                                                        ? "border-violet-400 scale-110 shadow-md"
                                                        : "border-border",
                                                    i === 0 && "ring-1 ring-amber-400",
                                                )}
                                            >
                                                <Button
                                                    type="button"
                                                    onClick={() => openPreview(i)}
                                                    className="relative h-full w-full"
                                                >
                                                    <Image
                                                        src={URL.createObjectURL(file)}
                                                        alt={labels[i] || `Image ${i + 1}`}
                                                        fill
                                                        unoptimized
                                                        className="object-cover transition group-hover/thumb:scale-110"
                                                        sizes="44px"
                                                    />
                                                </Button>

                                                {/* Hover actions */}
                                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-black/60 p-0.5 opacity-0 backdrop-blur-sm transition group-hover/thumb:opacity-100">
                                                    <Button
                                                        type="button"
                                                        onClick={() => openPreview(i)}
                                                        className="rounded p-0.5 text-white hover:bg-white/20"
                                                        title="Preview"
                                                    >
                                                        <Eye size={8} />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeImage(i)}
                                                        className="rounded p-0.5 text-red-300 hover:bg-red-500/30"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={8} />
                                                    </Button>
                                                    {i !== 0 && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => setCover(i)}
                                                            className="rounded p-0.5 text-amber-300 hover:bg-amber-500/30"
                                                            title="Set cover"
                                                        >
                                                            <Star size={8} />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="absolute left-0.5 top-0.5 cursor-grab text-white opacity-0 drop-shadow transition group-hover/thumb:opacity-100">
                                                    <GripVertical size={9} />
                                                </div>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground transition hover:border-violet-400 hover:text-violet-400 dark:border-border"
                                        >
                                            <Plus size={13} />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {/* ═══ Required Fields ═══ */}
                        <div className="grid grid-cols-2 gap-2">
                            <Field
                                label="Brand"
                                value={product.brand}
                                placeholder="e.g. Nike"
                                onChange={(v) => onUpdate(product.sku, { brand: v })}
                                required
                                confidence={conf.brand}
                            />
                            <Field
                                label="Title"
                                value={product.title}
                                placeholder="Product name"
                                onChange={(v) => onUpdate(product.sku, { title: v })}
                                required
                                confidence={conf.title}
                                className="col-span-2"
                            />
                            <Field
                                label="Price"
                                value={product.price > 0 ? String(product.price) : ""}
                                placeholder="499"
                                onChange={(v) =>
                                    onUpdate(product.sku, { price: parseFloat(v) || 0 })
                                }
                                prefix="₹"
                                required
                            />
                            <Field
                                label="Size"
                                value={product.size || ""}
                                placeholder={rule.showSizeTag ? "M / L / XL" : "N/A"}
                                onChange={(v) => onUpdate(product.sku, { size: v })}
                                confidence={conf.size}
                            />
                            <SelectField
                                label="Category"
                                value={product.category}
                                options={ALL_CATEGORIES}
                                onChange={(v) => onUpdate(product.sku, { category: v })}
                                required
                                confidence={conf.category}
                            />
                            <SelectField
                                label="Gender"
                                value={product.gender}
                                options={GENDER_OPTIONS}
                                onChange={(v) => onUpdate(product.sku, { gender: v as any })}
                                confidence={conf.gender}
                            />
                            <SelectField
                                label="Condition"
                                value={product.condition}
                                options={CONDITION_OPTIONS}
                                onChange={(v) => onUpdate(product.sku, { condition: v })}
                            />
                            <Field
                                label="Color"
                                value={product.color || ""}
                                placeholder="e.g. Black"
                                onChange={(v) => onUpdate(product.sku, { color: v })}
                                confidence={conf.color}
                            />
                            <Field
                                label="Material"
                                value={product.material || ""}
                                placeholder="e.g. Cotton"
                                onChange={(v) => onUpdate(product.sku, { material: v })}
                                required
                                confidence={conf.material}
                            />
                        </div>

                        {/* ═══ Measurements (one section) ═══ */}
                        {measurements.length > 0 && (
                            <div>
                                <div className="mb-1.5 flex items-center gap-1.5">
                                    <span className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                        Measurements
                                    </span>
                                    <span className="text-badge text-muted-foreground">·</span>
                                    <span className="truncate text-badge italic text-muted-foreground">
                                        {rule.hint}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {measurements.map((m: MeasurementConfig) => {
                                        const raw = product[m.field as keyof BulkProduct];
                                        const val =
                                            raw === undefined || raw === null || raw === 0
                                                ? ""
                                                : String(raw);
                                        return (
                                            <Field
                                                key={m.field}
                                                label={m.label}
                                                value={val}
                                                placeholder={m.placeholder}
                                                required={m.required}
                                                onChange={(v) =>
                                                    onUpdate(product.sku, {
                                                        [m.field]: v,
                                                    })
                                                }
                                                confidence={conf[m.field]}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ═══ Description ═══ */}
                        <div>
                            <div className="mb-1 flex items-center gap-1">
                                <span className="text-badge font-semibold uppercase tracking-wider text-muted-foreground">
                                    Description
                                </span>
                                <span className="text-red-400">*</span>
                                {conf.description !== undefined && (
                                    <span className="ml-auto">
                                        <ConfidenceBadge score={conf.description} label="" />
                                    </span>
                                )}
                            </div>
                            <Textarea
                                value={product.description || ""}
                                onChange={(e) =>
                                    onUpdate(product.sku, { description: e.target.value })
                                }
                                placeholder="Describe condition, fit, style..."
                                className="min-h-[52px] rounded-lg text-xs"
                            />
                        </div>

                        {/* ═══ Errors ═══ */}
                        {hasErrors && (
                            <div className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 dark:border-red-800/50 dark:bg-red-950/20">
                                <p className="mb-1 text-badge font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                                    Issues
                                </p>
                                <ul className="space-y-0.5">
                                    {product.errors.map((err, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-1.5 text-[10px] text-red-500 dark:text-red-400"
                                        >
                                            <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-red-400" />
                                            {err}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* ═══ AI Confidence Summary ═══ */}
                        {(product.aiConfidence ||
                            product.aiNeedsReview?.length) ? (
                            <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-2.5 dark:border-violet-900/30 dark:bg-violet-950/10">
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-badge font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                                        <Sparkles size={10} />
                                        AI Confidence
                                    </span>
                                    {product.aiNeedsReview?.length ? (
                                        <Badge variant="warning" size="xs" className="gap-1">
                                            <AlertCircle size={9} />
                                            {product.aiNeedsReview.length} need review
                                        </Badge>
                                    ) : (
                                        <Badge variant="success" size="xs" className="gap-1">
                                            <CheckCircle2 size={9} />
                                            High
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(conf).map(([field, score]) => (
                                        <ConfidenceBadge key={field} score={score} label={field} />
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* ═══ AI Fill Button ═══ */}
                        <div className="flex items-center gap-2 pt-0.5">
                            <Button
                                type="button"
                                onClick={() => onAiFill(product.sku)}
                                disabled={aiLoading || imageCount === 0}
                                variant="secondary"
                                size="sm"
                                className="flex-1 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/30 dark:text-violet-400 dark:hover:bg-violet-950/50"
                                leftIcon={
                                    aiLoading ? (
                                        <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={13} />
                                    )
                                }
                            >
                                {aiLoading ? "Filling..." : "AI Fill"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewModal && (
                    <ImagePreviewModal
                        images={previewModal.images}
                        currentIndex={previewModal.currentIndex}
                        onClose={() => setPreviewModal(null)}
                        onPrev={() =>
                            setPreviewModal((prev) =>
                                prev
                                    ? {
                                        ...prev,
                                        currentIndex:
                                            prev.currentIndex === 0
                                                ? prev.images.length - 1
                                                : prev.currentIndex - 1,
                                    }
                                    : null,
                            )
                        }
                        onNext={() =>
                            setPreviewModal((prev) =>
                                prev
                                    ? {
                                        ...prev,
                                        currentIndex:
                                            prev.currentIndex === prev.images.length - 1
                                                ? 0
                                                : prev.currentIndex + 1,
                                    }
                                    : null,
                            )
                        }
                    />
                )}
            </AnimatePresence>
        </>
    );
}

