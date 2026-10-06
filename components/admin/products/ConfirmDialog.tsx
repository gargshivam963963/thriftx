"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";

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
 * ConfirmDialog — destructive confirm built on the ONE `Modal` system.
 *
 * Props are unchanged so existing callers (admin products) keep working;
 * backdrop motion, Escape handling, scroll-lock and focus management all
 * come from `Modal` instead of a second hand-rolled AnimatePresence block.
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
            onClose={onClose}
            title={title}
            description={message}
            footer={
                <div className="grid w-full grid-cols-2 gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={onConfirm} loading={loading}>
                        {confirmText}
                    </Button>
                </div>
            }
        >
            <div
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-bg"
            >
                <AlertTriangle size={20} className="text-error" />
            </div>
        </Modal>
    );
}

