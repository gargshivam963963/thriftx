"use client";

import {
    CloudUpload,
    Download,
    RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface BulkHeaderProps {
    uploading?: boolean;

    uploadDisabled?: boolean;

    onUpload?: () => void;

    onClear?: () => void;

    onDownloadTemplate?: () => void;
}

export default function BulkHeader({
    uploading = false,
    uploadDisabled = false,
    onUpload,
    onClear,
    onDownloadTemplate,
}: BulkHeaderProps) {
    return (
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                {/* Left */}

                <div className="space-y-2">

                    <span className="inline-flex w-fit items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">

                        Admin Panel

                    </span>

                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">

                        Bulk Product Upload

                    </h1>

                    <p className="max-w-2xl text-sm leading-6 text-neutral-500">

                        Upload hundreds of products in minutes using an Excel
                        sheet and a folder of product images. Products are
                        automatically validated before upload.

                    </p>

                </div>

                {/* Right */}

                <div className="flex flex-wrap items-center gap-3">

                    <Button
                        variant="outline"
                        leftIcon={<Download size={18} />}
                        onClick={onDownloadTemplate}
                    >
                        Download Template
                    </Button>

                    <Button
                        variant="outline"
                        leftIcon={<RotateCcw size={18} />}
                        onClick={onClear}
                    >
                        Clear All
                    </Button>

                    <Button
                        variant="primary"
                        leftIcon={<CloudUpload size={18} />}
                        loading={uploading}
                        loadingText="Uploading..."
                        disabled={uploadDisabled}
                        onClick={onUpload}
                    >
                        Upload All
                    </Button>

                </div>
            </div>
        </section>
    );
}