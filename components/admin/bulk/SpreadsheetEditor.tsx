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
} from "lucide-react";
import type { BulkProduct } from "@/app/lib/bulk/types";
import { getImageLabels } from "@/app/lib/bulk/image-sorter";
import { getCategoryMeasurements } from "@/app/lib/bulk/categoryMeasurements";

const LABEL_COLORS: Record<string, string> = {
    Front: "bg-blue-500",
    Back: "bg-purple-500",
    "Brand Tag": "bg-amber-500",
    "Size Tag": "bg-emerald-500",
    Fabric: "bg-rose-500",
    Defect: "bg-red-500",
};

const GENDER_OPTIONS = ["Men", "Women", "Kids", "Unisex"];
const CONDITION_OPTIONS = ["Brand New", "Excellent", "Good", "Fair"];
const ALL_CATEGORIES = [
    "T-Shirts", "Shirts", "Hoodies", "Sweatshirts", "Jackets", "Blazers",
    "Tops", "Jeans", "Cargo", "Trousers", "Shorts", "Skirts", "Dresses",
];

interface Props {
    products: BulkProduct[];
    onUpdate: (sku: string, updates: Partial<BulkProduct>) => void;
    onAddRow: () => void;
    onDeleteRow: (sku: string) => void;
    onImagesChange: (sku: string, files: File[]) => void;
    onAiFill: (sku: string) => void;
    aiLoadingSku: string | null;
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
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                >
                    <X size={14} />
                </button>

