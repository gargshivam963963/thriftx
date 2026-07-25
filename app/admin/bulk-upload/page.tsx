"use client";

import { useMemo, useState, useCallback } from "react";
import { Download, CloudUpload, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

import StatsCards from "@/components/admin/bulk/StatsCards";
import ExcelUploader from "@/components/admin/bulk/ExcelUploader";
import FolderUploader from "@/components/admin/bulk/FolderUploader";
import PreviewTable from "@/components/admin/bulk/PreviewTable";
import UploadProgress from "@/components/admin/bulk/UploadProgress";
import ToastContainer, { showToast } from "@/components/admin/bulk/Toast";

import type { BulkProduct } from "@/app/lib/bulk/types";
import { parseExcel } from "@/app/lib/bulk/excel-parser";
import { matchImages } from "@/app/lib/bulk/image-matcher";
import { validateProducts } from "@/app/lib/bulk/validators";
import { uploadProducts } from "@/app/lib/bulk/uploader";

export default function BulkUploadPage() {
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [excelError, setExcelError] = useState<string>("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageError, setImageError] = useState<string>("");
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

    const clearAll = useCallback(() => {
        setExcelFile(null);
        setImageFiles([]);
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
                        Upload hundreds of products in minutes
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => showToast({ type: "info", title: "Template download", message: "Feature coming soon" })}
                        className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
                    >
                        <Download size={14} />
                        Template
                    </button>
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

            {/* Upload Cards + Stats in one viewport area */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                {/* Upload Cards */}
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

                {/* Progress */}
                <UploadProgress progress={progress} uploadResult={uploadResult} />

                {/* Preview Table */}
                {products.length > 0 && (
                    <div className="max-h-[calc(100vh-32rem)] overflow-y-auto rounded-2xl border border-neutral-200/70 dark:border-neutral-700/50">
                        <PreviewTable products={products} />
                    </div>
                )}
            </motion.div>
        </div>
    );
}

