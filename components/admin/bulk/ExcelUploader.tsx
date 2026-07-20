"use client";

import { useRef } from "react";
import { FileSpreadsheet, Upload, CheckCircle2 } from "lucide-react";

interface ExcelUploaderProps {
    file: File | null;
    loading?: boolean;
    onFileSelect: (file: File) => void;
}

export default function ExcelUploader({
    file,
    loading = false,
    onFileSelect,
}: ExcelUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    function handleFiles(files: FileList | null) {
        if (!files?.length) return;

        const excel = files[0];

        const valid =
            excel.name.endsWith(".xlsx") ||
            excel.name.endsWith(".xls");

        if (!valid) {
            alert("Please select a valid Excel file.");
            return;
        }

        onFileSelect(excel);
    }

    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

                <div className="rounded-xl bg-green-100 p-3">
                    <FileSpreadsheet
                        className="text-green-700"
                        size={22}
                    />
                </div>

                <div className="flex-1">

                    <h2 className="text-lg font-semibold">
                        Upload Excel
                    </h2>

                    <p className="text-sm text-neutral-500">
                        Import products.xlsx
                    </p>

                </div>

                {file && (
                    <CheckCircle2
                        className="text-emerald-600"
                        size={22}
                    />
                )}

            </div>

            <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                }}
                className={`flex h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition

                ${file
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-neutral-300 hover:border-black hover:bg-neutral-50"
                    }`}
            >
                <Upload
                    className="mb-3 text-neutral-400"
                    size={42}
                />

                <p className="font-semibold">
                    {file
                        ? file.name
                        : "Drag & Drop Excel"}
                </p>

                <p className="mt-2 text-sm text-neutral-500">
                    {file
                        ? `${(
                            file.size /
                            1024 /
                            1024
                        ).toFixed(2)} MB`
                        : "or click to browse"}
                </p>

                <button
                    type="button"
                    disabled={loading}
                    onClick={() => inputRef.current?.click()}
                    className="mt-6 rounded-xl bg-black px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                    {file ? "Replace Excel" : "Choose File"}
                </button>

                <input
                    ref={inputRef}
                    hidden
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                        console.log("INPUT CHANGED");
                        console.log(e.target.files);

                        handleFiles(e.target.files);
                    }}
                />
            </label>
        </div>
    );
}