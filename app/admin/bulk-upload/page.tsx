"use client";

import { useMemo, useState } from "react";

import BulkHeader from "@/components/admin/bulk/BulkHeader";
import StatsCards from "@/components/admin/bulk/StatsCards";
import ExcelUploader from "@/components/admin/bulk/ExcelUploader";
import FolderUploader from "@/components/admin/bulk/FolderUploader";
import AISettings from "@/components/admin/bulk/AISettings";
import PreviewTable, {
    BulkPreviewProduct,
} from "@/components/admin/bulk/PreviewTable";
import UploadToolbar from "@/components/admin/bulk/UploadToolbar";
import UploadProgress from "@/components/admin/bulk/UploadProgress";

import { BulkProduct } from "@/app/lib/bulk/types";
import { parseExcel } from "@/app/lib/bulk/excel-parser";
import { matchImages } from "@/app/lib/bulk/image-matcher";
import { validateProducts } from "@/app/lib/bulk/validators";
import { uploadProducts } from "@/app/lib/bulk/uploader";

export default function BulkUploadPage() {
    const [excelFile, setExcelFile] =
        useState<File | null>(null);

    const [imageFiles, setImageFiles] =
        useState<File[]>([]);

    const [products, setProducts] =
        useState<BulkProduct[]>([]);

    const [uploading, setUploading] =
        useState(false);

    const [aiLoading, setAiLoading] =
        useState(false);

    const [progress, setProgress] = useState({
        current: 0,
        total: 0,
        percentage: 0,
        currentSku: "",
    });

    async function handleExcel(file: File) {
        setExcelFile(file);

        try {
            const parsed = await parseExcel(file);

            let result = parsed;

            if (imageFiles.length) {
                result = matchImages(parsed, imageFiles);
            }

            result = validateProducts(result);

            setProducts(result);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleFolder(files: File[]) {
        setImageFiles(files);

        if (!excelFile) return;

        try {
            const parsed = await parseExcel(excelFile);

            const matched = matchImages(parsed, files);

            console.log("MATCHED PRODUCTS");
            console.log(matched);

            const validated = validateProducts(matched);

            setProducts(validated);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleGenerateAI(
        fields: string[]
    ) {
        console.log("Generate AI:", fields);

        setAiLoading(true);

        try {
            // AI Integration
        } finally {
            setAiLoading(false);
        }
    }

    async function handleUpload() {
        if (!products.length) return;

        setUploading(true);

        try {
            await uploadProducts({
                products,

                onProgress(progressData) {
                    setProgress(progressData);
                },
            });
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
        }
    }

    const previewData =
        useMemo<BulkPreviewProduct[]>(() => {
            return products.map((product) => ({
                sku: product.sku,

                image:
                    product.primaryImage ||
                    "/placeholder.png",

                brand: product.brand,

                title: product.title,

                category: product.category,

                price: product.price,

                status:
                    product.errors.length === 0
                        ? "Ready"
                        : "Issue",

                ai: product.aiGenerated
                    ? "Generated"
                    : "Pending",
            }));
        }, [products]);

    const totalProducts =
        products.length;

    const readyProducts = products.filter(
        (p) => p.errors.length === 0
    ).length;

    const issues = products.filter(
        (p) => p.errors.length > 0
    ).length;

    const totalImages = products.reduce(
        (sum, product) =>
            sum + product.imageFiles.length,
        0
    );

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="mx-auto max-w-7xl space-y-6 p-6">

                <BulkHeader
                    uploading={uploading}
                    uploadDisabled={readyProducts === 0}
                    onUpload={handleUpload}
                // onClear={handleClear}
                />

                <StatsCards
                    totalProducts={totalProducts}
                    readyProducts={readyProducts}
                    issues={issues}
                    totalImages={totalImages}
                    uploading={uploading}
                />

                <div className="grid gap-6 lg:grid-cols-2">

                    <ExcelUploader
                        file={excelFile}
                        loading={uploading}
                        onFileSelect={handleExcel}
                    />

                    <FolderUploader
                        files={imageFiles}
                        loading={uploading}
                        onFolderSelect={
                            handleFolder
                        }
                    />
                </div>

                {/* <AISettings
                    loading={aiLoading}
                    onGenerate={
                        handleGenerateAI
                    }
                /> */}
                {/* Upload Toolbar */}

                {/* TODO:
                    We'll connect UploadToolbar props
                    after updating that component.
                */}

                <UploadToolbar />
                s dfsdf sdf sdf sdf dsf dsf fds f

                {/* Product Preview */}

                <PreviewTable
                    data={previewData}
                />

                {/* Upload Progress */}

                {/* TODO:
                    We'll connect UploadProgress props
                    after updating that component.
                */}

                <UploadProgress />

                {/* Debug Panel (Temporary) */}

                <div className="rounded-2xl border bg-white p-5">

                    <h3 className="mb-4 text-lg font-semibold">
                        Bulk Upload Summary
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-xl bg-neutral-100 p-4">

                            <p className="text-sm text-neutral-500">
                                Excel
                            </p>

                            <p className="mt-2 font-semibold">
                                {excelFile
                                    ? excelFile.name
                                    : "Not Selected"}
                            </p>

                        </div>

                        <div className="rounded-xl bg-neutral-100 p-4">

                            <p className="text-sm text-neutral-500">
                                Images
                            </p>

                            <p className="mt-2 font-semibold">
                                {imageFiles.length}
                            </p>

                        </div>

                        <div className="rounded-xl bg-neutral-100 p-4">

                            <p className="text-sm text-neutral-500">
                                Upload Status
                            </p>

                            <p className="mt-2 font-semibold">
                                {uploading
                                    ? "Uploading..."
                                    : "Idle"}
                            </p>

                        </div>

                        <div className="rounded-xl bg-neutral-100 p-4">

                            <p className="text-sm text-neutral-500">
                                Progress
                            </p>

                            <p className="mt-2 font-semibold">
                                {progress.current}/
                                {progress.total}
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}
