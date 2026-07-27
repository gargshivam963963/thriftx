"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Download, CloudUpload, RotateCcw, Sparkles, FileSpreadsheet, Table2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import StatsCards from "@/components/admin/bulk/StatsCards";
import ExcelUploader from "@/components/admin/bulk/ExcelUploader";
import FolderUploader from "@/components/admin/bulk/FolderUploader";
import PreviewTable from "@/components/admin/bulk/PreviewTable";
import UploadProgress from "@/components/admin/bulk/UploadProgress";
import ToastContainer, { showToast } from "@/components/admin/bulk/Toast";
import SmartFolderUploader from "@/components/admin/bulk/SmartFolderUploader";
import SmartPreviewCard from "@/components/admin/bulk/SmartPreviewCard";
import SpreadsheetEditor from "@/components/admin/bulk/SpreadsheetEditor";

import type { BulkProduct } from "@/app/lib/bulk/types";
import { parseExcel } from "@/app/lib/bulk/excel-parser";
import { matchImages } from "@/app/lib/bulk/image-matcher";
import { validateProducts } from "@/app/lib/bulk/validators";
import { uploadProducts } from "@/app/lib/bulk/uploader";
import { processSmartFolders } from "@/app/lib/bulk/smart-processor";
import type { SmartProcessResult } from "@/app/lib/bulk/smart-processor";
import {
    loadDraft,
    saveDraft,
    clearDraft,
    createBlankProduct,
} from "@/lib/bulk/spreadsheetStorage";

type UploadMode = "classic" | "smart" | "spreadsheet";

