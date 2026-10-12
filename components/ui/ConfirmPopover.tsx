"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface ConfirmPopoverProps {
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

/**
 * ConfirmPopover — inline confirm built on the ONE `Modal` system.
 *
 * Props are unchanged so existing callers (cart, address book) keep working;
 * backdrop motion, Escape handling, scroll-lock and focus management all
 * come from `Modal` instead of a third hand-rolled AnimatePresence block.
 *
 * Visual language matches `ConfirmDialog` (admin deletes) so every
 * destructive action across the app feels identical.
 */
export default function ConfirmPopover({
    open,
    title,
    description,
    confirmText = "Remove",
    cancelText = "Cancel",
    onCancel,
    onConfirm,
}: ConfirmPopoverProps) {
    return (
        <Modal
            open={open}
            onClose={onCancel}
            title={title}
            className="max-w-md"
            footer={
                <div className="grid w-full grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        rounded="full"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </Button>

                    <Button
                        variant="danger"
                        size="lg"
                        fullWidth
                        rounded="full"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col items-center gap-5 py-2 text-center">
                {/* Glowing circular danger icon — shared anchor with ConfirmDialog. */}
                <div className="relative flex items-center justify-center">
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-error/20 blur-xl"
                    />
                    <span
                        aria-hidden="true"
                        className={cn(
                            "relative flex h-16 w-16 items-center justify-center rounded-full",
                            "bg-error-bg ring-1 ring-error/20",
                        )}
                    >
                        <AlertTriangle size={28} className="text-error" />
                    </span>
                </div>

                <p className="max-w-sm text-body-sm text-muted-foreground">
                    {description}
                </p>
            </div>
        </Modal>
    );
}

