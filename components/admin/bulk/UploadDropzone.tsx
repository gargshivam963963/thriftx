"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    Images,
    FolderOpen,
    UploadCloud,
    CheckCircle2,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UploadDropzoneProps {
    onFilesSelected: (files: File[]) => void;
    onFolderSelected: (files: File[]) => void;
    compact?: boolean;
}

const SUPPORTED = [
    "Multiple Products",
    "Drag & Drop",
    "Folder Upload",
    "100+ Images",
];

export default function UploadDropzone({
    onFilesSelected,
    onFolderSelected,
    compact = false,
}: UploadDropzoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [folderDragOver, setFolderDragOver] = useState(false);

    function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (files.length) onFilesSelected(files);
        e.target.value = "";
    }

    function handleFolderPick(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (files.length) onFolderSelected(files);
        e.target.value = "";
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length) onFilesSelected(files);
    }

    if (compact) {
        return (
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                    "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all",
                    dragOver
                        ? "border-violet-400 bg-violet-50/60 dark:border-violet-500 dark:bg-violet-950/20"
                        : "border-neutral-300 bg-neutral-50/60 hover:border-neutral-400 hover:bg-neutral-100/60 dark:border-neutral-700 dark:bg-neutral-900/50 dark:hover:border-neutral-600",
                )}
            >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20">
                    <UploadCloud size={26} />
                </div>
                <div>
                    <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                        Drop Product Images Here
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Drag &amp; drop images or an entire folder of products
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        leftIcon={<Images size={14} />}
                    >
                        Browse Images
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => folderInputRef.current?.click()}
                        leftIcon={<FolderOpen size={14} />}
                    >
                        Browse Folder
                    </Button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {SUPPORTED.map((item) => (
                        <Badge key={item} variant="secondary" size="xs" rounded="md" className="gap-1">
                            <CheckCircle2 size={9} className="text-emerald-500" />
                            {item}
                        </Badge>
                    ))}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFilePick}
                />
                <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    // @ts-expect-error webkitdirectory is valid in modern browsers
                    webkitdirectory=""
                    directory=""
                    className="hidden"
                    onChange={handleFolderPick}
                />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                    "relative flex flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed px-6 py-16 text-center transition-all duration-300 sm:py-20",
                    dragOver
                        ? "border-violet-400 bg-violet-50/80 dark:border-violet-500 dark:bg-violet-950/20"
                        : "border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600",
                )}
            >
                {/* Animated icon */}
                <motion.div
                    animate={
                        dragOver
                            ? { scale: 1.08, y: -4 }
                            : { scale: 1, y: 0 }
                    }
                    transition={{ type: "spring", damping: 12 }}
                    className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-2xl shadow-violet-600/30"
                >
                    <UploadCloud size={38} />
                </motion.div>

                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Drop Product Images Here
                    </h3>
                    <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                        Drag &amp; drop images or an entire folder &mdash; AI will
                        automatically detect and organize products.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                        type="button"
                        size="sm"
                        className="h-10 px-5"
                        onClick={() => fileInputRef.current?.click()}
                        leftIcon={<Images size={15} />}
                    >
                        Browse Images
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 px-5"
                        onClick={() => folderInputRef.current?.click()}
                        leftIcon={<FolderOpen size={15} />}
                    >
                        Browse Folder
                    </Button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                    {SUPPORTED.map((item) => (
                        <Badge key={item} variant="secondary" size="sm" rounded="full" className="gap-1">
                            <CheckCircle2 size={11} className="text-emerald-500" />
                            {item}
                        </Badge>
                    ))}
                </div>

                {/* Clear button when dragging */}
                {dragOver && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDragOver(false);
                        }}
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-neutral-400 transition hover:bg-white hover:text-neutral-600"
                    >
                        <X size={14} />
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFilePick}
                />
                <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    // @ts-expect-error webkitdirectory is valid in modern browsers
                    webkitdirectory=""
                    directory=""
                    className="hidden"
                    onChange={handleFolderPick}
                />
            </div>
        </motion.div>
    );
}

