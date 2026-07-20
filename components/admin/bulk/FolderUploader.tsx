"use client";

import { useRef } from "react";
import {
    FolderOpen,
    ImagePlus,
    CheckCircle2,
} from "lucide-react";

interface FolderUploaderProps {
    files: File[];
    loading?: boolean;
    onFolderSelect: (files: File[]) => void;
}

export default function FolderUploader({
    files,
    loading = false,
    onFolderSelect,
}: FolderUploaderProps) {
    const inputRef =
        useRef<HTMLInputElement>(null);

    function handleFiles(list: FileList | null) {
        if (!list?.length) return;

        Array.from(list).forEach((file) => {
            console.log({
                name: file.name,
                relativePath: file.webkitRelativePath,
            });
        });
        const allFiles = Array.from(list).filter((file) => {
            const name = file.name.toLowerCase();

            return (
                name.endsWith(".jpg") ||
                name.endsWith(".jpeg") ||
                name.endsWith(".png") ||
                name.endsWith(".webp")
            );
        });

        if (!allFiles.length) {
            alert("No supported images found.");
            return;
        }

        onFolderSelect(allFiles);
    }

    const folderCount = new Set(
        files
            .map(
                (file) =>
                    file.webkitRelativePath.split("/")[0]
            )
            .filter(Boolean)
    ).size;

    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

                <div className="rounded-xl bg-blue-100 p-3">
                    <FolderOpen
                        className="text-blue-700"
                        size={22}
                    />
                </div>

                <div className="flex-1">

                    <h2 className="text-lg font-semibold">
                        Upload Images Folder
                    </h2>

                    <p className="text-sm text-neutral-500">
                        Select the root folder containing SKU
                        folders
                    </p>

                </div>

                {files.length > 0 && (
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

                ${files.length
                        ? "border-blue-500 bg-blue-50"
                        : "border-neutral-300 hover:border-black hover:bg-neutral-50"
                    }`}
            >
                <ImagePlus
                    className="mb-3 text-neutral-400"
                    size={42}
                />

                <p className="font-semibold">
                    {files.length
                        ? `${folderCount} SKU Folder${folderCount > 1 ? "s" : ""
                        } Selected`
                        : "Select Images Folder"}
                </p>

                <p className="mt-2 text-sm text-neutral-500">
                    {files.length
                        ? `${files.length} Images Found`
                        : "Folder must contain SKU folders"}
                </p>

                <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                        inputRef.current?.click()
                    }
                    className="mt-6 rounded-xl bg-black px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                    {files.length
                        ? "Replace Folder"
                        : "Choose Folder"}
                </button>

                <input
                    ref={inputRef}
                    hidden
                    type="file"
                    multiple
                    webkitdirectory=""
                    directory=""
                    onChange={(e) => {
                        console.log("FOLDER INPUT");
                        console.log(e.target.files);

                        handleFiles(e.target.files);
                    }}
                />

            </label>

            {files.length > 0 && (
                <div className="mt-5 grid grid-cols-3 gap-4">

                    <div className="rounded-xl bg-neutral-100 p-4">
                        <p className="text-xs text-neutral-500">
                            SKU Folders
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {folderCount}
                        </p>
                    </div>

                    <div className="rounded-xl bg-neutral-100 p-4">
                        <p className="text-xs text-neutral-500">
                            Images
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {files.length}
                        </p>
                    </div>

                    <div className="rounded-xl bg-neutral-100 p-4">
                        <p className="text-xs text-neutral-500">
                            Status
                        </p>

                        <p className="mt-1 text-lg font-semibold text-emerald-600">
                            Ready
                        </p>
                    </div>

                </div>
            )}

        </div>
    );
}