export default function BulkUploadPage() {
    const [mode, setMode] = useState<UploadMode>("classic");

    // ── Classic mode state ──────────────────────────────────────
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [excelError, setExcelError] = useState<string>("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageError, setImageError] = useState<string>("");

    // ── Smart mode state ────────────────────────────────────────
    const [smartResult, setSmartResult] = useState<SmartProcessResult | null>(null);

    // ── Shared state ────────────────────────────────────────────
    const [products, setProducts] = useState<BulkProduct[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<{
        current: number;
        total: number;
        percentage: number;
        currentSku: string;
    } | null>(null);
    const [uploadResult, setUploadResult] = useState<{
        success: number;
        failed: number;
    } | null>(null);
    const [aiLoadingSku, setAiLoadingSku] = useState<string | null>(null);

    // ── Spreadsheet mode state ─────────────────────────────────
    const [nextSkuNumber, setNextSkuNumber] = useState(1);
    const [draftLoaded, setDraftLoaded] = useState(false);

    // Warn before leaving if there are unsaved products
    useEffect(() => {
        if (products.length > 0 && (mode === "spreadsheet" || mode === "smart")) {
            const handler = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = "";
            };
            window.addEventListener("beforeunload", handler);
            return () => window.removeEventListener("beforeunload", handler);
        }
    }, [products.length, mode]);

    // Load draft from localStorage on mount
    useEffect(() => {
        if (mode === "spreadsheet" && !draftLoaded) {
            const draft = loadDraft();
            if (draft.products.length > 0) {
                setProducts(draft.products);
                setNextSkuNumber(draft.nextSkuNumber);
                showToast({
                    type: "info",
                    title: "Draft restored",
                    message: `${draft.products.length} product${draft.products.length !== 1 ? "s" : ""} restored from browser storage.`,
                    duration: 3000,
                });
            }
            setDraftLoaded(true);
        }
    }, [mode, draftLoaded]);

    // Auto-save every 2 seconds when products change in spreadsheet mode
    useEffect(() => {
        if (mode === "spreadsheet" && products.length > 0) {
            const timer = setInterval(() => {
                saveDraft(products, nextSkuNumber);
            }, 2000);
            return () => clearInterval(timer);
        }
    }, [mode, products, nextSkuNumber]);

    // ── Spreadsheet mode handlers ──────────────────────────────

    const handleAddRow = useCallback(() => {
        const newProduct = createBlankProduct(nextSkuNumber);
        setProducts((prev) => [...prev, newProduct]);
        setNextSkuNumber((prev) => prev + 1);
        showToast({
            type: "success",
            title: "Row added",
            message: `${newProduct.sku} added`,
            duration: 2000,
        });
    }, [nextSkuNumber]);

    // Keyboard shortcut: Ctrl+Shift+A to add a row in spreadsheet mode
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "A" && e.ctrlKey && e.shiftKey && mode === "spreadsheet") {
                e.preventDefault();
                handleAddRow();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [mode, handleAddRow]);

    const handleDeleteRow = useCallback((sku: string) => {
        setProducts((prev) => {
            const filtered = prev.filter((p) => p.sku !== sku);
            return filtered;
        });
        showToast({
            type: "info",
            title: "Row deleted",
            message: `${sku} removed`,
            duration: 2000,
        });
    }, []);

    const handleImagesChange = useCallback(
        (sku: string, files: File[]) => {
            setProducts((prev) =>
                prev.map((p) =>
                    p.sku === sku
                        ? {
                            ...p,
                            imageFiles: files,
                            imageUrls: files.map((f) => URL.createObjectURL(f)),
                            errors: [],
                        }
                        : p,
                ),
            );
        },
        [],
    );

    // ── Classic mode handlers ───────────────────────────────────

    const processExcel = useCallback(
        async (file: File) => {
            setExcelError("");
            try {
                const parsed = await parseExcel(file);
                const matched = imageFiles.length ? matchImages(parsed, imageFiles) : parsed;
                const validated = validateProducts(matched);
                setProducts(validated);
                setExcelFile(file);
                showToast({
                    type: "success",
                    title: "Excel parsed",
                    message: `${validated.length} product${validated.length !== 1 ? "s" : ""} found`,
                });
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Failed to parse Excel file";
                setExcelError(msg);
                showToast({ type: "error", title: "Parse failed", message: msg });
            }
        },
        [imageFiles]
    );

    const processImages = useCallback(
        async (files: File[]) => {
            setImageError("");
            setImageFiles(files);
            if (!excelFile) {
                showToast({
                    type: "info",
                    title: "Images loaded",
                    message: `${files.length} image${files.length !== 1 ? "s" : ""} selected. Upload Excel to match.`,
                });
                return;
            }
            try {
                const parsed = await parseExcel(excelFile);
                const matched = matchImages(parsed, files);
                const validated = validateProducts(matched);
                setProducts(validated);
                showToast({
                    type: "success",
                    title: "Images matched",
                    message: `${validated.filter((p) => p.imageFiles.length > 0).length} product${validated.filter((p) => p.imageFiles.length > 0).length !== 1 ? "s" : ""} have images`,
                });
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Failed to match images";
                setImageError(msg);
                showToast({ type: "error", title: "Image matching failed", message: msg });
            }
        },
        [excelFile]
    );

    const clearExcel = useCallback(() => {
        setExcelFile(null);
        setExcelError("");
        setProducts([]);
        setUploadResult(null);
    }, []);

    const clearImages = useCallback(() => {
        setImageFiles([]);
        setImageError("");
        if (excelFile) {
            parseExcel(excelFile)
                .then((parsed) => {
                    const validated = validateProducts(parsed);
                    setProducts(validated);
                })
                .catch(() => { });
        } else {
            setProducts([]);
        }
    }, [excelFile]);

    // ── Smart mode handlers ─────────────────────────────────────

    const handleSmartProcessed = useCallback(
        (result: SmartProcessResult) => {
            setSmartResult(result);
            setProducts(result.products);
            const readyCount = result.stats.readyCount;
            showToast({
                type: "success",
                title: "Smart upload processed",
                message: `${result.products.length} product${result.products.length !== 1 ? "s" : ""} detected (${readyCount} ready)`,
            });
        },
        [],
    );

    const handleSmartClear = useCallback(() => {
        setSmartResult(null);
        setProducts([]);
        setUploadResult(null);
        setProgress(null);
    }, []);

    const handleProductUpdate = useCallback(
        (sku: string, updates: Partial<BulkProduct>) => {
            setProducts((prev) =>
                prev.map((p) =>
                    p.sku === sku ? { ...p, ...updates, errors: [] } : p,
                ),
            );
        },
        [],
    );

    const handleAiFill = useCallback(
        async (sku: string) => {
            setAiLoadingSku(sku);
            try {
                const product = products.find((p) => p.sku === sku);
                if (!product || product.imageFiles.length === 0) {
                    showToast({ type: "warning", title: "No images", message: "Upload images first." });
                    return;
                }

                // Convert images to base64
                const base64Images = await Promise.all(
                    product.imageFiles.map(
                        (file) =>
                            new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const result = reader.result as string;
                                    resolve(result.split(",")[1]);
                                };
                                reader.onerror = reject;
                                reader.readAsDataURL(file);
                            }),
                    ),
                );

                const response = await fetch("/api/ai/fill", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        images: base64Images,
                        selectedFields: ["title", "brand", "gender", "category", "size", "color", "material", "description"],
                    }),
                });

                const result = await response.json();
                if (!result.success) {
                    // Check if it's a quota error — show a more helpful message
                    if (result.isQuotaError || response.status === 429) {
                        showToast({
                            type: "warning",
                            title: "AI quota exceeded",
                            message: "Please wait a moment before trying again, or upgrade your Gemini API plan.",
                            duration: 6000,
                        });
                        return;
                    }
                    showToast({ type: "error", title: "AI Fill failed", message: result.message || "Could not extract details." });
                    return;
                }

                // Map AI response back to product fields
                const aiData = result.data || {};
                const updates: Partial<BulkProduct> = {};
                if (aiData.title) updates.title = aiData.title;
                if (aiData.brand) updates.brand = aiData.brand;
                if (aiData.gender) updates.gender = aiData.gender;
                if (aiData.category) updates.category = aiData.category;
                if (aiData.size) updates.size = aiData.size;
                if (aiData.color) updates.color = aiData.color;
                if (aiData.material) updates.material = aiData.material;
                if (aiData.description) updates.description = aiData.description;

                handleProductUpdate(sku, updates);
                showToast({ type: "success", title: "AI Fill complete", message: `Details extracted for ${product.title || sku}` });
            } catch (err) {
                console.error("AI Fill error:", err);
                showToast({ type: "error", title: "AI Fill failed", message: "An error occurred. Check your Gemini API key and quota." });
            } finally {
                setAiLoadingSku(null);
            }
        },
        [products, handleProductUpdate],
    );

    /**
     * Bulk AI Fill — processes all products sequentially with 2s delay
     * to avoid hammering the Gemini API rate limits.
     */
    const [bulkAiLoading, setBulkAiLoading] = useState(false);

    const handleBulkAiFill = useCallback(async () => {
        const productsWithoutData = products.filter(
            (p) => !p.title && !p.brand && p.errors.length === 0 && p.imageFiles.length > 0,
        );

        if (productsWithoutData.length === 0) {
            showToast({ type: "info", title: "Nothing to fill", message: "All products already have data or have issues." });
            return;
        }

        setBulkAiLoading(true);
        let successCount = 0;
        let quotaExceeded = false;

        for (let i = 0; i < productsWithoutData.length; i++) {
            if (quotaExceeded) break;

            const product = productsWithoutData[i];
            setAiLoadingSku(product.sku);

            try {
                const base64Images = await Promise.all(
                    product.imageFiles.map(
                        (file) =>
                            new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const result = reader.result as string;
                                    resolve(result.split(",")[1]);
                                };
                                reader.onerror = reject;
                                reader.readAsDataURL(file);
                            }),
                    ),
                );

                const response = await fetch("/api/ai/fill", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        images: base64Images,
                        selectedFields: ["title", "brand", "gender", "category", "size", "color", "material", "description"],
                    }),
                });

                const result = await response.json();

                if (!result.success) {
                    if (result.isQuotaError || response.status === 429) {
                        quotaExceeded = true;
                        showToast({
                            type: "warning",
                            title: "AI quota exceeded",
                            message: `Stopped after ${i} product${i !== 1 ? "s" : ""}. Try again later or upgrade your plan.`,
                            duration: 6000,
                        });
                        break;
                    }
                    continue;
                }

                const aiData = result.data || {};
                const updates: Partial<BulkProduct> = {};
                if (aiData.title) updates.title = aiData.title;
                if (aiData.brand) updates.brand = aiData.brand;
                if (aiData.gender) updates.gender = aiData.gender;
                if (aiData.category) updates.category = aiData.category;
                if (aiData.size) updates.size = aiData.size;
                if (aiData.color) updates.color = aiData.color;
                if (aiData.material) updates.material = aiData.material;
                if (aiData.description) updates.description = aiData.description;

                handleProductUpdate(product.sku, updates);
                successCount++;

                // 2s delay between products to respect rate limits
                if (i < productsWithoutData.length - 1 && !quotaExceeded) {
                    await new Promise((r) => setTimeout(r, 2000));
                }
            } catch (err) {
                console.error(`AI Fill error for ${product.sku}:`, err);
                continue;
            }
        }

        setAiLoadingSku(null);
        setBulkAiLoading(false);

        if (successCount > 0) {
            showToast({
                type: "success",
                title: "Bulk AI Fill complete",
                message: `${successCount} product${successCount !== 1 ? "s" : ""} filled.`,
            });
        }
    }, [products, handleProductUpdate]);

    // ── Shared upload handler ───────────────────────────────────

    const clearAll = useCallback(() => {
        setExcelFile(null);
        setImageFiles([]);
        setSmartResult(null);
        setProducts([]);
        setExcelError("");
        setImageError("");
        setProgress(null);
        setUploadResult(null);
    }, []);

    const handleUpload = useCallback(async () => {
        const ready = products.filter((p) => p.errors.length === 0);
        if (ready.length === 0) {
            showToast({
                type: "warning",
                title: "No products ready",
                message: "Fix validation errors before uploading.",
            });
            return;
        }

        setUploading(true);
        setProgress({ current: 0, total: ready.length, percentage: 0, currentSku: "" });
        setUploadResult(null);

        try {
            const result = await uploadProducts({
                products: ready,
                onProgress: (p) =>
                    setProgress({
                        current: p.current,
                        total: p.total,
                        percentage: p.percentage,
                        currentSku: p.currentSku,
                    }),
            });

            const res = { success: result.success.length, failed: result.failed.length };
            setUploadResult(res);

            if (result.failed.length === 0) {
                showToast({
                    type: "success",
                    title: "Upload complete",
                    message: `${result.success.length} product${result.success.length !== 1 ? "s" : ""} uploaded successfully.`,
                });
                // Clear products and draft after successful upload
                setTimeout(() => {
                    clearDraft();
                    setProducts([]);
                    setNextSkuNumber(1);
                    setProgress(null);
                    setUploadResult(null);
                }, 2500);
            } else {
                showToast({
                    type: "warning",
                    title: "Upload finished with issues",
                    message: `${result.success.length} succeeded, ${result.failed.length} failed.`,
                });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Upload failed";
            showToast({ type: "error", title: "Upload failed", message: msg });
        } finally {
            setUploading(false);
        }
    }, [products]);

    const readyCount = products.filter((p) => p.errors.length === 0).length;
    const issueCount = products.filter((p) => p.errors.length > 0).length;
    const totalImages = products.reduce((s, p) => s + p.imageFiles.length, 0);

    return (
        <div className="min-h-screen">
            <ToastContainer />

            {/* Page Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
                        Bulk Upload
                    </h1>
                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                        {mode === "classic"
                            ? "Upload products via Excel + image folders"
                            : "Just drop your product folders — no Excel needed"}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {products.length > 0 && (
                        <button
                            type="button"
                            onClick={clearAll}
                            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
                        >
                            <RotateCcw size={14} />
                            Clear
                        </button>
                    )}
                    <button
                        type="button"
                        disabled={readyCount === 0 || uploading}
                        onClick={handleUpload}
                        className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                    >
                        {uploading ? (
                            <>
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <CloudUpload size={14} />
                                Upload All{readyCount > 0 ? ` (${readyCount})` : ""}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Mode Tabs ──────────────────────────────────────────── */}
            <div className="mb-6 flex gap-1 rounded-2xl border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
                <button
                    type="button"
                    onClick={() => { setMode("spreadsheet"); }}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all flex-1 justify-center ${mode === "spreadsheet"
                        ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                        }`}
                >
                    <Table2 size={15} />
                    Spreadsheet (Manual)
                </button>
                <button
                    type="button"
                    onClick={() => { setMode("classic"); clearAll(); }}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all flex-1 justify-center ${mode === "classic"
                        ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                        }`}
                >
                    <FileSpreadsheet size={15} />
                    Classic (Excel)
                </button>
                <button
                    type="button"
                    onClick={() => { setMode("smart"); clearAll(); }}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all flex-1 justify-center ${mode === "smart"
                        ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                        }`}
                >
                    <Sparkles size={15} />
                    Smart Upload (Images)
                </button>
            </div>

            {/* ── Content ────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {mode === "classic" ? (
                    <motion.div
                        key="classic"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <ExcelUploader
                                file={excelFile}
                                loading={uploading}
                                error={excelError}
                                onFileSelect={processExcel}
                                onClear={clearExcel}
                            />
                            <FolderUploader
                                files={imageFiles}
                                loading={uploading}
                                error={imageError}
                                onFolderSelect={processImages}
                                onClear={clearImages}
                            />
                        </div>

                        {(products.length > 0 || uploading || uploadResult) && (
                            <>
                                <StatsCards
                                    totalProducts={products.length}
                                    readyProducts={readyCount}
                                    issues={issueCount}
                                    totalImages={totalImages}
                                    uploading={uploading}
                                />
                                <UploadProgress progress={progress} uploadResult={uploadResult} />
                                {products.length > 0 && (
                                    <PreviewTable products={products} />
                                )}
                            </>
                        )}
                    </motion.div>
                ) : mode === "smart" ? (
                    <motion.div
                        key="smart"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4"
                    >
                        {/* Smart Folder Uploader */}
                        <SmartFolderUploader
                            products={products}
                            loading={uploading}
                            error=""
                            onProcessed={handleSmartProcessed}
                            onClear={handleSmartClear}
                        />

                        {/* Stats */}
                        {(products.length > 0 || uploading || uploadResult) && (
                            <StatsCards
                                totalProducts={products.length}
                                readyProducts={readyCount}
                                issues={issueCount}
                                totalImages={totalImages}
                                uploading={uploading}
                            />
                        )}

                        {/* Upload Progress */}
                        <UploadProgress progress={progress} uploadResult={uploadResult} />

                        {/* Product Preview Cards */}
                        {products.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                        Product Preview
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleBulkAiFill}
                                            disabled={bulkAiLoading || products.length === 0}
                                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {bulkAiLoading ? (
                                                <>
                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                    Filling {products.filter((p) => !p.title && !p.brand).length}...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={12} />
                                                    AI Fill All ({products.filter((p) => !p.title && !p.brand).length})
                                                </>
                                            )}
                                        </button>
                                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {products.length} product{products.length !== 1 ? "s" : ""}
                                            {" · "}
                                            {readyCount} ready
                                            {issueCount > 0 && (
                                                <span className="ml-1 text-red-500">
                                                    · {issueCount} need attention
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {products.map((product, i) => (
                                        <SmartPreviewCard
                                            key={product.sku}
                                            product={product}
                                            index={i}
                                            onUpdate={handleProductUpdate}
                                            onAiFill={handleAiFill}
                                            aiLoading={aiLoadingSku === product.sku}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="spreadsheet"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4"
                    >
                        {/* Spreadsheet Editor */}
                        <SpreadsheetEditor
                            products={products}
                            onUpdate={handleProductUpdate}
                            onAddRow={handleAddRow}
                            onDeleteRow={handleDeleteRow}
                            onImagesChange={handleImagesChange}
                            onAiFill={handleAiFill}
                            aiLoadingSku={aiLoadingSku}
                        />

                        {/* Stats & Upload Progress */}
                        {products.length > 0 && (
                            <StatsCards
                                totalProducts={products.length}
                                readyProducts={readyCount}
                                issues={issueCount}
                                totalImages={totalImages}
                                uploading={uploading}
                            />
                        )}
                        <UploadProgress progress={progress} uploadResult={uploadResult} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}