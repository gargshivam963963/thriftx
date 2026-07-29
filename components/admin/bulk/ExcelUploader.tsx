"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
        <Card
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); validateAndSelect(e.dataTransfer.files); }}
            className={`relative border-2 border-dashed transition-all duration-200 ${dragOver
                ? "border-primary bg-accent/50"
                : file
                    ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/10"
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
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => validateAndSelect(e.target.files)}
                />

                {file ? (
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                            <FileSpreadsheet size={22} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
                        <Button
                            type="button"
                            variant="ghost"
                            size="iconSm"
                            onClick={(e) => { e.stopPropagation(); onClear(); }}
                        >
                            <X size={14} />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                            <Upload size={22} className="text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">
                                Drag & drop your Excel file
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                or click to browse &middot; .xlsx, .xls, .csv
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
                    aria-label="Upload Excel file"
                />
            </CardContent>
        </Card>
    );
}

