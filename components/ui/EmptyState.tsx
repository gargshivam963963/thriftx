"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    className?: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    className,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
                "flex flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white px-6 py-14 text-center",
                className
            )}
        >
            {icon && (
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                    {icon}
                </div>
            )}

            <h2 className="text-2xl font-semibold tracking-tight">
                {title}
            </h2>

            {description && (
                <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
                    {description}
                </p>
            )}

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