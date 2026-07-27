"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Edit3,
    Image as ImageIcon,
    X,
} from "lucide-react";
import type { BulkProduct } from "@/app/lib/bulk/types";
import { getImageLabels } from "@/app/lib/bulk/image-sorter";
import type { ImageLabel } from "@/app/lib/bulk/image-sorter";

const LABEL_COLORS: Record<string, string> = {
    Front: "bg-blue-500",
    Back: "bg-purple-500",
    "Brand Tag": "bg-amber-500",
    "Size Tag": "bg-emerald-500",
    Fabric: "bg-rose-500",
    Defect: "bg-red-500",
};

interface SmartPreviewCardProps {
    product: BulkProduct;
    index: number;
    onUpdate: (sku: string, updates: Partial<BulkProduct>) => void;
    onAiFill: (sku: string) => void;
    aiLoading?: boolean;
}

export default function SmartPreviewCard({
    product,
    index,
    onUpdate,
    onAiFill,
    aiLoading = false,
}: SmartPreviewCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const labels = useMemo(
        () => getImageLabels(product.imageFiles.length),
        [product.imageFiles.length],
    );

    const hasErrors = product.errors.length > 0;
    const imageCount = product.imageFiles.length;

    function startEdit(field: string, currentValue: string) {
        setEditingField(field);
        setEditValue(currentValue);
    }

    function saveEdit(field: string) {
        if (editingField) {
            onUpdate(product.sku, { [field]: editValue });
        }
        setEditingField(null);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            saveEdit(editingField!);
        }
        if (e.key === "Escape") {
            setEditingField(null);
        }
    }

    // Fields that can be inline-edited
    const editableFields: { key: keyof BulkProduct; label: string; placeholder: string }[] = [
        { key: "title", label: "Title", placeholder: "Product title" },
        { key: "brand", label: "Brand", placeholder: "e.g. Nike, Levis" },
        { key: "category", label: "Category", placeholder: "e.g. T-Shirts, Jeans" },
        { key: "price", label: "Price", placeholder: "e.g. 499" },
        { key: "size", label: "Size", placeholder: "e.g. M, L, XL" },
        { key: "material", label: "Material", placeholder: "e.g. 100% Cotton" },
    ];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`overflow-hidden rounded-2xl border transition-all ${hasErrors
                    ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/10"
                    : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                }`}
        >
            {/* Header */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center gap-4 p-4 text-left"
            >
                {/* Thumbnail strip */}
                <div className="flex -space-x-2 shrink-0">
                    {product.imageFiles.slice(0, 3).map((file, i) => (
                        <div
                            key={i}
                            className={`relative h-10 w-10 overflow-hidden rounded-lg border-2 border-white shadow-sm dark:border-neutral-800 ${i === 0 ? "z-30" : i === 1 ? "z-20" : "z-10"
                                }`}
                        >
                            <Image
                                src={URL.createObjectURL(file)}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="40px"
                                unoptimized
                            />
                        </div>
                    ))}
                    {imageCount > 3 && (
                        <div className="z-0 flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white bg-neutral-100 text-[10px] font-bold text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-700 dark:text-neutral-400">
                            +{imageCount - 3}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {product.title || <span className="text-neutral-400 italic">Untitled Product</span>}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {product.brand || "No brand"} &middot; {imageCount} image{imageCount !== 1 ? "s" : ""}
                        {product.price > 0 && (
                            <>
                                {" "}&middot; ₹{product.price}
                            </>
                        )}
                    </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 shrink-0">
                    {hasErrors ? (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <AlertCircle size={10} />
                            {product.errors.length}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 size={10} />
                            Ready
                        </span>
                    )}
                    {expanded ? (
                        <ChevronUp size={16} className="text-neutral-400" />
                    ) : (
                        <ChevronDown size={16} className="text-neutral-400" />
                    )}
                </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-neutral-100 dark:border-neutral-800"
                    >
                        <div className="p-4 space-y-4">
                            {/* Image strip with labels */}
                            {product.imageFiles.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
                                        Images ({imageCount})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.imageFiles.map((file, i) => {
                                            const label = labels[i] || `Image ${i + 1}`;
                                            const colorClass =
                                                LABEL_COLORS[label] || "bg-neutral-500";
                                            return (
                                                <div key={i} className="group relative">
                                                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                                                        <Image
                                                            src={URL.createObjectURL(file)}
                                                            alt={label}
                                                            fill
                                                            className="object-cover"
                                                            sizes="80px"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <span
                                                        className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm ${colorClass}`}
                                                    >
                                                        {label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Editable fields grid */}
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
                                    Product Details
                                </h4>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {editableFields.map((field) => {
                                        const value = String(product[field.key] ?? "");
                                        const isEditing =
                                            editingField === field.key;

                                        return (
                                            <div key={field.key} className="group">
                                                {isEditing ? (
                                                    <div className="space-y-1">
                                                        <input
                                                            autoFocus
                                                            type={field.key === "price" ? "number" : "text"}
                                                            value={editValue}
                                                            onChange={(e) =>
                                                                setEditValue(e.target.value)
                                                            }
                                                            onKeyDown={handleKeyDown}
                                                            onBlur={() => saveEdit(field.key)}
                                                            placeholder={field.placeholder}
                                                            className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:border-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                                        />
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEdit(field.key, value)
                                                        }
                                                        className="w-full rounded-lg border border-transparent px-2.5 py-1.5 text-left text-xs transition hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
                                                    >
                                                        <span className="text-[9px] font-medium text-neutral-400 dark:text-neutral-500">
                                                            {field.label}
                                                        </span>
                                                        <p className="mt-0.5 font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                                            {value || (
                                                                <span className="italic text-neutral-400">
                                                                    Empty
                                                                </span>
                                                            )}
                                                        </p>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Error details */}
                            {hasErrors && (
                                <div className="rounded-xl bg-red-50 px-3 py-2.5 dark:bg-red-950/20">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                                        Issues
                                    </p>
                                    {product.errors.map((err, i) => (
                                        <p
                                            key={i}
                                            className="text-[11px] leading-relaxed text-red-600 dark:text-red-400"
                                        >
                                            &bull; {err}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => onAiFill(product.sku)}
                                    disabled={aiLoading || imageCount === 0}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {aiLoading ? (
                                        <>
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Filling...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={13} />
                                            AI Fill Details
                                        </>
                                    )}
                                </button>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                    Auto-fills brand, category, size, material, color from images
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

