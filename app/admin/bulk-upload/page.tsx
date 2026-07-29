"use client";

import { useState, useCallback, useEffect } from "react";
import { CloudUpload, RotateCcw, Table2 } from "lucide-react";
import { motion } from "framer-motion";

// import ExcelUploader from "@/components/admin/bulk/ExcelUploader";
// import FolderUploader from "@/components/admin/bulk/FolderUploader";
import ToastContainer, { showToast } from "@/components/admin/bulk/Toast";
import SpreadsheetEditor from "@/components/admin/bulk/SpreadsheetEditor";

import type { BulkProduct } from "@/app/lib/bulk/types";
import { uploadProducts } from "@/app/lib/bulk/uploader";
import { mapAIResponseToProduct } from "@/lib/ai/parser";
import {
    loadDraft,
    saveDraft,
    clearDraft,
    createBlankProduct,
} from "@/lib/bulk/spreadsheetStorage";

export default function BulkUploadPage() {
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

    const handleProductUpdate = useCallback(
        (sku: string, updates: Partial<BulkProduct>) => {
            setProducts((prev) =>
                prev.map((p) =>
                    p.sku === sku
                        ? {
                            ...p,
                            ...updates,
                            errors: [],
                        }
                        : p
                )
            );
        },
        []
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

                // Convert ALL images to base64 (they represent ONE product)
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
                    body: JSON.stringify({ images: base64Images }),
                });

                const result = await response.json();
                if (!result.success) {
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

                // Map AI response (with confidence) to product updates
                const { updates, needsReview } = mapAIResponseToProduct(result.data);

                // Collect confidence scores for display
                const aiConfidence: Record<string, number> = {};
                if (result.data) {
                    for (const [field, extracted] of Object.entries(result.data)) {
                        if (extracted && typeof extracted === 'object' && 'confidence' in extracted) {
                            aiConfidence[field] = (extracted as { confidence: number }).confidence;
                        }
                    }
                }

                const productUpdates: Partial<BulkProduct> = {
                    ...updates,
                    aiGenerated: true,
                    aiConfidence,
                    aiNeedsReview: needsReview.length > 0 ? needsReview : undefined,
                    errors: [],
                };

                handleProductUpdate(sku, productUpdates);

                if (needsReview.length > 0) {
                    showToast({
                        type: "info",
                        title: "AI Fill — needs review",
                        message: `${needsReview.length} field${needsReview.length !== 1 ? 's' : ''} need review: ${needsReview.join(', ')}`,
                        duration: 6000,
                    });
                } else {
                    showToast({
                        type: "success",
                        title: "AI Fill complete",
                        message: `All fields extracted for ${product.title || sku}`,
                    });
                }
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
            {/* ── Content ────────────────────────────────────────────── */}
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
                    onUpload={handleUpload}
                    uploading={uploading}
                />
            </motion.div>
        </div>
    );
}