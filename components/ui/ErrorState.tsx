"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";

interface ErrorStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    icon?: React.ReactNode;
    className?: string;
}

export default function ErrorState({
    title = "Something went wrong",
    description = "An unexpected error occurred. Please try again.",
    actionLabel = "Try Again",
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    icon,
    className,
}: ErrorStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
                "flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 px-6 py-14 text-center",
                className
            )}
        >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                {icon ?? <AlertTriangle className="h-8 w-8" />}
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                {title}
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-neutral-600">
                {description}
            </p>

            {(actionLabel || secondaryActionLabel) && (
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {actionLabel && (
                        <Button onClick={onAction}>
                            {actionLabel}
                        </Button>
                    )}

                    {secondaryActionLabel && (
                        <Button
                            variant="outline"
                            onClick={onSecondaryAction}
                        >
                            {secondaryActionLabel}
                        </Button>
                    )}
                </div>
            )}
        </motion.div>
    );
}