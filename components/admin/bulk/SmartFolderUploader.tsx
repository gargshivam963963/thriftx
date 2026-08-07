"use client";


import { Button } from '@/components/ui/button';import { useState, useRef, useCallback } from "react";
import {
    FolderOpen,
    Upload,
    CheckCircle2,
    AlertCircle,
    X,
    ImageIcon,
    Sparkles,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SmartReorderGrid from "./SmartReorderGrid";
import type { ReorderableImage } from "./SmartReorderGrid";
import type { BulkProduct } from "@/app/lib/bulk/types";
import { processSmartFolders } from "@/app/lib/bulk/smart-processor";
import type { SmartProcessResult } from "@/app/lib/bulk/smart-processor";
import { getImageLabels } from "@/app/lib/bulk/image-sorter";

interface SmartFolderUploaderProps {
    products: BulkProduct[];
    loading?: boolean;
    error?: string;
    onProcessed: (result: SmartProcessResult) => void;
    onClear: () => void;
}

export default function SmartFolderUploader({
    products,
    loading = false,
    error,
    onProcessed,
    onClear,
}: SmartFolderUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);

    const handleFiles = useCallback(
        async (fileList: FileList | null) => {
            if (!fileList?.length) return;

            setProcessing(true);

            try {
                // Simulate a tick to show processing state
                await new Promise((r) => setTimeout(r, 100));

                const files = Array.from(fileList);
                const result = processSmartFolders(files);

                if (result.products.length === 0 && result.stats.totalFolders === 0) {
                    alert(
                        "No product folders found. Make sure your folder contains subfolders with images.",
                    );
                    setProcessing(false);
                    return;
                }

                onProcessed(result);
            } catch (err) {
                console.error("Smart folder processing error:", err);
                alert("Failed to process folder. Please try again.");
            } finally {
                setProcessing(false);
            }
        },
        [onProcessed],
    );

    const totalImages = products.reduce(
        (sum, p) => sum + p.imageFiles.length,
        0,
    );
    const readyCount = products.filter(
        (p) => p.status === "Ready" && p.errors.length === 0,
    ).length;
    const issueCount = products.filter(
        (p) => p.status !== "Ready" || p.errors.length > 0,
    ).length;

    const hasContent = products.length > 0;

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFiles(e.dataTransfer.files);
                }}
                className={`group relative rounded-2xl border-2 border-dashed p-6 transition-all duration-200 ${dragOver
                    ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/10"
                    : hasContent
                        ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/10"
                        : error
                            ? "border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-900/10"
                            : "border-border hover:border-foreground dark:border-border dark:hover:border-border"
                    }`}
            >
                <input
                    ref={inputRef}
                    hidden
                    type="file"
                    multiple
                    {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
                    onChange={(e) => handleFiles(e.target.files)}
                />

                {processing ? (
                    <div className="flex flex-col items-center gap-3 py-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent dark:border-emerald-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-muted-foreground">
                                Processing images...
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Sorting by capture time &amp; detecting labels
                            </p>
                        </div>
                    </div>
                ) : hasContent ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                                <FolderOpen
                                    size={22}
                                    className="text-emerald-600 dark:text-emerald-400"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground">
                                    {products.length} product{products.length !== 1 ? "s" : ""} detected
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {totalImages} images &middot; Drag to reorder if needed
                                </p>
                            </div>
                            <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClear();
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted dark:hover:text-muted-foreground"
                            >
                                <X size={14} />
                            </Button>
                        </div>

                        {/* Stats chips */}
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/70 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <ImageIcon size={12} />
                                {totalImages} images
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg bg-blue-100/70 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                <FolderOpen size={12} />
                                {products.length} products
                            </div>
                            {readyCount > 0 && (
                                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/70 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <CheckCircle2 size={12} />
                                    {readyCount} ready
                                </div>
                            )}
                            {issueCount > 0 && (
                                <div className="flex items-center gap-1.5 rounded-lg bg-red-100/70 px-2.5 py-1.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    <AlertCircle size={12} />
                                    {issueCount} need attention
                                </div>
                            )}
                            <Button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted dark:bg-card dark:text-muted-foreground dark:hover:bg-muted"
                            >
                                <Upload size={12} />
                                Re-upload
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/10">
                            <Sparkles size={24} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-muted-foreground">
                                Smart Upload — Drop your product folders
                            </p>
                            <p className="mt-0.5 max-w-sm text-xs text-muted-foreground">
                                Each subfolder = 1 product. Images auto-sorted by capture time
                                and labeled (Front, Back, Brand Tag, Size Tag, Fabric, Defect).
                            </p>
                        </div>
                        {error && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                <AlertCircle size={12} />
                                {error}
                            </div>
                        )}
                        <div className="flex flex-wrap justify-center gap-2 text-badge text-muted-foreground">
                            <span className="rounded bg-muted px-2 py-1 dark:bg-card">
                                JPG • PNG • WEBP
                            </span>
                            <span className="rounded bg-muted px-2 py-1 dark:bg-card">
                                iPhone/WhatsApp
                            </span>
                            <span className="rounded bg-muted px-2 py-1 dark:bg-card">
                                No renaming needed
                            </span>
                        </div>
                    </div>
                )}

                {!hasContent && !processing && (
                    <Button
                        type="button"
                        disabled={loading}
                        onClick={() => inputRef.current?.click()}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        aria-label="Upload product folders"
                    />
                )}
            </div>

            {/* Product List with per-product reorder grids */}
            {hasContent && (
                <div className="rounded-2xl border border-border bg-white dark:border-border dark:bg-foreground">
                    <Button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                                Product Images
                            </span>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-card dark:text-muted-foreground">
                                {products.length}
                            </span>
                        </div>
                        {expanded ? (
                            <ChevronUp size={16} className="text-muted-foreground" />
                        ) : (
                            <ChevronDown size={16} className="text-muted-foreground" />
                        )}
                    </Button>

                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-border"
                            >
                                <div className="divide-y divide-border">
                                    {products.map((product) => {
                                        const reorderableImages: ReorderableImage[] =
                                            product.imageFiles.map((file, i) => ({
                                                id: `${product.sku}-${i}`,
                                                file,
                                                url: URL.createObjectURL(file),
                                                label:
                                                    getImageLabels(product.imageFiles.length)[i] ||
                                                    `Image ${i + 1}`,
                                                index: i,
                                            }));

                                        const isSelected = selectedProduct === product.sku;
                                        const hasErrors = product.errors.length > 0;

                                        return (
                                            <div key={product.sku} className="px-4 py-3">
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedProduct(
                                                            isSelected ? null : product.sku,
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-3 text-left"
                                                >
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground dark:bg-card dark:text-muted-foreground">
                                                        {product.imageFiles.length}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {product.title || product.sku}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {reorderableImages.length} image
                                                            {reorderableImages.length !== 1 ? "s" : ""}
                                                            {hasErrors && (
                                                                <span className="ml-2 text-red-500">
                                                                    &middot; {product.errors.length} issue
                                                                    {product.errors.length !== 1 ? "s" : ""}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    {hasErrors ? (
                                                        <AlertCircle
                                                            size={16}
                                                            className="shrink-0 text-red-500"
                                                        />
                                                    ) : (
                                                        <CheckCircle2
                                                            size={16}
                                                            className="shrink-0 text-emerald-500"
                                                        />
                                                    )}
                                                </Button>

                                                <AnimatePresence>
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="mt-3 overflow-hidden"
                                                        >
                                                            <SmartReorderGrid
                                                                images={reorderableImages}
                                                                onReorder={(reordered) => {
                                                                    // Update the BulkProduct's imageFiles order
                                                                    product.imageFiles = reordered.map(
                                                                        (r) => r.file,
                                                                    );
                                                                }}
                                                            />

                                                            {hasErrors && (
                                                                <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950/20">
                                                                    {product.errors.map((err, i) => (
                                                                        <p
                                                                            key={i}
                                                                            className="text-[11px] text-red-600 dark:text-red-400"
                                                                        >
                                                                            &bull; {err}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}