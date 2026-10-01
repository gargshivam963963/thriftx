"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import ToastContainer, { showToast } from "@/components/admin/bulk/Toast";
import SpreadsheetEditor from "@/components/admin/bulk/SpreadsheetEditor";
import AIProcessingOverlay from "@/components/admin/bulk/AIProcessingOverlay";
import UploadProgress from "@/components/admin/bulk/UploadProgress";

import type { BulkProduct } from "@/app/lib/bulk/types";
import { processSmartFolders } from "@/app/lib/bulk/smart-processor";
import { sortByFilename } from "@/app/lib/bulk/image-sorter";
import { validateProducts } from "@/app/lib/bulk/validators";
import { uploadProducts } from "@/app/lib/bulk/uploader";
import { mapAIResponseToProduct } from "@/lib/ai/parser";
import { runAiFill } from "@/lib/services/aiFill";
import {
    clearDraft,
    createBlankProduct,
    generateSku,
    loadDraft,
    saveDraft,
} from "@/lib/bulk/spreadsheetStorage";

const IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/heic",
    "image/heif",
]);

const IMAGE_EXTENSIONS = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
    ".heic",
    ".heif",
]);

function isImageFile(file: File): boolean {
    const type = file.type.toLowerCase();
    if (IMAGE_TYPES.has(type)) return true;

    const name = file.name.toLowerCase();
    const dot = name.lastIndexOf(".");
    return dot >= 0 && IMAGE_EXTENSIONS.has(name.slice(dot));
}

function revokeObjectUrls(urls: string[]): void {
    for (const url of urls) {
        if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
        }
    }
}

