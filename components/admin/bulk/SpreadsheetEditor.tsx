"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Trash2,
    Upload,
    Image as ImageIcon,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight,
    X,
    Search,
    Download,
    ShieldCheck,
    GripVertical,
    Copy,
    ArrowUpDown,
    Star,
} from "lucide-react";
import type { BulkProduct } from "@/app/lib/bulk/types";
import { getImageLabels } from "@/app/lib/bulk/image-sorter";
import { getCategoryMeasurements, type CategoryMeasurementRule, type MeasurementConfig } from "@/app/lib/bulk/categoryMeasurements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
} from "@/components/ui/Card";
import { Select } from "@/components/ui/select";
import EmptyState from "@/components/ui/EmptyState";

const LABEL_COLORS: Record<string, string> = {
    Front: "bg-blue-500",
    Back: "bg-purple-500",
    "Brand Tag": "bg-amber-500",
    "Size Tag": "bg-emerald-500",
    Fabric: "bg-rose-500",
    Defect: "bg-red-500",
};

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

interface Props {
    products: BulkProduct[];
    onUpdate: (sku: string, updates: Partial<BulkProduct>) => void;
    onAddRow: () => void;
    onDeleteRow: (sku: string) => void;
    onImagesChange: (sku: string, files: File[]) => void;
    onAiFill: (sku: string) => void;
    aiLoadingSku: string | null;
    onUpload: () => void;
    uploading: boolean;
}

const BLUR_DATA_URL =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

// ═══════════════════════════════════════════════════════════════
// Image Preview Modal
// ═══════════════════════════════════════════════════════════════

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

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose, onPrev, onNext]);

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

                <div className="relative overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl">
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
                        className={`absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-lg ${LABEL_COLORS[img.label] || "bg-neutral-600"}`}
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

// ═══════════════════════════════════════════════════════════════
// Inline Field Editor
// ═══════════════════════════════════════════════════════════════

function InlineField({
    value,
    placeholder,
    onChange,
    type = "text",
    prefix,
    label,
    required,
    tabIndex,
    onKeyDown,
}: {
    value: string;
    placeholder: string;
    onChange: (val: string) => void;
    type?: "text" | "number";
    prefix?: string;
    label: string;
    required?: boolean;
    tabIndex?: number;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setLocalValue(value); }, [value]);

    useEffect(() => {
        if (editing) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            });
        }
    }, [editing]);

    function save() {
        setEditing(false);
        const next = type === "number" ? localValue.replace(/[^\d.]/g, "") : localValue.trim();
        if (next !== value) onChange(next);
    }

    function cancel() {
        setLocalValue(value);
        setEditing(false);
    }

    const isEmpty = required && !value;
    const showRequired = required && !value.trim();

    if (editing) {
        return (
            <div className="space-y-1">
                <label className="flex items-center gap-1 text-[10px] font-medium text-neutral-400">
                    {label}

                    {required && (
                        <span className="text-red-500">*</span>
                    )}
                </label>

                <div className="relative">
                    {prefix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                            {prefix}
                        </span>
                    )}

                    <input
                        ref={inputRef}
                        type={type}
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onBlur={save}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") save();
                            if (e.key === "Escape") cancel();
                            onKeyDown?.(e);
                        }}
                        placeholder={placeholder}
                        className={`
                        h-10 w-full rounded-lg border border-blue-500 bg-white
                        ${prefix ? "pl-8" : "px-3"}
                        pr-3 text-sm outline-none
                        focus:ring-2 focus:ring-blue-200
                    `}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <label className="flex items-center gap-1 text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <button
                type="button"
                onClick={() => setEditing(true)}
                className={`
                    group flex h-9 w-full items-center rounded-md border px-2.5 text-left text-xs transition
                    ${showRequired
                        ? "border-red-200 bg-red-50/30 dark:border-red-800/30 dark:bg-red-950/10"
                        : "border-transparent hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50"
                    }
                `}
            >
                {value ? (
                    <span className="flex items-center gap-1 truncate text-xs font-medium text-neutral-800 dark:text-neutral-200">
                        {prefix && <span className="text-neutral-400 font-mono text-[11px]">{prefix}</span>}
                        <span className="truncate">{value}</span>
                    </span>
                ) : (
                    <span className={`text-xs italic ${showRequired ? "text-red-400" : "text-neutral-400"}`}>
                        {showRequired ? "Required" : placeholder}
                    </span>
                )}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Category-Aware Select Field
