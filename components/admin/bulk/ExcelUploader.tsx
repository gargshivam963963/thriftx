"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, X } from "lucide-react";

interface ExcelUploaderProps {
    file: File | null;
    loading?: boolean;
    error?: string;
    onFileSelect: (file: File) => void;
    onClear: () => void;
}

const ALLOWED = [".xlsx", ".xls", ".csv"];

export default function ExcelUploader({
    file,
    loading = false,
    error,
    onFileSelect,
    onClear,
}: ExcelUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    function validateAndSelect(files: FileList | null) {
        if (!files?.length) return;
        const f = files[0];
        const ext = "." + f.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED.includes(ext)) {
            alert("Please select a valid Excel (.xlsx, .xls) or CSV file.");
            return;
        }
        onFileSelect(f);
    }

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); validateAndSelect(e.dataTransfer.files); }}
            className={`group relative rounded-2xl border-2 border-dashed p-5 transition-all duration-200 ${dragOver
                    ? "border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-800/50"
                    : file
                        ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/10"
                        : error
                            ? "border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-900/10"
                            : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
                }`}
        >
            <input
                ref={inputRef}
                hidden
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => validateAndSelect(e.target.files)}
            />

            {file ? (
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                        <FileSpreadsheet size={22} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">{file.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                    <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onClear(); }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <Upload size={22} className="text-neutral-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Drag & drop your Excel file
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                            or click to browse &middot; .xlsx, .xls, .csv
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
                aria-label="Upload Excel file"
            />
        </div>
    );
}

