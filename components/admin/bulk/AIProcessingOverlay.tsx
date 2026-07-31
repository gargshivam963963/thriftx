"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export interface AIStage {
    key: string;
    label: string;
    icon?: string;
}

const DEFAULT_STAGES: AIStage[] = [
    { key: "uploading", label: "Uploading Images..." },
    { key: "labels", label: "Reading Labels..." },
    { key: "brand", label: "Detecting Brand..." },
    { key: "size", label: "Reading Size Tags..." },
    { key: "tape", label: "Reading Measuring Tape..." },
    { key: "seo", label: "Generating SEO..." },
    { key: "create", label: "Creating Product..." },
];

interface AIProcessingOverlayProps {
    open: boolean;
    current?: number;
    total?: number;
    currentSku?: string;
    stage?: AIStage | null;
    stages?: AIStage[];
    onClose?: () => void;
}

export default function AIProcessingOverlay({
    open,
    current = 0,
    total = 0,
    currentSku = "",
    stage = null,
    stages = DEFAULT_STAGES,
    onClose,
}: AIProcessingOverlayProps) {
    const [activeStageIndex, setActiveStageIndex] = useState(0);

    const percentage = useMemo(() => {
        if (!total) return 0;
        return Math.min(100, Math.round((current / total) * 100));
    }, [current, total]);

    // Advance the stage visualization as progress grows
    useEffect(() => {
        if (!open) return;
        const idx = Math.min(
            stages.length - 1,
            Math.floor((percentage / 100) * stages.length),
        );
        setActiveStageIndex(idx);
    }, [percentage, stages.length, open]);

    // If an explicit stage is provided, use it
    const resolvedIndex = stage
        ? Math.max(
            0,
            stages.findIndex((s) => s.key === stage.key),
        )
        : activeStageIndex;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 z-[81] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2"
                    >
                        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
                            {/* Header */}
                            <div className="flex items-center gap-3 border-b border-neutral-100 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 px-6 py-5 text-white dark:border-neutral-800">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                                    <Sparkles size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold">
                                        AI is processing your products
                                    </h3>
                                    <p className="text-xs text-violet-100">
                                        {total > 0
                                            ? `Product ${current} of ${total}`
                                            : "Analyzing images..."}
                                        {currentSku && (
                                            <span className="ml-1 font-mono text-[10px] text-violet-200">
                                                · {currentSku}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5 p-6">
                                {/* Progress bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                            Progress
                                        </span>
                                        <span className="font-mono text-sm font-bold text-violet-600 dark:text-violet-400">
                                            {percentage}%
                                        </span>
                                    </div>
                                    <Progress value={percentage} className="h-2.5" />
                                </div>

                                {/* Stages list */}
                                <div className="space-y-2.5">
                                    {stages.map((s, i) => {
                                        const isDone = i < resolvedIndex;
                                        const isActive = i === resolvedIndex;
                                        return (
                                            <motion.div
                                                key={s.key}
                                                animate={{
                                                    opacity:
                                                        isDone || isActive ? 1 : 0.4,
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-xl px-3 py-2 transition-colors",
                                                    isActive &&
                                                    "bg-violet-50 dark:bg-violet-950/30",
                                                )}
                                            >
                                                {isDone ? (
                                                    <CheckCircle2
                                                        size={16}
                                                        className="shrink-0 text-emerald-500"
                                                    />
                                                ) : isActive ? (
                                                    <Loader2
                                                        size={16}
                                                        className="shrink-0 animate-spin text-violet-600 dark:text-violet-400"
                                                    />
                                                ) : (
                                                    <div className="h-4 w-4 shrink-0 rounded-full border-2 border-neutral-200 dark:border-neutral-700" />
                                                )}
                                                <span
                                                    className={cn(
                                                        "text-sm font-medium",
                                                        isDone
                                                            ? "text-neutral-500 line-through decoration-neutral-300 dark:text-neutral-400"
                                                            : isActive
                                                                ? "text-violet-700 dark:text-violet-300"
                                                                : "text-neutral-400 dark:text-neutral-500",
                                                    )}
                                                >
                                                    {s.label}
                                                </span>
                                                {isActive && (
                                                    <Badge
                                                        variant="info"
                                                        size="xs"
                                                        rounded="md"
                                                        className="ml-auto"
                                                    >
                                                        Processing
                                                    </Badge>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Bottom note */}
                                <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5 text-[11px] text-neutral-500 dark:bg-neutral-800/50 dark:text-neutral-400">
                                    <Sparkles size={13} className="shrink-0 text-violet-500" />
                                    You can keep editing products while AI runs.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