export default function BulkUploadPage() {
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
    const [autoAiRunning, setAutoAiRunning] = useState(false);

    const [aiProcessingInfo, setAiProcessingInfo] = useState<{
        current: number;
        total: number;
        currentSku: string;
    } | null>(null);

    const [nextSkuNumber, setNextSkuNumber] = useState(1);
    const [draftLoaded, setDraftLoaded] = useState(false);

    const aiQueueRef = useRef<BulkProduct[]>([]);
    const aiRunnerRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const draft = await loadDraft();

            if (cancelled) return;

            if (draft.products.length > 0) {
                setProducts(
                    validateProducts(draft.products),
                );
                setNextSkuNumber(
                    draft.nextSkuNumber,
                );

                showToast({
                    type: "info",
                    title: "Draft restored",
                    message: `${draft.products.length} product(s) restored with saved images.`,
                    duration: 4000,
                });
            }

            setDraftLoaded(true);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!draftLoaded || uploading) return;

        const timer = window.setTimeout(() => {
            void saveDraft(
                products,
                nextSkuNumber,
            );
        }, 600);

        return () => window.clearTimeout(timer);
    }, [
        draftLoaded,
        nextSkuNumber,
        products,
        uploading,
    ]);

    const handleAddRow = useCallback(() => {
        setProducts((current) => {
            const product = createBlankProduct(nextSkuNumber);

            return validateProducts([
                ...current,
                product,
            ]).map((item, index) => ({
                ...item,
                row: index + 1,
            }));
        });

        setNextSkuNumber((current) => current + 1);
    }, [nextSkuNumber]);

    const handleDeleteRow = useCallback((sku: string) => {
        setProducts((current) => {
            const product = current.find((item) => item.sku === sku);

            if (product) {
                revokeObjectUrls(product.imageUrls);
            }

            return current
                .filter((item) => item.sku !== sku)
                .map((item, index) => ({
                    ...item,
                    row: index + 1,
                }));
        });
    }, []);

    const handleDuplicateRow = useCallback(
        (sku: string) => {
            setProducts((current) => {
                const source = current.find((item) => item.sku === sku);

                if (!source) return current;

                const imageUrls = source.imageFiles.map((file) =>
                    URL.createObjectURL(file),
                );

                const copy: BulkProduct = {
                    ...source,
                    sku: generateSku(nextSkuNumber),
                    row: current.length + 1,
                    productId: undefined,
                    imageFiles: [...source.imageFiles],
                    imageUrls,
                    primaryImage: imageUrls[0],
                    title: source.title ? `${source.title} (Copy)` : "",
                    aiGenerated: false,
                    aiConfidence: undefined,
                    aiNeedsReview: undefined,
                    status: "Ready",
                    errors: [],
                };

                return validateProducts([
                    ...current,
                    copy,
                ]).map((item, index) => ({
                    ...item,
                    row: index + 1,
                }));
            });

            setNextSkuNumber((current) => current + 1);

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
            const imageUrls = files.map((file) =>
                URL.createObjectURL(file),
            );

            setProducts((current) =>
                validateProducts(
                    current.map((product) =>
                        product.sku === sku
                            ? {
                                ...product,
                                imageFiles: files,
                                imageUrls,
                                primaryImage: imageUrls[0],
                                status:
                                    product.status === "Uploaded"
                                        ? "Ready"
                                        : product.status,
                            }
                            : product,
                    ),
                ),
            );
        },
        [],
    );

    const handleProductUpdate = useCallback(
        (sku: string, updates: Partial<BulkProduct>) => {
            setProducts((current) =>
                validateProducts(
                    current.map((product) =>
                        product.sku === sku
                            ? {
                                ...product,
                                ...updates,
                                status:
                                    product.status === "Uploaded"
                                        ? "Ready"
                                        : product.status,
                            }
                            : product,
                    ),
                ),
            );
        },
        [],
    );

    const runAiFillForProduct = useCallback(
        async (
            product: BulkProduct,
            silent = false,
        ): Promise<boolean> => {
            if (!product.imageFiles.length) {
                return false;
            }

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
                        if (!silent) {
                            showToast({
                                type: "warning",
                                title: "AI quota exceeded",
                                message:
                                    "Please wait before trying again.",
                                duration: 6000,
                            });
                        }

                        return false;
                    }

                    if (!silent) {
                        showToast({
                            type: "error",
                            title: "AI Fill failed",
                            message:
                                result.message ||
                                "Could not extract product details.",
                        });
                    }

                    return false;
                }

                const {
                    updates,
                    needsReview,
                } = mapAIResponseToProduct(result.data);

                const aiConfidence: Record<string, number> = {};

                for (const [
                    field,
                    extracted,
                ] of Object.entries(result.data)) {
                    if (
                        extracted &&
                        typeof extracted === "object" &&
                        "confidence" in extracted
                    ) {
                        const confidence = Number(
                            (
                                extracted as {
                                    confidence: number;
                                }
                            ).confidence,
                        );

                        if (Number.isFinite(confidence)) {
                            aiConfidence[field] = confidence;
                        }
                    }
                }

                handleProductUpdate(product.sku, {
                    ...updates,
                    aiGenerated: true,
                    aiConfidence,
                    aiNeedsReview:
                        needsReview.length > 0
                            ? needsReview
                            : undefined,
                });

                if (!silent) {
                    showToast({
                        type: needsReview.length
                            ? "info"
                            : "success",
                        title: needsReview.length
                            ? "AI Fill needs review"
                            : "AI Fill complete",
                        message: needsReview.length
                            ? `${needsReview.length} field(s) need review.`
                            : `${product.title || product.sku} is ready for review.`,
                        duration: 5000,
                    });
                }

                return true;
            } catch (error) {
                console.error(
                    "AI Fill error:",
                    error,
                );

                if (!silent) {
                    showToast({
                        type: "error",
                        title: "AI Fill failed",
                        message:
                            "An error occurred while processing the images.",
                    });
                }

                return false;
            } finally {
                setAiLoadingSku(null);
            }
        },
        [handleProductUpdate],
    );

    const drainAiQueue = useCallback(async () => {
        if (aiRunnerRef.current) return;
        if (!aiQueueRef.current.length) return;

        aiRunnerRef.current = true;
        setAutoAiRunning(true);

        try {
            let current = 0;

            while (aiQueueRef.current.length > 0) {
                const product =
                    aiQueueRef.current.shift();

                if (!product) continue;

                current += 1;

                setAiProcessingInfo({
                    current,
                    total:
                        current +
                        aiQueueRef.current.length,
                    currentSku: product.sku,
                });

                await runAiFillForProduct(
                    product,
                    true,
                );

                if (aiQueueRef.current.length > 0) {
                    await new Promise((resolve) =>
                        window.setTimeout(
                            resolve,
                            800,
                        ),
                    );
                }
            }
        } finally {
            aiQueueRef.current = [];
            aiRunnerRef.current = false;

            setAutoAiRunning(false);
            setAiProcessingInfo(null);
            setAiLoadingSku(null);
        }
    }, [runAiFillForProduct]);

    const enqueueAi = useCallback(
        (items: BulkProduct[]) => {
            const existing = new Set(
                aiQueueRef.current.map(
                    (item) => item.sku,
                ),
            );

            for (const product of items) {
                if (
                    !product.imageFiles.length ||
                    existing.has(product.sku)
                ) {
                    continue;
                }

                aiQueueRef.current.push(product);
                existing.add(product.sku);
            }

            void drainAiQueue();
        },
        [drainAiQueue],
    );

    const handleFilesSelected = useCallback(
        (files: File[]) => {
            // Folder uploads must be passed intact to the folder processor.
            // Filtering by MIME type here can silently drop files on macOS
            // when File.type is empty/unknown (common with HEIC/HEIF and
            // some image extensions), which can make an entire product
            // folder disappear. The processor validates by extension.
            const selectedFiles = files;
            const images = files.filter(isImageFile);

            if (!images.length) {
                showToast({
                    type: "warning",
                    title: "No supported images",
                    message:
                        "Select JPG, PNG, WEBP or AVIF images.",
                });
                return;
            }

            const hasFolderPath = images.some((file) =>
                Boolean(
                    (
                        file as File & {
                            webkitRelativePath?: string;
                        }
                    ).webkitRelativePath,
                ),
            );

            if (hasFolderPath) {
                const result =
                    processSmartFolders(selectedFiles);

                if (!result.products.length) {
                    showToast({
                        type: "warning",
                        title: "No products detected",
                        message:
                            "Each product must be inside its own subfolder.",
                        duration: 5000,
                    });

                    return;
                }

                const normalized =
                    result.products.map(
                        (product) => ({
                            ...product,
                            row: 0,
                        }),
                    );

                setProducts((current) =>
                    validateProducts([
                        ...current,
                        ...normalized,
                    ]).map(
                        (product, index) => ({
                            ...product,
                            row: index + 1,
                        }),
                    ),
                );

                enqueueAi(normalized);

                showToast({
                    type: "success",
                    title: `${normalized.length} product${normalized.length === 1
                        ? ""
                        : "s"
                        } detected`,
                    message:
                        "AI analysis started automatically.",
                    duration: 4000,
                });

                return;
            }

            const sorted =
                sortByFilename(images);

            const imageUrls = sorted.map(
                (file) =>
                    URL.createObjectURL(file),
            );

            const product: BulkProduct = {
                ...createBlankProduct(
                    nextSkuNumber,
                ),
                imageFiles: sorted,
                imageUrls,
                primaryImage: imageUrls[0],
            };

            setProducts((current) =>
                validateProducts([
                    ...current,
                    product,
                ]).map(
                    (item, index) => ({
                        ...item,
                        row: index + 1,
                    }),
                ),
            );

            setNextSkuNumber(
                (current) => current + 1,
            );

            enqueueAi([product]);
        },
        [enqueueAi, nextSkuNumber],
    );

    const handleFolderSelected = useCallback(
        (files: File[]) => {
            handleFilesSelected(files);
        },
        [handleFilesSelected],
    );

    const handleAiFill = useCallback(
        async (sku: string) => {
            if (
                autoAiRunning ||
                bulkAiLoading
            ) {
                return;
            }

            const product = products.find(
                (item) => item.sku === sku,
            );

            if (!product) return;

            if (!product.imageFiles.length) {
                showToast({
                    type: "warning",
                    title: "No images",
                    message:
                        "Add product images first.",
                });

                return;
            }

            await runAiFillForProduct(
                product,
            );
        },
        [
            autoAiRunning,
            bulkAiLoading,
            products,
            runAiFillForProduct,
        ],
    );

    const handleBulkAiFill =
        useCallback(async () => {
            if (
                autoAiRunning ||
                bulkAiLoading
            ) {
                return;
            }

            const targets =
                products.filter(
                    (product) =>
                        product.status !==
                        "Uploaded" &&
                        product.imageFiles.length >
                        0 &&
                        !product.aiGenerated,
                );

            if (!targets.length) {
                showToast({
                    type: "info",
                    title: "Nothing to fill",
                    message:
                        "All products with images have already been analyzed.",
                });

                return;
            }

            setBulkAiLoading(true);

            let success = 0;

            try {
                for (
                    let index = 0;
                    index < targets.length;
                    index += 1
                ) {
                    const product =
                        targets[index];

                    setAiProcessingInfo({
                        current: index + 1,
                        total: targets.length,
                        currentSku:
                            product.sku,
                    });

                    if (
                        await runAiFillForProduct(
                            product,
                            true,
                        )
                    ) {
                        success += 1;
                    }

                    if (
                        index <
                        targets.length - 1
                    ) {
                        await new Promise(
                            (resolve) =>
                                window.setTimeout(
                                    resolve,
                                    1000,
                                ),
                        );
                    }
                }
            } finally {
                setBulkAiLoading(false);
                setAiProcessingInfo(null);
                setAiLoadingSku(null);
            }

            showToast({
                type:
                    success === targets.length
                        ? "success"
                        : "info",
                title:
                    "Bulk AI Fill complete",
                message: `${success} of ${targets.length} product(s) analyzed successfully.`,
                duration: 5000,
            });
        }, [
            autoAiRunning,
            bulkAiLoading,
            products,
            runAiFillForProduct,
        ]);

    const handleUpload =
        useCallback(async () => {
            if (uploading) return;

            const validated =
                validateProducts(
                    products.filter(
                        (product) =>
                            product.status !==
                            "Uploaded",
                    ),
                );

            const ready =
                validated.filter(
                    (product) =>
                        product.status ===
                        "Ready" &&
                        product.errors.length ===
                        0,
                );

            setProducts((current) =>
                current.map((product) =>
                    product.status ===
                        "Uploaded"
                        ? product
                        : validated.find(
                            (item) =>
                                item.sku ===
                                product.sku,
                        ) ?? product,
                ),
            );

            if (!ready.length) {
                showToast({
                    type: "warning",
                    title: "No products ready",
                    message:
                        "Fix the validation issues before creating products.",
                    duration: 5000,
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
                const result =
                    await uploadProducts({
                        products: ready,
                        onProgress: (
                            value,
                        ) => {
                            setProgress({
                                current:
                                    value.current,
                                total:
                                    value.total,
                                percentage:
                                    value.percentage,
                                currentSku:
                                    value.currentSku,
                            });

                            setProducts(
                                (current) =>
                                    current.map(
                                        (
                                            product,
                                        ) =>
                                            product.sku ===
                                                value.currentSku
                                                ? {
                                                    ...product,
                                                    status:
                                                        "Uploading",
                                                }
                                                : product,
                                    ),
                            );
                        },
                    });

                const resultsBySku =
                    new Map(
                        [
                            ...result.success,
                            ...result.failed,
                        ].map(
                            (product) => [
                                product.sku,
                                product,
                            ],
                        ),
                    );

                setProducts((current) =>
                    current.map(
                        (product) =>
                            resultsBySku.get(
                                product.sku,
                            ) ?? product,
                    ),
                );

                const summary = {
                    success:
                        result.success.length,
                    failed:
                        result.failed.length,
                };

                setUploadResult(summary);

                if (summary.failed === 0) {
                    showToast({
                        type: "success",
                        title:
                            "Create complete",
                        message: `${summary.success} product${summary.success === 1
                            ? ""
                            : "s"
                            } created successfully.`,
                        duration: 5000,
                    });

                    window.setTimeout(
                        () => {
                            clearDraft();

                            setProducts(
                                [],
                            );

                            setNextSkuNumber(
                                1,
                            );

                            setProgress(
                                null,
                            );

                            setUploadResult(
                                null,
                            );
                        },
                        2500,
                    );
                } else {
                    showToast({
                        type: "warning",
                        title:
                            "Create finished with issues",
                        message: `${summary.success} succeeded, ${summary.failed} failed.`,
                        duration: 6000,
                    });
                }
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Create failed";

                showToast({
                    type: "error",
                    title: "Create failed",
                    message,
                    duration: 6000,
                });
            } finally {
                setUploading(false);
            }
        }, [products, uploading]);

    return (
        <div className="min-h-screen">
            <ToastContainer />

            <motion.div
                initial={{
                    opacity: 0,
                    y: 8,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="space-y-4"
            >
                <SpreadsheetEditor
                    products={products}
                    onUpdate={handleProductUpdate}
                    onAddRow={handleAddRow}
                    onDeleteRow={handleDeleteRow}
                    onDuplicateRow={
                        handleDuplicateRow
                    }
                    onImagesChange={
                        handleImagesChange
                    }
                    onAiFill={handleAiFill}
                    aiLoadingSku={
                        aiLoadingSku
                    }
                    onUpload={handleUpload}
                    uploading={uploading}
                    bulkAiLoading={
                        bulkAiLoading
                    }
                    onAiFillAll={
                        handleBulkAiFill
                    }
                    onFilesSelected={
                        handleFilesSelected
                    }
                    onFolderSelected={
                        handleFolderSelected
                    }
                    aiProcessing={
                        autoAiRunning
                    }
                    aiProcessingInfo={
                        aiProcessingInfo
                    }
                />
            </motion.div>

            <UploadProgress
                progress={progress}
                uploadResult={uploadResult}
            />

            <AIProcessingOverlay
                open={
                    autoAiRunning ||
                    bulkAiLoading
                }
                current={
                    aiProcessingInfo?.current ??
                    0
                }
                total={
                    aiProcessingInfo?.total ??
                    0
                }
                currentSku={
                    aiProcessingInfo?.currentSku ??
                    ""
                }
            />
        </div>
    );
}