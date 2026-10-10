"use client";

import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 24, stiffness: 260 }}
                className="pointer-events-auto w-full max-w-md"
            >
                <Card className="shadow-lg">
                    <CardContent className="p-4">
                    {progress && !uploadResult ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                                    <span className="text-sm font-semibold text-foreground">Uploading...</span>
                                </div>
                                <Badge variant="secondary" className="font-mono tabular-nums">
                                    {progress.percentage}%
                                </Badge>
                            </div>
                            <Progress value={progress.percentage} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                {progress.current} of {progress.total} &middot;{" "}
                                <span className="font-mono">{progress.currentSku}</span>
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
                            <Badge variant="outline" className="text-xs">
                                {uploadResult.success + uploadResult.failed} total
                            </Badge>
                        </div>
                    ) : null}
                </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
