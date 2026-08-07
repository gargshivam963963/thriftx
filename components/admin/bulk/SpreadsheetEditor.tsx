"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Package } from "lucide-react";
import type { BulkProduct } from "@/app/lib/bulk/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import StickyToolbar from "./StickyToolbar";
import BulkProductCard from "./BulkProductCard";
import UploadDropzone from "./UploadDropzone";

interface Props {
    products: BulkProduct[];
    onUpdate: (sku: string, updates: Partial<BulkProduct>) => void;
    onAddRow: () => void;
    onDeleteRow: (sku: string) => void;
    onDuplicateRow: (sku: string) => void;
    onImagesChange: (sku: string, files: File[]) => void;
    onAiFill: (sku: string) => void;
    aiLoadingSku: string | null;
    onUpload: () => void;
    uploading: boolean;
    bulkAiLoading?: boolean;
    onAiFillAll?: () => void;
    onFilesSelected?: (files: File[]) => void;
    onFolderSelected?: (files: File[]) => void;
    loading?: boolean;
    aiProcessing?: boolean;
    aiProcessingInfo?: {
        current: number;
        total: number;
        currentSku: string;
    } | null;
}

export default function SpreadsheetEditor({
    products,
    onUpdate,
    onAddRow,
    onDeleteRow,
    onDuplicateRow,
    onImagesChange,
    onAiFill,
    aiLoadingSku,
    onUpload,
    uploading,
    bulkAiLoading = false,
    onAiFillAll,
    onFilesSelected,
    onFolderSelected,
    loading = false,
    aiProcessing = false,
    aiProcessingInfo = null,
}: Props) {
    const [searchQuery, setSearchQuery] = useState("");

    const readyCount = useMemo(
        () => products.filter((p) => p.errors.length === 0).length,
        [products],
    );
    const errorCount = useMemo(
        () => products.filter((p) => p.errors.length > 0).length,
        [products],
    );
    const uploadingCount = useMemo(
        () => products.filter((p) => p.status === "Uploading").length,
        [products],
    );
    const totalImages = useMemo(
        () => products.reduce((s, p) => s + p.imageFiles.length, 0),
        [products],
    );

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

    // ── Loading skeleton ──
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-40" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="space-y-3 rounded-2xl border border-border p-4 dark:border-border"
                        >
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                            <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Empty state with dropzone ──
    if (products.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Bulk Upload
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Drop product photos and let AI do the heavy lifting.
                        </p>
                    </div>
                </div>

                <UploadDropzone
                    onFilesSelected={
                        onFilesSelected || (() => { })
                    }
                    onFolderSelected={
                        onFolderSelected || (() => { })
                    }
                />

                <EmptyState
                    icon={<Package size={28} />}
                    title="No products yet"
                    description="Drop images above, or add a blank product card to get started."
                    className="rounded-2xl border-dashed"
                    actionLabel="Add Blank Product"
                    onAction={onAddRow}
                />
            </div>
        );
    }

    // ── Main view ──
    return (
        <div className="space-y-4">
            {/* Sticky Toolbar */}
            <StickyToolbar
                total={products.length}
                ready={readyCount}
                uploading={uploadingCount}
                errors={errorCount}
                images={totalImages}
                search={searchQuery}
                onSearchChange={setSearchQuery}
                onAddRow={onAddRow}
                onAiFillAll={onAiFillAll || (() => { })}
                onUpload={onUpload}
                uploadingActive={uploading}
                bulkAiLoading={bulkAiLoading}
            />

            {/* AI Processing banner */}
            {aiProcessing && aiProcessingInfo && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 dark:border-violet-900/40 dark:bg-violet-950/20"
                >
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                    <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
                        AI processing products...
                    </p>
                    <span className="ml-auto font-mono text-xs text-violet-600 dark:text-violet-400">
                        {aiProcessingInfo.current} / {aiProcessingInfo.total}
                    </span>
                </motion.div>
            )}

            {/* Compact dropzone to add more */}
            {onFilesSelected && (
                <UploadDropzone
                    onFilesSelected={onFilesSelected}
                    onFolderSelected={onFolderSelected || onFilesSelected}
                    compact
                />
            )}

            {/* Card grid */}
            <AnimatePresence mode="popLayout">
                {filteredProducts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16"
                    >
                        <Search size={20} className="text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium text-muted-foreground">
                            No products match &quot;{searchQuery}&quot;
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
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredProducts.map((product, i) => {
                            const actualIndex = products.findIndex(
                                (p) => p.sku === product.sku,
                            );
                            return (
                                <motion.div
                                    key={product.sku}
                                    layout
                                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                                    transition={{
                                        duration: 0.22,
                                        delay: Math.min(i * 0.025, 0.15),
                                    }}
                                >
                                    <BulkProductCard
                                        product={product}
                                        index={actualIndex}
                                        onUpdate={onUpdate}
                                        onImagesChange={onImagesChange}
                                        onDeleteRow={onDeleteRow}
                                        onDuplicate={onDuplicateRow}
                                        onAiFill={onAiFill}
                                        aiLoading={aiLoadingSku === product.sku}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted-foreground dark:border-border dark:text-muted-foreground">
                <span>
                    Showing {filteredProducts.length} of {products.length} products
                </span>
                <span className="flex items-center gap-1">
                    <span
                        className={cn(
                            "inline-block h-1.5 w-1.5 rounded-full",
                            readyCount === products.length
                                ? "bg-emerald-500"
                                : "bg-amber-500",
                        )}
                    />
                    {readyCount === products.length
                        ? "All ready to upload"
                        : `${errorCount} need attention`}
                </span>
            </div>
        </div>
    );
}

