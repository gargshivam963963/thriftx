"use client";

import { Search, Plus, Upload, Sparkles, Package, AlertTriangle, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StickyToolbarProps {
    total: number;
    ready: number;
    uploading: number;
    errors: number;
    images: number;
    search: string;
    onSearchChange: (v: string) => void;
    onAddRow: () => void;
    onAiFillAll: () => void;
    onUpload: () => void;
    uploadingActive: boolean;
    bulkAiLoading: boolean;
}

export default function StickyToolbar({
    total,
    ready,
    uploading,
    errors,
    images,
    search,
    onSearchChange,
    onAddRow,
    onAiFillAll,
    onUpload,
    uploadingActive,
    bulkAiLoading,
}: StickyToolbarProps) {
    const stats = [
        {
            key: "products",
            label: "Products",
            value: total,
            icon: Package,
            className: "text-blue-600 dark:text-blue-400",
        },
        {
            key: "ready",
            label: "Ready",
            value: ready,
            icon: Sparkles,
            className: "text-emerald-600 dark:text-emerald-400",
        },
        {
            key: "uploading",
            label: "Uploading",
            value: uploading,
            icon: Loader2,
            className: "text-violet-600 dark:text-violet-400",
        },
        {
            key: "errors",
            label: "Errors",
            value: errors,
            icon: AlertTriangle,
            className: "text-red-600 dark:text-red-400",
        },
        {
            key: "images",
            label: "Images",
            value: images,
            icon: ImageIcon,
            className: "text-amber-600 dark:text-amber-400",
        },
    ];

    return (
        <div className="sticky top-0 z-40 -mx-4 -mt-4 border-b border-neutral-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/95 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex flex-col gap-3">
                {/* Row 1: Title + Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20">
                            <Package size={15} />
                        </div>
                        <div>
                            <h1 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Bulk Upload
                            </h1>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                AI-first bulk product uploads
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onAiFillAll}
                            disabled={total === 0 || bulkAiLoading}
                            leftIcon={
                                bulkAiLoading ? (
                                    <Loader2 size={13} className="animate-spin" />
                                ) : (
                                    <Sparkles size={13} />
                                )
                            }
                        >
                            {bulkAiLoading ? "AI Filling..." : "AI Fill All"}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={onAddRow}
                            leftIcon={<Plus size={14} />}
                        >
                            Add Product
                        </Button>
                        <Button
                            type="button"
                            variant="success"
                            size="sm"
                            onClick={onUpload}
                            disabled={ready === 0 || uploadingActive}
                            loading={uploadingActive}
                            loadingText="Uploading..."
                            leftIcon={<Upload size={14} />}
                        >
                            Upload All ({ready})
                        </Button>
                    </div>
                </div>

                {/* Row 2: Stats + Search */}
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {stats.map((s) => {
                            const Icon = s.icon;
                            return (
                                <div
                                    key={s.key}
                                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    <Icon
                                        size={12}
                                        className={cn(
                                            s.className,
                                            s.key === "uploading" && s.value === 0
                                                ? "opacity-40"
                                                : "",
                                        )}
                                    />
                                    <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                        {s.label}
                                    </span>
                                    <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                        {s.value}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Search */}
                    <div className="relative w-full lg:w-64">
                        <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                        />
                        <Input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search products..."
                            className="h-8 rounded-lg pl-8 text-xs"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