// ═══════════════════════════════════════════════════════════════

function InlineSelect({
    value,
    options,
    onChange,
    label,
    required,
}: {
    value: string;
    options: string[];
    onChange: (val: string) => void;
    label: string;
    required?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return options;
        return options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
    }, [options, search]);

    useEffect(() => {
        function outside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        }
        document.addEventListener("mousedown", outside);
        return () => document.removeEventListener("mousedown", outside);
    }, []);

    useEffect(() => {
        if (open) requestAnimationFrame(() => inputRef.current?.focus());
    }, [open]);

    const isEmpty = required && !value;

    return (
        <div className="space-y-1" ref={wrapperRef}>
            <label className="flex items-center gap-1 text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`
                    flex h-9 w-full items-center justify-between rounded-md border px-2.5 text-xs font-medium transition
                    ${isEmpty
                        ? "border-red-200 bg-red-50/30 dark:border-red-800/30 dark:bg-red-950/10"
                        : "border-transparent hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50"
                    }
                `}
            >
                <span className="truncate">
                    {value || (
                        <span className={`italic ${isEmpty ? "text-red-400" : "text-neutral-400"}`}>
                            {isEmpty ? "Required" : "Select..."}
                        </span>
                    )}
                </span>
                <svg className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none">
                    <path d="M5 7L10 12L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className="absolute left-0 top-full z-[999] mt-1 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="border-b border-neutral-200 p-2 dark:border-neutral-700">
                        <input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="h-9 w-full rounded-lg border border-neutral-200 px-3 text-xs outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2">
                        {filtered.length === 0 ? (
                            <div className="py-8 text-center text-xs text-neutral-400">No Results</div>
                        ) : (
                            filtered.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => { onChange(item); setOpen(false); setSearch(""); }}
                                    className={`
                                        mb-1 flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs transition
                                        ${value === item
                                            ? "bg-black text-white dark:bg-white dark:text-black"
                                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        }
                                    `}
                                >
                                    {item}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Product Card Component
// ═══════════════════════════════════════════════════════════════

function ProductCard({
    product,
    index,
    onUpdate,
    onImagesChange,
    onDeleteRow,
    onAiFill,
    aiLoading,
}: {
    product: BulkProduct;
    index: number;
    onUpdate: (sku: string, updates: Partial<BulkProduct>) => void;
    onImagesChange: (sku: string, files: File[]) => void;
    onDeleteRow: (sku: string) => void;
    onAiFill: (sku: string) => void;
    aiLoading: boolean;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [previewModal, setPreviewModal] = useState<{
        images: { src: string; label: string }[];
        currentIndex: number;
    } | null>(null);

    const hasErrors = product.errors.length > 0;
    const imageCount = product.imageFiles.length;
    const rule = getCategoryMeasurements(product.category);
    const labels = getImageLabels(imageCount);

    // Trigger file input
    function handleUploadClick() {
        fileInputRef.current?.click();
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        // Keep existing images + append new ones in selection order
        const combined = [...product.imageFiles, ...files];
        onImagesChange(product.sku, combined);
        e.target.value = "";
    }

    // Drag & drop on the image zone
    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/")
        );
        if (files.length > 0) {
            const combined = [...product.imageFiles, ...files];
            onImagesChange(product.sku, combined);
        }
        setDragOverIndex(null);
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Reorder images via drag
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

    function removeImage(index: number) {
        const remaining = product.imageFiles.filter((_, i) => i !== index);
        onImagesChange(product.sku, remaining);
    }

    function openPreview(index: number) {
        const images = product.imageFiles.map((f, i) => ({
            src: URL.createObjectURL(f),
            label: labels[i] || `Img ${i + 1}`,
        }));
        if (images.length === 0) return;
        setPreviewModal({ images, currentIndex: index });
    }

    // Dynamic measurement fields
    const measurements =
        product.category.trim() === ""
            ? []
            : rule.measurements;

    return (
        <>
            <Card
                className={`
        overflow-hidden rounded-3xl border bg-white transition-all duration-300
        ${hasErrors
                        ? "border-red-200 shadow-sm"
                        : "border-neutral-200 shadow hover:shadow-xl hover:-translate-y-1"
                    }
    `}
            >
                <CardContent className="p-0">
                    {/* Header: SKU + Status + Actions */}
                    <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-5 py-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" size="xs" rounded="md" className="font-mono tracking-tight">
                                {product.sku}
                            </Badge>
                            {hasErrors ? (
                                <Badge variant="error" size="xs" className="gap-1">
                                    <AlertCircle size={10} />
                                    {product.errors.length}
                                </Badge>
                            ) : (
                                <Badge variant="success" size="xs" className="gap-1">
                                    <CheckCircle2 size={10} />
                                    Ready
                                </Badge>
                            )}
                            {index === 0 && (
                                <Badge variant="outline" size="xs" rounded="md">
                                    <Star size={10} className="text-amber-500" />
                                    First
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                onClick={() => onDeleteRow(product.sku)}
                                variant="ghost"
                                size="iconXs"
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                title="Delete product"
                            >
                                <Trash2 size={12} />
                            </Button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-5 p-5">
                        {/* ── Image Zone ── */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragEnter={() => setDragOverIndex(-1)}
                            onDragLeave={() => setDragOverIndex(null)}
                            className={`
                                rounded-2xl
border-2
border-dashed
transition-all
hover:border-black
hover:bg-neutral-50
                                ${dragOverIndex === -1
                                    ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                                    : "border-dashed border-neutral-200 dark:border-neutral-700"
                                }
                                ${imageCount === 0 ? "p-4" : "p-2"}
                            `}
                        >
                            {imageCount === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <Upload size={16} className="text-neutral-400" />
                                    </div>
                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                        Drop images here or <button type="button" onClick={handleUploadClick} className="text-blue-500 underline">browse</button>
                                    </p>
                                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                        First image = Cover
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                                            {imageCount} image{imageCount !== 1 ? "s" : ""} · Drag to reorder
                                        </span>
                                        <Button
                                            type="button"
                                            onClick={handleUploadClick}
                                            variant="ghost"
                                            size="iconXs"
                                            className="text-neutral-400"
                                            title="Add more images"
                                        >
                                            <Plus size={12} />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.imageFiles.map((file, i) => (
                                            <div
                                                key={i}
                                                draggable
                                                onDragStart={(e) => handleImageDragStart(e, i)}
                                                onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                                                onDragLeave={() => setDragOverIndex(null)}
                                                onDrop={(e) => handleImageDrop(e, i)}
                                                className={`
                                                    group relative h-14 w-14 overflow-hidden rounded-lg border bg-neutral-100 transition
                                                    ${dragOverIndex === i ? "border-blue-400 scale-105 shadow-md" : "border-neutral-200 dark:border-neutral-700"}
                                                    ${i === 0 ? "ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-neutral-900" : ""}
                                                `}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => openPreview(i)}
                                                    className="relative h-full w-full"
                                                >
                                                    <Image
                                                        src={URL.createObjectURL(file)}
                                                        alt={labels[i] || `Image ${i + 1}`}
                                                        fill
                                                        unoptimized
                                                        className="object-cover transition group-hover:scale-110"
                                                        sizes="56px"
                                                    />
                                                </button>

                                                {i === 0 && (
                                                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 shadow">
                                                        <Star size={8} className="text-white" />
                                                    </div>
                                                )}

                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center text-[8px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                                                    {labels[i] || `#${i + 1}`}
                                                </div>

                                                <Button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                    variant="danger"
                                                    size="iconXs"
                                                    rounded="full"
                                                    className="absolute -top-1.5 -right-1.5 h-4 w-4 opacity-0 shadow transition group-hover:opacity-100"
                                                >
                                                    <X size={8} />
                                                </Button>

                                                <div className="absolute top-1 left-1 cursor-grab opacity-0 transition group-hover:opacity-100">
                                                    <GripVertical size={10} className="text-white drop-shadow" />
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add more button */}
                                        <button
                                            type="button"
                                            onClick={handleUploadClick}
                                            className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 text-neutral-300 transition hover:border-blue-400 hover:text-blue-400 dark:border-neutral-700"
                                        >
                                            <Plus size={14} />
                                        </button>
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

                        {/* ── Required Fields Grid ── */}
                        <div className="grid grid-cols-2 gap-3">
                            <InlineField
                                label="Brand"
                                value={product.brand}
                                placeholder="e.g. Nike"
                                onChange={(v) => onUpdate(product.sku, { brand: v })}
                                required
                            />
                            <InlineField
                                label="Title"
                                value={product.title}
                                placeholder="Product name"
                                onChange={(v) => onUpdate(product.sku, { title: v })}
                                required
                            />
                            <InlineField
                                label="Price"
                                value={product.price > 0 ? String(product.price) : ""}
                                placeholder="499"
                                onChange={(v) =>
                                    onUpdate(product.sku, {
                                        price: parseFloat(v) || 0,
                                    })
                                }
                                type="number"
                                prefix="₹"
                                required
                            />
                            <InlineSelect
                                label="Gender"
                                value={product.gender}
                                options={GENDER_OPTIONS}
                                onChange={(v) => onUpdate(product.sku, { gender: v as any })}
                                required
                            />
                            <InlineSelect
                                label="Category"
                                value={product.category}
                                options={ALL_CATEGORIES}
                                onChange={(v) => onUpdate(product.sku, { category: v })}
                                required
                            />
                            <InlineField
                                label="Color"
                                value={product.color || ""}
                                placeholder="e.g. Black"
                                onChange={(v) => onUpdate(product.sku, { color: v })}
                                required
                            />
                        </div>

                        {/* ── Second Row: Material, Size, Condition ── */}
                        <div className="grid grid-cols-2 gap-3">
                            <InlineField
                                label="Material"
                                value={product.material || ""}
                                placeholder="e.g. 100% Cotton"
                                onChange={(v) => onUpdate(product.sku, { material: v })}
                                required
                            />
                            <InlineField
                                label="Size"
                                value={product.size || ""}
                                placeholder={rule.showSizeTag ? "M / L / XL" : "N/A"}
                                onChange={(v) => onUpdate(product.sku, { size: v })}
                            />
                            <InlineSelect
                                label="Condition"
                                value={product.condition}
                                options={CONDITION_OPTIONS}
                                onChange={(v) => onUpdate(product.sku, { condition: v })}
                            />
                        </div>

                        {/* ── Dynamic Measurements ── */}
                        {measurements.length > 0 && (
                            <div>
                                <div className="mb-1.5 flex items-center gap-1.5">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                                        Measurements
                                    </span>
                                    <span className="text-[9px] text-neutral-300 dark:text-neutral-600">·</span>
                                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 italic">{rule.hint}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {measurements.map((m) => {
                                        const raw = product[m.field as keyof BulkProduct];

                                        const val =
                                            raw === undefined || raw === null || raw === 0
                                                ? ""
                                                : String(raw);
                                        return (
                                            <InlineField
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
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Description ── */}
                        <div>
                            <div className="mb-1 flex items-center gap-1">
                                <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                                    Description
                                </span>
                                <span className="text-red-400">*</span>
                            </div>
                            <DescriptionCell
                                value={product.description || ""}
                                placeholder="Describe product condition, fit, style..."
                                onChange={(v) =>
                                    onUpdate(product.sku, {
                                        description: v,
                                    })
                                }
                            />
                        </div>

                        {/* ── Errors ── */}
                        {hasErrors && (
                            <div className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 dark:border-red-800/50 dark:bg-red-950/20">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                                    Issues
                                </p>
                                <ul className="space-y-0.5">
                                    {product.errors.map((err, i) => (
                                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-red-500 dark:text-red-400">
                                            <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-red-400" />
                                            {err}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* ── AI Fill ── */}
                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                type="button"
                                onClick={() => onAiFill(product.sku)}
                                disabled={aiLoading || imageCount === 0}
                                variant="secondary"
                                className="rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100"
                                size="sm"
                                leftIcon={
                                    aiLoading ? (
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                                    ) : (
                                        <Sparkles size={12} />
                                    )
                                }
                            >
                                {aiLoading ? "Filling..." : "AI Fill"}
                            </Button>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-500">
                                Auto-fills brand, title, category, size, color, material from images
                            </span>
                        </div>

                        {/* ── AI Confidence Display ── */}
                        {product.aiConfidence && Object.keys(product.aiConfidence).length > 0 && (
                            <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-2 dark:border-violet-900/30 dark:bg-violet-950/10">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                                        AI Confidence
                                    </span>
                                    {product.aiNeedsReview && product.aiNeedsReview.length > 0 && (
                                        <Badge variant="warning" size="xs" className="gap-1">
                                            <AlertCircle size={9} />
                                            {product.aiNeedsReview.length} need review
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(product.aiConfidence).map(([field, score]) => {
                                        const isLow = score < 70;
                                        const isMedium = score >= 70 && score < 85;
                                        return (
                                            <span
                                                key={field}
                                                className={`
                                                    inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-medium
                                                    ${isLow
                                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                        : isMedium
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    }
                                                `}
                                            >
                                                <span className="capitalize">{field}</span>
                                                <span className="opacity-70">{score}%</span>
                                            </span>
                                        );
                                    })}
                                </div>
                                {product.aiNeedsReview && product.aiNeedsReview.length > 0 && (
                                    <p className="mt-1.5 text-[9px] text-amber-600 dark:text-amber-400">
                                        Fields marked need review: {product.aiNeedsReview.join(", ")}
                                    </p>
                                )}
                            </div>
                        )}
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
                        onPrev={() => setPreviewModal((prev) => prev ? {
                            ...prev,
                            currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1,
                        } : null)}
                        onNext={() => setPreviewModal((prev) => prev ? {
                            ...prev,
                            currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1,
                        } : null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// ═══════════════════════════════════════════════════════════════
// Description Inline Editor
// ═══════════════════════════════════════════════════════════════

function DescriptionCell({
    value,
    placeholder,
    onChange,
}: {
    value: string;
    placeholder: string;
    onChange: (val: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { setLocalValue(value); }, [value]);

    useEffect(() => {
        if (editing) {
            requestAnimationFrame(() => {
                textareaRef.current?.focus();
                textareaRef.current?.select();
            });
        }
    }, [editing]);

    function save() {
        setEditing(false);
        if (localValue.trim() !== value) onChange(localValue.trim());
    }

    function cancel() {
        setLocalValue(value);
        setEditing(false);
    }

    if (!editing) {
        return (
            <button
                type="button"
                onClick={() => setEditing(true)}
                className="group flex min-h-[40px] w-full rounded-lg border border-transparent bg-transparent p-2.5 text-left transition hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50"
            >
                {value ? (
                    <p className="line-clamp-2 whitespace-pre-wrap text-xs leading-5 text-neutral-700 dark:text-neutral-300">
                        {value}
                    </p>
                ) : (
                    <span className="text-xs italic text-neutral-400">{placeholder}</span>
                )}
            </button>
        );
    }

    return (
        <textarea
            ref={textareaRef}
            rows={3}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
                if (e.key === "Escape") { e.preventDefault(); cancel(); }
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save(); }
            }}
            placeholder={placeholder}
            className="min-h-[56px] w-full resize-y rounded-lg border border-blue-500 bg-white p-2.5 text-xs leading-5 outline-none transition focus:ring-2 focus:ring-blue-200 dark:border-blue-500 dark:bg-neutral-900 dark:text-white"
        />
    );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export default function SpreadsheetEditor({
    products,
    onUpdate,
    onAddRow,
    onDeleteRow,
    onImagesChange,
    onAiFill,
    aiLoadingSku,
    onUpload,
    uploading,
}: Props) {
    const [searchQuery, setSearchQuery] = useState("");

    const readyCount = products.filter((p) => p.errors.length === 0).length;
    const productsWithErrors = products.filter((p) => p.errors.length > 0);

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const q = searchQuery.toLowerCase();
        return products.filter(
            (p) =>
                p.sku.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.title.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q),
        );
    }, [products, searchQuery]);

    // Keyboard shortcut: Ctrl+Shift+A to add row
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "a" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
                e.preventDefault();
                onAddRow();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onAddRow]);

    return (
        <div className="space-y-4">
            {/* ═══ Unified Action Bar ═══ */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                {/* Left */}
                <div>
                    <h2 className="text-4xl font-bold tracking-tight">
                        Bulk Upload
                    </h2>
                </div>

                {/* Right */}
                <div className="flex flex-wrap gap-2">

                    <Button
                        type="button"
                        onClick={onAddRow}
                        leftIcon={<Plus size={15} />}
                        className="h-12 rounded-2xl px-6"
                    >
                        Add Product
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        disabled={products.length === 0}
                        leftIcon={<Sparkles size={15} />}
                    // onClick={onAiFillAll}
                    >
                        AI Fill All
                    </Button>

                    <Button
                        type="button"
                        variant="success"
                        onClick={onUpload}
                        disabled={readyCount === 0 || uploading}
                        leftIcon={<Upload size={15} />}
                    >
                        {uploading ? "Uploading..." : `Upload All (${readyCount})`}
                    </Button>
                </div>
            </div>

            {/* ═══ Content ═══ */}
            {products.length === 0 ? (
                <EmptyState
                    icon={<ImageIcon size={28} />}
                    title="No products yet"
                    description="Click Add Product above or use Ctrl+Shift+A to start adding products."
                    className="rounded-2xl border-dashed"
                />
            ) : (
                <>
                    {/* Error Panel */}
                    {productsWithErrors.length > 0 && (
                        <div className="space-y-1">
                            {productsWithErrors.map((product) => (
                                <div key={product.sku} className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-1.5 dark:border-red-800/50 dark:bg-red-950/20">
                                    <span className="font-mono text-[10px] font-bold text-red-600 dark:text-red-400">{product.sku}:</span>
                                    <ul className="mt-0.5 space-y-0.5">
                                        {product.errors.map((err, i) => (
                                            <li key={i} className="flex items-start gap-1.5 text-[10px] text-red-500 dark:text-red-400">
                                                <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-red-400" />
                                                {err}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Card Grid */}
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-16 dark:border-neutral-700 dark:bg-neutral-900">
                                <p className="mt-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    No products match "{searchQuery}"
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery("")}
                                    className="mt-2"
                                >
                                    Clear search
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {filteredProducts.map((product, i) => {
                                    const actualIndex = products.findIndex((p) => p.sku === product.sku);
                                    return (
                                        <motion.div
                                            key={product.sku}
                                            layout
                                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -12, scale: 0.97 }}
                                            transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.12) }}
                                        >
                                            <ProductCard
                                                product={product}
                                                index={actualIndex}
                                                onUpdate={onUpdate}
                                                onImagesChange={onImagesChange}
                                                onDeleteRow={onDeleteRow}
                                                onAiFill={onAiFill}
                                                aiLoading={aiLoadingSku === product.sku}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}