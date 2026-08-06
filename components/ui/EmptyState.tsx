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
    children?: React.ReactNode;
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
    children,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
                "flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-card",
                className
            )}
        >
            {icon && (
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {icon}
                </div>
            )}

            <h2 className="text-heading-4 font-semibold tracking-tight text-foreground">
                {title}
            </h2>

            {description && (
                <p className="mt-3 max-w-md text-body text-muted-foreground">
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

            {children}
        </motion.div>
    );
}
