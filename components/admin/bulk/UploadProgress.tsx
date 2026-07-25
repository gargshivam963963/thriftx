"use client";

import { motion } from "framer-motion";
import { LoaderCircle, CheckCircle2, XCircle } from "lucide-react";

export interface UploadProgressData {
    current: number;
    total: number;
    percentage: number;
    currentSku: string;
}

interface UploadProgressProps {
    progress: UploadProgressData | null;
    uploadResult: { success: number; failed: number } | null;
}

export default function UploadProgress({
    progress,
    uploadResult,
}: UploadProgressProps) {
    if (!progress && !uploadResult) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-neutral-200/70 bg-white p-5 dark:border-neutral-700/50 dark:bg-neutral-900"
        >
            {progress && !uploadResult ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <LoaderCircle size={16} className="animate-spin text-neutral-500" />
                            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Uploading...</span>
                        </div>
                        <span className="text-sm font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                            {progress.percentage}%
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="h-full rounded-full bg-neutral-900 dark:bg-neutral-100"
                        />
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {progress.current} of {progress.total} &middot; {progress.currentSku}
                    </p>
                </div>
            ) : uploadResult ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={16} />
                            {uploadResult.success} uploaded
                        </div>
                        {uploadResult.failed > 0 && (
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400">
                                <XCircle size={16} />
                                {uploadResult.failed} failed
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {uploadResult.success + uploadResult.failed} total
                    </p>
                </div>
            ) : null}
        </motion.div>
    );
}

