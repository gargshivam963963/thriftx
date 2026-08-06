"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    loading?: boolean;
}

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
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 bottom-auto top-1/2 z-50 mx-auto max-w-md -translate-y-1/2"
                    >
                        <div className="rounded-2xl border border-border bg-white p-6 shadow-xl dark:border-border dark:bg-foreground">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                                    <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted dark:hover:bg-card"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">{title}</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{message}</p>
                            <div className="mt-6 flex items-center gap-3">
                                <Button variant="outline" onClick={onClose} fullWidth>
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={onConfirm}
                                    loading={loading}
                                    fullWidth
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

