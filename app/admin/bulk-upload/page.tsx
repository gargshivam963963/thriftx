"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ToastContainer, { showToast } from "@/components/admin/bulk/Toast";
import SpreadsheetEditor from "@/components/admin/bulk/SpreadsheetEditor";
import AIProcessingOverlay from "@/components/admin/bulk/AIProcessingOverlay";
import UploadProgress from "@/components/admin/bulk/UploadProgress";

import type { BulkProduct } from "@/app/lib/bulk/types";
import { uploadProducts } from "@/app/lib/bulk/uploader";
import { processSmartFolders } from "@/app/lib/bulk/smart-processor";
import { sortByFilename } from "@/app/lib/bulk/image-sorter";
import { matchImages } from "@/app/lib/bulk/image-matcher";
import { parseExcel } from "@/app/lib/bulk/excel-parser";
import { mapAIResponseToProduct } from "@/lib/ai/parser";
import { validateProducts } from "@/app/lib/bulk/validators";
import { runAiFill } from "@/lib/services/aiFill";
import {
    loadDraft,
    saveDraft,
    clearDraft,
    createBlankProduct,
    generateSku,
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
    const [bulkAiLoading, setBulkAiLoading] = useState(false);
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [excelLoading, setExcelLoading] = useState(false);
    const [excelError, setExcelError] = useState<string | undefined>();

    // ── Spreadsheet mode state ─────────────────────────────────
    const [nextSkuNumber, setNextSkuNumber] = useState(1);
    const [draftLoaded, setDraftLoaded] = useState(false);

    // ── Auto AI queue (after image drop) ───────────────────────
    const autoAiQueueRef = useRef<BulkProduct[]>([]);
    const [autoAiRunning, setAutoAiRunning] = useState(false);
    const [aiProcessingInfo, setAiProcessingInfo] = useState<{
        current: number;
        total: number;
        currentSku: string;
    } | null>(null);

    // ── Draft persistence ──────────────────────────────────────
    useEffect(() => {
        const draft = loadDraft();
        if (draft.products.length > 0) {
            setProducts(draft.products);
            setNextSkuNumber(draft.nextSkuNumber);
            showToast({
                type: "info",
                title: "Draft restored",
                message: `${draft.products.length} product(s) loaded from your last session. Images need re-upload.`,
                duration: 5000,
            });
        }
        setDraftLoaded(true);
    }, []);

    useEffect(() => {
        if (!draftLoaded) return;
        const t = setTimeout(() => {
            saveDraft(products, nextSkuNumber);
        }, 600);
        return () => clearTimeout(t);
    }, [products, nextSkuNumber, draftLoaded]);

    // ── Core handlers ──────────────────────────────────────────
    const handleAddRow = useCallback(() => {
        const newProduct = createBlankProduct(nextSkuNumber);
        setProducts((prev) => validateProducts([...prev, newProduct]));
        setNextSkuNumber((prev) => prev + 1);
        showToast({
            type: "success",
            title: "Row added",
            message: `${newProduct.sku} added`,
            duration: 2000,
        });
    }, [nextSkuNumber]);

    const handleDeleteRow = useCallback((sku: string) => {
        setProducts((prev) => prev.filter((p) => p.sku !== sku));
        showToast({
            type: "info",
            title: "Row deleted",
            message: `${sku} removed`,
            duration: 2000,
        });
    }, []);

    const handleDuplicateRow = useCallback(
        (sku: string) => {
            setProducts((prev) => {
                const source = prev.find((p) => p.sku === sku);
                if (!source) return prev;
                const copy: BulkProduct = {
                    ...source,
                    sku: generateSku(nextSkuNumber),
                    row: prev.length + 1,
                    productId: undefined,
                    imageUrls: source.imageFiles.map((file) => URL.createObjectURL(file)),
                    primaryImage: source.imageFiles[0]
                        ? URL.createObjectURL(source.imageFiles[0])
                        : undefined,
                    title: source.title ? `${source.title} (Copy)` : "",
                    aiGenerated: false,
                    aiConfidence: undefined,
                    aiNeedsReview: undefined,
                    status: "Ready",
                    errors: [],
                };
                setNextSkuNumber((n) => n + 1);
                return validateProducts([...prev, copy]);
            });
            showToast({
                type: "success",
                title: "Product duplicated",
                duration: 2000,
            });
        },
        [nextSkuNumber],
    );

    const handleImagesChange = useCallback(
        (sku: string, files: File[]) => {
            const imageUrls = files.map((file) => URL.createObjectURL(file));
            setProducts((prev) => validateProducts(
                prev.map((p) =>
                    p.sku === sku
                        ? {
                            ...p,
                            imageFiles: files,
                            imageUrls,
                            primaryImage: imageUrls[0],
                            status: p.status === "Uploaded" ? "Ready" : p.status,
                            errors: [],
                        }
                        : p,
                ),
            ));
        },
        [],
    );

    const handleProductUpdate = useCallback(
        (sku: string, updates: Partial<BulkProduct>) => {
            setProducts((prev) => validateProducts(
                prev.map((p) =>
                    p.sku === sku
                        ? {
                            ...p,
                            ...updates,
                            status: p.status === "Uploaded" ? "Ready" : p.status,
                            errors: [],
                        }
                        : p,
                ),
            ));
        },
        [],
    );

    // ── Core AI fill for a single product ──────────────────────
    const runAiFillForProduct = useCallback(
        async (product: BulkProduct) => {
            if (!product || product.imageFiles.length === 0) return;

            setAiLoadingSku(product.sku);
            try {
                const result = await runAiFill(product.imageFiles, {
                    key: product.sku,
                    productId: undefined,
                    analyzeAllImages: true,
                    onProgress: () => { },
                });

                if (!result.success || !result.data) {
                    if (result.code === "RATE_LIMITED") {
                        showToast({
                            type: "warning",
                            title: "AI quota exceeded",
                            message:
                                "Please wait a moment before trying again, or upgrade your Gemini API plan.",
                            duration: 6000,
                        });
                        return;
                    }
                    showToast({
                        type: "error",
                        title: "AI Fill failed",
                        message:
                            result.message || "Could not extract details.",
                    });
                    return;
                }

                const { updates, needsReview } =
                    mapAIResponseToProduct(result.data);

                const aiConfidence: Record<string, number> = {};
                for (const [field, extracted] of Object.entries(result.data)) {
                    if (
                        extracted &&
                        typeof extracted === "object" &&
                        "confidence" in extracted
                    ) {
                        aiConfidence[field] = (
                            extracted as { confidence: number }
                        ).confidence;
                    }
                }

                const productUpdates: Partial<BulkProduct> = {
                    ...updates,
                    aiGenerated: true,
                    aiConfidence,
                    aiNeedsReview:
                        needsReview.length > 0 ? needsReview : undefined,
                    errors: [],
                };

                handleProductUpdate(product.sku, productUpdates);

                if (needsReview.length > 0) {
                    showToast({
                        type: "info",
                        title: "AI Fill — needs review",
                        message: `${needsReview.length} field${needsReview.length !== 1 ? "s" : ""
                            } need review: ${needsReview.join(", ")}`,
                        duration: 6000,
                    });
                } else {
                    showToast({
                        type: "success",
                        title: "AI Fill complete",
                        message: `All fields extracted for ${product.title || product.sku
                            }`,
                    });
                }
            } catch (err) {
                console.error("AI Fill error:", err);
                showToast({
                    type: "error",
                    title: "AI Fill failed",
                    message:
                        "An error occurred while processing the images.",
                });
            } finally {
                setAiLoadingSku(null);
            }
        },
        [handleProductUpdate],
    );

    const handleAiFill = useCallback(
        async (sku: string) => {
            const product = products.find((p) => p.sku === sku);
            if (!product) return;
            if (product.imageFiles.length === 0) {
                showToast({
                    type: "warning",
                    title: "No images",
                    message: "Upload images first.",
                });
                return;
            }
            await runAiFillForProduct(product);
        },
        [products, runAiFillForProduct],
    );

    // ── Auto-AI queue processor ────────────────────────────────
    const processAutoAiQueue = useCallback(async () => {
        if (autoAiRunning) return;
        const queue = autoAiQueueRef.current;
        if (queue.length === 0) return;

        setAutoAiRunning(true);
        const total = queue.length;

        for (let i = 0; i < queue.length; i++) {
            const p = queue[i];
            setAiProcessingInfo({
                current: i + 1,
                total,
                currentSku: p.sku,
            });
            await runAiFillForProduct(p);
            if (i < queue.length - 1) {
                await new Promise((r) => setTimeout(r, 800));
            }
        }

        autoAiQueueRef.current = [];
        setAutoAiRunning(false);
        setAiProcessingInfo(null);
        setAiLoadingSku(null);
    }, [autoAiRunning, runAiFillForProduct]);

    const enqueueAi = useCallback(
        (items: BulkProduct[]) => {
            const withImages = items.filter((p) => p.imageFiles.length > 0);
            if (withImages.length === 0) return;
            autoAiQueueRef.current = [
                ...autoAiQueueRef.current,
                ...withImages,
            ];
            processAutoAiQueue();
        },
        [processAutoAiQueue],
    );

    // ── Dropzone handlers ──────────────────────────────────────
    const handleFilesSelected = useCallback(
        (files: File[]) => {
            let imageFiles = files.filter((file) => file.type.startsWith("image/"));
            if (imageFiles.length === 0) {
                showToast({ type: "warning", title: "No supported images selected" });
                return;
            }
            const hasFolderPath = imageFiles.some(
                (file) =>
                    (file as File & { webkitRelativePath?: string })
                        .webkitRelativePath,
            );

            const waitingForImages = products.filter(
                (product) =>
                    product.status !== "Uploaded" && product.imageFiles.length === 0,
            );
            if (waitingForImages.length > 0) {
                const matchedProducts = matchImages(waitingForImages, imageFiles).filter(
                    (product) => product.imageFiles.length > 0,
                );
                if (matchedProducts.length > 0) {
                    const matchedBySku = new Map(
                        matchedProducts.map((product) => [product.sku, product]),
                    );
                    setProducts((current) =>
                        validateProducts(
                            current.map((product) =>
                                matchedBySku.get(product.sku) ?? product,
                            ),
                        ),
                    );
                    enqueueAi(matchedProducts);
                    const matchedFiles = new Set(
                        matchedProducts.flatMap((product) => product.imageFiles),
                    );
                    imageFiles = imageFiles.filter((file) => !matchedFiles.has(file));
                    if (imageFiles.length === 0) {
                        showToast({
                            type: "success",
                            title: "Images matched by SKU",
                            message: `${matchedProducts.length} product row(s) received images.`,
                        });
                        return;
                    }
                }
            }

            if (hasFolderPath) {
                const result = processSmartFolders(imageFiles);
                if (result.products.length === 0) {
                    showToast({
                        type: "warning",
                        title: "No products detected",
                        message:
                            "Place images inside subfolders — each folder becomes one product.",
                        duration: 5000,
                    });
                    return;
                }

                setProducts((current) => {
                    const merged = [...current, ...result.products];
                    return validateProducts(
                        merged.map((product, index) => ({ ...product, row: index + 1 })),
                    );
                });

                showToast({
                    type: "success",
                    title: `${result.products.length} product${result.products.length !== 1 ? "s" : ""} detected`,
                    message: "Auto-starting AI to extract details...",
                    duration: 4000,
                });
                enqueueAi(result.products);
                return;
            }

            if (imageFiles.length > 0) {
                const sorted = sortByFilename(imageFiles);
                const imageUrls = sorted.map((file) => URL.createObjectURL(file));
                const newProduct: BulkProduct = {
                    ...createBlankProduct(nextSkuNumber),
                    imageFiles: sorted,
                    imageUrls,
                    primaryImage: imageUrls[0],
                };
                setProducts((current) => validateProducts([...current, newProduct]));
                setNextSkuNumber((current) => current + 1);
                showToast({
                    type: "success",
                    title: "Product created",
                    message: `${newProduct.sku} · ${sorted.length} images. Auto-starting AI...`,
                    duration: 4000,
                });
                enqueueAi([newProduct]);
            }
        },
        [nextSkuNumber, enqueueAi, products],
    );

    const handleFolderSelected = useCallback(
        (files: File[]) => {
            handleFilesSelected(files);
        },
        [handleFilesSelected],
    );

    const handleExcelSelect = useCallback(async (file: File) => {
        setExcelFile(file);
        setExcelError(undefined);
        setExcelLoading(true);
        try {
            const imported = await parseExcel(file);
            if (imported.length === 0) {
                throw new Error("The spreadsheet contains no product rows.");
            }

            setProducts((current) => validateProducts([...current, ...imported]));
            const highestSkuNumber = imported.reduce((highest, product) => {
                const match = product.sku.match(/^TX(\d+)$/i);
                return match ? Math.max(highest, Number(match[1])) : highest;
            }, 0);
            setNextSkuNumber((current) =>
                Math.max(current, highestSkuNumber + 1, imported.length + 1),
            );
            showToast({
                type: "success",
                title: "Spreadsheet imported",
                message: `${imported.length} row(s) added. Add images named by SKU or drop product folders.`,
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Could not parse spreadsheet.";
            setExcelError(message);
            setExcelFile(null);
            showToast({ type: "error", title: "Spreadsheet import failed", message });
        } finally {
            setExcelLoading(false);
        }
    }, []);

    const handleExcelClear = useCallback(() => {
        setExcelFile(null);
        setExcelError(undefined);
    }, []);

    // ── Bulk AI Fill ───────────────────────────────────────────
    const handleBulkAiFill = useCallback(async () => {
        const productsWithoutData = products.filter(
            (p) =>
                !p.title &&
                !p.brand &&
                p.errors.length === 0 &&
                p.imageFiles.length > 0,
        );

        if (productsWithoutData.length === 0) {
            showToast({
                type: "info",
                title: "Nothing to fill",
                message: "All products already have data or have issues.",
            });
            return;
        }

        setBulkAiLoading(true);
        let successCount = 0;
        let quotaExceeded = false;

        for (let i = 0; i < productsWithoutData.length; i++) {
            if (quotaExceeded) break;

            const product = productsWithoutData[i];
            setAiLoadingSku(product.sku);
            setAiProcessingInfo({
                current: i + 1,
                total: productsWithoutData.length,
                currentSku: product.sku,
            });

            try {
                const result = await runAiFill(product.imageFiles, {
                    key: product.sku,
                    productId: undefined,
                    analyzeAllImages: true,
                    onProgress: () => { },
                });

                if (!result.success || !result.data) {
                    if (result.code === "RATE_LIMITED") {
                        quotaExceeded = true;
                        showToast({
                            type: "warning",
                            title: "AI quota exceeded",
                            message: `Stopped after ${i} product${i !== 1 ? "s" : ""
                                }. Try again later or upgrade your plan.`,
                            duration: 6000,
                        });
                        break;
                    }
                    continue;
                }

                const aiData = result.data;
                const updates: Partial<BulkProduct> = {};
                if (aiData.seoTitle?.value) updates.title = aiData.seoTitle.value;
                if (aiData.brand?.value) updates.brand = aiData.brand.value;
                if (aiData.gender?.value) updates.gender = aiData.gender.value as BulkProduct["gender"];
                if (aiData.category?.value) updates.category = aiData.category.value;
                if (aiData.size?.value) updates.size = aiData.size.value;
                if (aiData.color?.value) updates.color = aiData.color.value;
                if (aiData.material?.value) updates.material = aiData.material.value;
                if (aiData.seoDescription?.value)
                    updates.description = aiData.seoDescription.value;

                handleProductUpdate(product.sku, updates);
                successCount++;

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
        setAiProcessingInfo(null);

        if (successCount > 0) {
            showToast({
                type: "success",
                title: "Bulk AI Fill complete",
                message: `${successCount} product${successCount !== 1 ? "s" : ""
                    } filled.`,
            });
        }
    }, [products, handleProductUpdate]);

    // ── Upload ─────────────────────────────────────────────────
    const handleUpload = useCallback(async () => {
        const validated = validateProducts(
            products.filter((product) => product.status !== "Uploaded"),
        );
        const validatedBySku = new Map(validated.map((product) => [product.sku, product]));
        setProducts((current) =>
            current.map((product) =>
                product.status === "Uploaded"
                    ? product
                    : validatedBySku.get(product.sku) ?? product,
            ),
        );
        const ready = validated.filter(
            (product) => product.status === "Ready" && product.errors.length === 0,
        );
        if (ready.length === 0) {
            showToast({
                type: "warning",
                title: "No products ready",
                message: "Complete required fields and reselect any missing images before uploading.",
            });
            return;
        }

        setUploading(true);
        setProgress({
            current: 0,
            total: ready.length,
            percentage: 0,
            currentSku: "",
        });
        setUploadResult(null);

        try {
            const result = await uploadProducts({
                products: ready,
                onProgress: (p) => {
                    setProgress({
                        current: p.current,
                        total: p.total,
                        percentage: p.percentage,
                        currentSku: p.currentSku,
                    });
                    setProducts((current) =>
                        current.map((product) =>
                            product.sku === p.currentSku
                                ? { ...product, status: "Uploading" }
                                : product,
                        ),
                    );
                },
            });

            const resultsBySku = new Map(
                [...result.success, ...result.failed].map((product) => [product.sku, product]),
            );
            setProducts((current) =>
                current.map((product) => resultsBySku.get(product.sku) ?? product),
            );

            const res = {
                success: result.success.length,
                failed: result.failed.length,
            };
            setUploadResult(res);

            if (result.failed.length === 0) {
                showToast({
                    type: "success",
                    title: "Upload complete",
                    message: `${result.success.length} product${result.success.length !== 1 ? "s" : ""
                        } uploaded successfully.`,
                });
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

    return (
        <div className="min-h-screen">
            <ToastContainer />
            <motion.div
                key="spreadsheet"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
            >
                <SpreadsheetEditor
                    products={products}
                    onUpdate={handleProductUpdate}
                    onAddRow={handleAddRow}
                    onDeleteRow={handleDeleteRow}
                    onDuplicateRow={handleDuplicateRow}
                    onImagesChange={handleImagesChange}
                    onAiFill={handleAiFill}
                    aiLoadingSku={aiLoadingSku}
                    onUpload={handleUpload}
                    uploading={uploading}
                    bulkAiLoading={bulkAiLoading}
                    onAiFillAll={handleBulkAiFill}
                    onFilesSelected={handleFilesSelected}
                    onFolderSelected={handleFolderSelected}
                    excelFile={excelFile}
                    excelLoading={excelLoading}
                    excelError={excelError}
                    onExcelSelect={handleExcelSelect}
                    onExcelClear={handleExcelClear}
                    aiProcessing={autoAiRunning}
                    aiProcessingInfo={aiProcessingInfo}
                />
            </motion.div>

            {/* Upload Progress */}
            <UploadProgress progress={progress} uploadResult={uploadResult} />

            {/* AI Processing Overlay */}
            <AIProcessingOverlay
                open={autoAiRunning || bulkAiLoading}
                current={aiProcessingInfo?.current ?? 0}
                total={aiProcessingInfo?.total ?? 0}
                currentSku={aiProcessingInfo?.currentSku ?? ""}
            />
        </div>
    );
}