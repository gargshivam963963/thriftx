"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";

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
            description={description}
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
            <div
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-error-bg"
            >
                <AlertTriangle className="text-error" />
            </div>
        </Modal>
    );
}