                {images.length > 1 && (
                    <button
                        onClick={onPrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800"
                    >
                        <ChevronLeft size={18} />
                    </button>
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
                    <button
                        onClick={onNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}
            </motion.div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Editable Cell (click-to-edit inline)
// ═══════════════════════════════════════════════════════════════

function EditableCell({
    value,
    placeholder,
    onChange,
    type = "text",
    prefix,
}: {
    value: string;
    placeholder: string;
    onChange: (val: string) => void;
    type?: "text" | "number";
    prefix?: string;
}) {
    const [editing, setEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

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

        const next =
            type === "number"
                ? localValue.replace(/[^\d.]/g, "")
                : localValue.trim();

        if (next !== value) {
            onChange(next);
        }
    }

    function cancel() {
        setLocalValue(value);
        setEditing(false);
    }

    if (editing) {
        return (
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
                    }}
                    placeholder={placeholder}
                    className={`
                        h-10
                        w-full
                        rounded-lg
                        border
                        border-blue-500
                        bg-white
                        px-3
                        text-sm
                        font-medium
                        outline-none
                        transition
                        focus:ring-2
                        focus:ring-blue-200
                        dark:bg-neutral-900
                        dark:border-blue-500
                        dark:text-white
                        ${prefix ? "pl-7" : ""}
                    `}
                />
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setEditing(true)}
            className="
                group
                flex
                h-10
                w-full
                items-center
                rounded-lg
                border
                border-transparent
                px-3
                text-left
                transition
                hover:border-neutral-300
                hover:bg-neutral-50
                dark:hover:border-neutral-700
                dark:hover:bg-neutral-800
            "
        >
            {value ? (
                <span className="flex items-center gap-1 truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {prefix && (
                        <span className="text-neutral-400">
                            {prefix}
                        </span>
                    )}
                    <span className="truncate">{value}</span>
                </span>
            ) : (
                <span className="text-sm italic text-neutral-400">
                    {placeholder}
                </span>
            )}
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════
// Cell Select (native <select> — no portal/clipping issues)
// ═══════════════════════════════════════════════════════════════

function CellSelect({
    value,
    options,
    onChange,
}: {
    value: string;
    options: string[];
    onChange: (val: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return options;
        return options.filter((o) =>
            o.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    useEffect(() => {
        function outside(e: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setSearch("");
            }
        }

        document.addEventListener("mousedown", outside);

        return () =>
            document.removeEventListener("mousedown", outside);
    }, []);

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    return (
        <div
            ref={wrapperRef}
            className="relative min-w-[160px]"
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="
                    flex
                    h-10
                    w-full
                    items-center
                    justify-between
                    rounded-lg
                    border
                    border-transparent
                    px-3
                    text-sm
                    font-medium
                    transition
                    hover:border-neutral-300
                    hover:bg-neutral-50
                    dark:hover:border-neutral-700
                    dark:hover:bg-neutral-800
                "
            >
                <span className="truncate">
                    {value || (
                        <span className="italic text-neutral-400">
                            Select...
                        </span>
                    )}
                </span>

                <svg
                    className={`h-4 w-4 shrink-0 text-neutral-400 transition ${open ? "rotate-180" : ""
                        }`}
                    viewBox="0 0 20 20"
                    fill="none"
                >
                    <path
                        d="M5 7L10 12L15 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {open && (
                <div
                    className="
                        absolute
                        left-0
                        top-full
                        z-[999]
                        mt-2
                        w-64
                        overflow-hidden
                        rounded-xl
                        border
                        border-neutral-200
                        bg-white
                        shadow-2xl
                        dark:border-neutral-700
                        dark:bg-neutral-900
                    "
                >
                    <div className="border-b border-neutral-200 p-2 dark:border-neutral-700">
                        <input
                            ref={inputRef}
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search..."
                            className="
                                h-9
                                w-full
                                rounded-lg
                                border
                                border-neutral-200
                                px-3
                                text-sm
                                outline-none
                                focus:border-blue-500
                                dark:border-neutral-700
                                dark:bg-neutral-800
                            "
                        />
                    </div>

                    <div className="max-h-72 overflow-y-auto p-2">
                        {filtered.length === 0 ? (
                            <div className="py-8 text-center text-sm text-neutral-400">
                                No Results
                            </div>
                        ) : (
                            filtered.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => {
                                        onChange(item);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                    className={`
                                        mb-1
                                        flex
                                        w-full
                                        items-center
                                        rounded-lg
                                        px-3
                                        py-2
                                        text-left
                                        text-sm
                                        transition

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
// Inline Textarea
// ═══════════════════════════════════════════════════════════════

function TextareaCell({
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

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

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

        if (localValue.trim() !== value) {
            onChange(localValue.trim());
        }
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
                className="
                    group
                    flex
                    min-h-[72px]
                    w-full
                    rounded-xl
                    border
                    border-transparent
                    bg-transparent
                    p-3
                    text-left
                    transition
                    hover:border-neutral-300
                    hover:bg-neutral-50
                    dark:hover:border-neutral-700
                    dark:hover:bg-neutral-800
                "
            >
                {value ? (
                    <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-5 text-neutral-700 dark:text-neutral-200">
                        {value}
                    </p>
                ) : (
                    <span className="text-sm italic text-neutral-400">
                        {placeholder}
                    </span>
                )}
            </button>
        );
    }

    return (
        <textarea
            ref={textareaRef}
            rows={4}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    e.preventDefault();
                    cancel();
                }

                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    save();
                }
            }}
            placeholder={placeholder}
            className="
                min-h-[90px]
                w-full
                resize-y
                rounded-xl
                border
                border-blue-500
                bg-white
                p-3
                text-sm
                leading-6
                outline-none
                transition
                focus:ring-2
                focus:ring-blue-200
                dark:border-blue-500
                dark:bg-neutral-900
                dark:text-white
            "
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
}: Props) {
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const [previewModal, setPreviewModal] = useState<{
        images: { src: string; label: string }[];
        currentIndex: number;
    } | null>(null);

    const measurementColumns = useMemo(() => {
        const fields = new Set<string>();
        products.forEach((p) => {
            const rule = getCategoryMeasurements(p.category);
            rule.measurements.forEach((m) => fields.add(m.field));
        });
        return Array.from(fields);
    }, [products]);

    const measurementLabels: Record<string, string> = {
        chest: "Chest",
        waist: "Waist",
        length: "Length",
        inseam: "Inseam",
    };

    const allColumns = [
        { key: "sku", label: "SKU" },
        { key: "brand", label: "Brand" },
        { key: "title", label: "Title" },
        { key: "gender", label: "Gender" },
        { key: "category", label: "Category" },
        { key: "price", label: "Price" },
        { key: "condition", label: "Condition" },
        { key: "color", label: "Color" },
        { key: "material", label: "Material" },
        { key: "size", label: "Size" },
        ...measurementColumns.map((f) => ({
            key: f,
            label: measurementLabels[f] || f,
        })),
        { key: "description", label: "Desc" },
        { key: "images", label: "Images" },
        { key: "actions", label: "AI" },
        { key: "delete", label: "" },
    ];

    function triggerFileInput(sku: string) {
        fileInputRefs.current[sku]?.click();
    }

    function handleFilesSelected(sku: string, e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        files.sort((a, b) => a.name.localeCompare(b.name));
        onImagesChange(sku, files);
        e.target.value = "";
    }

    function openPreview(sku: string, index: number) {
        const product = products.find((p) => p.sku === sku);
        if (!product) return;
        const labels = getImageLabels(product.imageFiles.length);
        const images = product.imageFiles.map((f, i) => ({
            src: URL.createObjectURL(f),
            label: labels[i] || `Img ${i + 1}`,
        }));
        if (images.length === 0) return;
        setPreviewModal({ images, currentIndex: index });
    }

    function removeImage(sku: string, index: number) {
        const product = products.find((p) => p.sku === sku);
        if (!product) return;
        const remaining = product.imageFiles.filter((_, i) => i !== index);
        onImagesChange(sku, remaining);
    }

    const handlePrev = useCallback(() => {
        setPreviewModal((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1,
            };
        });
    }, []);

    const handleNext = useCallback(() => {
        setPreviewModal((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1,
            };
        });
    }, []);

    // Separate error panel items
    const productsWithErrors = products.filter((p) => p.errors.length > 0);
    const readyCount = products.filter((p) => p.errors.length === 0).length;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            {/* Toolbar */}

            <div className="sticky top-0 z-50 rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/90">

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                    {/* Left */}

                    <div className="flex flex-wrap items-center gap-3">

                        <button
                            type="button"
                            onClick={onAddRow}
                            className="
                    flex
                    h-11
                    items-center
                    gap-2
                    rounded-xl
                    bg-black
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:scale-[1.02]
                    hover:bg-neutral-800
                    active:scale-95
                    dark:bg-white
                    dark:text-black
                "
                        >
                            <Plus size={18} />
                            Add Product
                        </button>

                        <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 dark:bg-neutral-800">

                            <div className="text-lg font-bold">
                                {products.length}
                            </div>

                            <div className="text-xs text-neutral-500">
                                Products
                            </div>

                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 dark:bg-emerald-950/30">

                            <CheckCircle2
                                size={18}
                                className="text-emerald-500"
                            />

                            <div>

                                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                    {readyCount}
                                </div>

                                <div className="text-[11px] text-neutral-500">
                                    Ready
                                </div>

                            </div>

                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 dark:bg-red-950/30">

                            <AlertCircle
                                size={18}
                                className="text-red-500"
                            />

                            <div>

                                <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    {products.length - readyCount}
                                </div>

                                <div className="text-[11px] text-neutral-500">
                                    Errors
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Right */}

                    <div className="flex flex-wrap items-center gap-3">

                        <div className="relative w-full md:w-72">

                            <svg
                                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M21 21L15.8 15.8M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>

                            <input
                                placeholder="Search products..."
                                className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-neutral-300
                        bg-white
                        pl-10
                        pr-4
                        text-sm
                        outline-none
                        transition
                        focus:border-blue-500
                        dark:border-neutral-700
                        dark:bg-neutral-900
                    "
                            />

                        </div>

                        <button
                            className="
                    h-11
                    rounded-xl
                    border
                    border-neutral-300
                    px-5
                    text-sm
                    font-semibold
                    transition
                    hover:bg-neutral-100
                    dark:border-neutral-700
                    dark:hover:bg-neutral-800
                "
                        >
                            Export
                        </button>

                        <button
                            className="
                    h-11
                    rounded-xl
                    bg-blue-600
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-700
                "
                        >
                            Validate
                        </button>

                    </div>

                </div>

            </div>

            {/* Empty state */}
            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-20 dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                        <ImageIcon size={28} className="text-neutral-400" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">No products yet</p>
                    <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                        Click <strong>Add Row</strong> above to start
                    </p>
                </div>
            ) : (
                <>
                    {/* Error panel */}
                    {productsWithErrors.length > 0 && (
                        <div className="space-y-1.5">
                            {productsWithErrors.map((product) => (
                                <div key={product.sku} className="rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2 dark:border-red-800/50 dark:bg-red-950/20">
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

                    {/* ── Table (scrollable + max height) ── */}
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <div
                            className="
            h-[calc(100vh-400px)]
            min-h-[180px]
            max-h-[900px]
            overflow-auto
        "
                        >

                            <table
                                className="
                w-max
                min-w-full
                border-separate
                border-spacing-0
                table-fixed
            "
                            >
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-neutral-50/80 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400 whitespace-nowrap">
                                        {allColumns.map((col) => (
                                            <th
                                                className={`
        sticky top-0
        bg-neutral-50
        dark:bg-neutral-900
        border-b
        border-neutral-200
        dark:border-neutral-700
        text-[11px]
        font-semibold
        whitespace-nowrap
        px-3
        py-3
        z-30
    `}
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => {
                                        const hasErrors = product.errors.length > 0;
                                        const labels = getImageLabels(product.imageFiles.length);
                                        const imageCount = product.imageFiles.length;
                                        const rule = getCategoryMeasurements(product.category);

                                        return (
                                            <tr
                                                key={product.sku}
                                                className={`border-b border-neutral-100 transition last:border-0 hover:bg-neutral-50/50 dark:border-neutral-800 dark:hover:bg-neutral-800/30 ${hasErrors ? "bg-red-50/20 dark:bg-red-950/10" : ""}`}
                                            >
                                                {/* SKU */}
                                                <td
                                                    className="
sticky
left-0
z-20
bg-white
dark:bg-neutral-900
border-r
border-neutral-200
dark:border-neutral-700
px-3
py-3
min-w-[90px]
"
                                                >
                                                    <span className="inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 whitespace-nowrap">
                                                        {product.sku}
                                                    </span>
                                                </td>

                                                {/* Brand */}
                                                <td
                                                    className="
sticky
left-0
z-20
bg-white
dark:bg-neutral-900
border-r
border-neutral-200
dark:border-neutral-700
px-3
py-3
min-w-[90px]
"
                                                >
                                                    <EditableCell value={product.brand} placeholder="Brand" onChange={(v) => onUpdate(product.sku, { brand: v })} />
                                                </td>

                                                {/* Title */}
                                                <td className="px-1.5 py-2 align-top min-w-[100px]">
                                                    <EditableCell value={product.title} placeholder="Title" onChange={(v) => onUpdate(product.sku, { title: v })} />
                                                </td>

                                                {/* Gender */}
                                                <td className="px-1.5 py-2 align-top">
                                                    <CellSelect value={product.gender} options={GENDER_OPTIONS} onChange={(v) => onUpdate(product.sku, { gender: v as any })} />
                                                </td>

                                                {/* Category */}
                                                <td className="px-1.5 py-2 align-top">
                                                    <CellSelect value={product.category} options={ALL_CATEGORIES} onChange={(v) => onUpdate(product.sku, { category: v })} />
                                                </td>

                                                {/* Price */}
                                                <td className="px-1.5 py-2 align-top">
                                                    <EditableCell value={product.price > 0 ? String(product.price) : ""} placeholder="Price" onChange={(v) => onUpdate(product.sku, { price: parseFloat(v) || 0 })} type="number" prefix="₹" />
                                                </td>

                                                {/* Condition */}
                                                <td className="px-1.5 py-2 align-top">
                                                    <CellSelect value={product.condition} options={CONDITION_OPTIONS} onChange={(v) => onUpdate(product.sku, { condition: v })} />
                                                </td>

                                                {/* Color */}
                                                <td className="px-1.5 py-2 align-top">
                                                    <EditableCell value={product.color || ""} placeholder="Color" onChange={(v) => onUpdate(product.sku, { color: v })} />
                                                </td>

                                                {/* Material */}
                                                <td className="px-1.5 py-2 align-top">
                                                    <EditableCell value={product.material || ""} placeholder="Material" onChange={(v) => onUpdate(product.sku, { material: v })} />
                                                </td>

                                                {/* Size */}
                                                <td className="px-1.5 py-2 align-top">
                                                    <EditableCell value={product.size || ""} placeholder={rule.showSizeTag ? "M/L/XL" : "N/A"} onChange={(v) => onUpdate(product.sku, { size: v })} />
                                                </td>

                                                {/* Measurements */}
                                                {measurementColumns.map((field) => {
                                                    const m = rule.measurements.find((mm) => mm.field === field);
                                                    const val = String(product[field as keyof BulkProduct] ?? "");
                                                    return (
                                                        <td key={field} className="px-1.5 py-2 align-top">
                                                            <EditableCell value={val} placeholder={m?.placeholder || '0"'} onChange={(v) => onUpdate(product.sku, { [field]: v })} />
                                                        </td>
                                                    );
                                                })}

                                                {/* Description */}
                                                <td className="px-1.5 py-2 align-top min-w-[100px]">
                                                    <TextareaCell value={product.description || ""} placeholder="Describe..." onChange={(v) => onUpdate(product.sku, { description: v })} />
                                                </td>

                                                {/* Images */}
                                                <td className="px-3 py-3 align-top min-w-[260px]">
                                                    <div className="space-y-3">

                                                        <div className="grid grid-cols-3 gap-2">

                                                            {product.imageFiles.slice(0, 6).map((file, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openPreview(product.sku, i)}
                                                                        className="relative h-full w-full"
                                                                    >
                                                                        <Image
                                                                            src={URL.createObjectURL(file)}
                                                                            alt={labels[i]}
                                                                            fill
                                                                            unoptimized
                                                                            placeholder="blur"
                                                                            blurDataURL={BLUR_DATA_URL}
                                                                            className="
                                object-cover
                                transition
                                duration-300
                                group-hover:scale-110
                            "
                                                                        />
                                                                    </button>

                                                                    <div
                                                                        className="
                            absolute
                            inset-x-0
                            bottom-0
                            bg-black/70
                            px-2
                            py-1
                            text-center
                            text-[10px]
                            font-semibold
                            text-white
                        "
                                                                    >
                                                                        {labels[i]}
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeImage(product.sku, i)}
                                                                        className="
                            absolute
                            right-2
                            top-2
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            rounded-full
                            bg-red-500
                            text-white
                            opacity-0
                            shadow-lg
                            transition
                            group-hover:opacity-100
                        "
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}

                                                            {product.imageFiles.length < 6 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => triggerFileInput(product.sku)}
                                                                    className="
                        flex
                        aspect-square
                        items-center
                        justify-center
                        rounded-xl
                        border-2
                        border-dashed
                        border-neutral-300
                        transition
                        hover:border-blue-500
                        hover:bg-blue-50
                        dark:border-neutral-700
                        dark:hover:bg-neutral-800
                    "
                                                                >
                                                                    <Upload
                                                                        size={22}
                                                                        className="text-neutral-400"
                                                                    />
                                                                </button>
                                                            )}

                                                        </div>

                                                        {product.imageFiles.length > 6 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openPreview(product.sku, 6)}
                                                                className="
                    rounded-lg
                    bg-neutral-100
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    hover:bg-neutral-200
                    dark:bg-neutral-800
                    dark:hover:bg-neutral-700
                "
                                                            >
                                                                +{product.imageFiles.length - 6} More Images
                                                            </button>
                                                        )}

                                                        <input
                                                            ref={(el) => {
                                                                fileInputRefs.current[product.sku] = el;
                                                            }}
                                                            type="file"
                                                            multiple
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) =>
                                                                handleFilesSelected(product.sku, e)
                                                            }
                                                        />
                                                    </div>
                                                </td>

                                                {/* AI Fill */}
                                                <td className="px-1.5 py-2 align-top">
                                                    <button
                                                        type="button"
                                                        onClick={() => onAiFill(product.sku)}
                                                        disabled={aiLoadingSku === product.sku || imageCount === 0}
                                                        className="rounded-lg p-1.5 text-violet-500 transition hover:bg-violet-50 hover:text-violet-700 disabled:opacity-40 disabled:cursor-not-allowed dark:hover:bg-violet-950/30"
                                                        title="AI Fill"
                                                    >
                                                        {aiLoadingSku === product.sku ? (
                                                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                                                        ) : (
                                                            <Sparkles size={13} />
                                                        )}
                                                    </button>
                                                </td>

                                                {/* Delete */}
                                                <td className="px-1.5 py-2 align-top">
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteRow(product.sku)}
                                                        className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Bottom Status Bar */}
            {products.length > 0 && (
                <div className="sticky bottom-0 z-40 rounded-2xl border border-neutral-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex flex-wrap items-center gap-4">

                            <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 dark:bg-neutral-800">

                                <div className="text-lg font-bold">
                                    {products.length}
                                </div>

                                <div className="text-xs text-neutral-500">
                                    Products
                                </div>

                            </div>

                            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 dark:bg-emerald-950/30">

                                <CheckCircle2
                                    size={18}
                                    className="text-emerald-500"
                                />

                                <div>

                                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                        {readyCount}
                                    </div>

                                    <div className="text-[11px] text-neutral-500">
                                        Ready
                                    </div>

                                </div>

                            </div>

                            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 dark:bg-red-950/30">

                                <AlertCircle
                                    size={18}
                                    className="text-red-500"
                                />

                                <div>

                                    <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                                        {products.length - readyCount}
                                    </div>

                                    <div className="text-[11px] text-neutral-500">
                                        Need Fix
                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="flex flex-wrap items-center gap-3">

                            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 dark:border-neutral-700">

                                <Clock
                                    size={16}
                                    className="text-blue-500"
                                />

                                <span className="text-sm font-medium">
                                    Auto Saved
                                </span>

                            </div>

                            <button
                                type="button"
                                className="
                        h-11
                        rounded-xl
                        border
                        border-neutral-300
                        px-5
                        text-sm
                        font-semibold
                        transition
                        hover:bg-neutral-100
                        dark:border-neutral-700
                        dark:hover:bg-neutral-800
                    "
                            >
                                Preview
                            </button>

                            <button
                                type="button"
                                className="
                        h-11
                        rounded-xl
                        bg-emerald-600
                        px-6
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-emerald-700
                    "
                            >
                                Publish
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewModal && (
                    <ImagePreviewModal
                        images={previewModal.images}
                        currentIndex={previewModal.currentIndex}
                        onClose={() => setPreviewModal(null)}
                        onPrev={handlePrev}
                        onNext={handleNext}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
