"use client";

import { useRef, useState } from "react";
import { FolderOpen, Upload, CheckCircle2, AlertCircle, X, Image as ImageIcon } from "lucide-react";

interface FolderUploaderProps {
    files: File[];
    loading?: boolean;
    error?: string;
    onFolderSelect: (files: File[]) => void;
    onClear: () => void;
}

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

export default function FolderUploader({
    files,
    loading = false,
    error,
    onFolderSelect,
    onClear,
}: FolderUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    function handleFiles(list: FileList | null) {
        if (!list?.length) return;
        const images = Array.from(list).filter((f) =>
            IMAGE_EXTS.some((ext) => f.name.toLowerCase().endsWith(ext))
        );
        if (!images.length) {
            alert("No supported images found (.jpg, .jpeg, .png, .webp).");
            return;
        }
        onFolderSelect(images);
    }

    const folderCount = new Set(
        files.map((f) => f.webkitRelativePath.split("/")[0]).filter(Boolean)
    ).size;

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`group relative rounded-2xl border-2 border-dashed p-5 transition-all duration-200 ${dragOver
                    ? "border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-800/50"
                    : files.length
                        ? "border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/10"
                        : error
                            ? "border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-900/10"
                            : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
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

            {files.length > 0 ? (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                            <FolderOpen size={22} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {folderCount} SKU folder{folderCount !== 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{files.length} images found</p>
                        </div>
                        <CheckCircle2 size={20} className="shrink-0 text-blue-500" />
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onClear(); }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 rounded-lg bg-blue-100/70 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            <ImageIcon size={12} />
                            {files.length} images
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            <FolderOpen size={12} />
                            {folderCount} folders
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <Upload size={22} className="text-neutral-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Drag & drop your images folder
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                            or click to browse &middot; SKU-named subfolders
                        </p>
                    </div>
                    {error && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <AlertCircle size={12} />
                            {error}
                        </div>
                    )}
                </div>
            )}

            <button
                type="button"
                disabled={loading}
                onClick={() => inputRef.current?.click()}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Upload images folder"
            />
        </div>
    );
}

