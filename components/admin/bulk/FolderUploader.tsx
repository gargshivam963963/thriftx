"use client";

import { useRef, useState } from "react";
import { FolderOpen, Upload, CheckCircle2, AlertCircle, X, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
        <Card
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`relative border-2 border-dashed transition-all duration-200 ${dragOver
                ? "border-primary bg-accent/50"
                : files.length
                    ? "border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/10"
                    : error
                        ? "border-destructive/50 bg-destructive/5"
                        : "border-border hover:border-muted-foreground/40"
                }`}
        >
            <CardContent className="p-5">
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
                                <p className="text-sm font-semibold text-foreground">
                                    {folderCount} SKU folder{folderCount !== 1 ? "s" : ""}
                                </p>
                                <p className="text-xs text-muted-foreground">{files.length} images found</p>
                            </div>
                            <CheckCircle2 size={20} className="shrink-0 text-blue-500" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="iconSm"
                                onClick={(e) => { e.stopPropagation(); onClear(); }}
                            >
                                <X size={14} />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="info" className="gap-1.5 text-xs">
                                <ImageIcon size={12} />
                                {files.length} images
                            </Badge>
                            <Badge variant="secondary" className="gap-1.5 text-xs">
                                <FolderOpen size={12} />
                                {folderCount} folders
                            </Badge>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                            <Upload size={22} className="text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">
                                Drag & drop your images folder
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                or click to browse &middot; SKU-named subfolders
                            </p>
                        </div>
                        {error && (
                            <Badge variant="error" className="gap-1.5 text-xs">
                                <AlertCircle size={12} />
                                {error}
                            </Badge>
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
            </CardContent>
        </Card>
    );
}

