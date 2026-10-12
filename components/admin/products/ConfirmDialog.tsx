"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    loading?: boolean;
}

/**
 * ConfirmDialog — modern destructive confirm built on the ONE `Modal` system.
 *
 * Props are unchanged so existing callers (admin products) keep working;
 * backdrop motion, Escape handling, scroll-lock and focus management all
 * come from `Modal` instead of a second hand-rolled AnimatePresence block.
 *
 * Visual language (shared with `ConfirmPopover` so deletes feel identical
 * across the whole app): a glowing circular danger icon, a centred message
 * and a balanced two-up action footer with a real loading state.
 */
export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Delete",
    loading = false,
}: ConfirmDialogProps) {
    return (
        <Modal
            open={open}
            onClose={loading ? () => {} : onClose}
            title={title}
            className="max-w-md"
            footer={
                <div className="grid w-full grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        size="lg"
                        fullWidth
                        onClick={onConfirm}
                        loading={loading}
                        loadingText="Deleting…"
                    >
                        {confirmText}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col items-center gap-5 py-2 text-center">
                {/* Glowing circular danger icon — the visual anchor of the dialog. */}
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
                    {message}
                </p>
            </div>
        </Modal>
    );
}

