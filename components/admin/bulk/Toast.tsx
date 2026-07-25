"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from "lucide-react";

export interface ToastMessage {
    id: string;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message?: string;
    duration?: number;
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export function showToast(toast: Omit<ToastMessage, "id">) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry: ToastMessage = { ...toast, id };
    toastListeners.forEach((fn) => fn(entry));
}

const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const colors = {
    success:
        "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    error:
        "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
    warning:
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((toast: ToastMessage) => {
        setToasts((prev) => [...prev, toast]);
    }, []);

    useEffect(() => {
        toastListeners.push(addToast);
        return () => {
            toastListeners = toastListeners.filter((fn) => fn !== addToast);
        };
    }, [addToast]);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    useEffect(() => {
        if (toasts.length === 0) return;
        const timers = toasts.map((toast) =>
            setTimeout(
                () => removeToast(toast.id),
                toast.duration ?? 4000
            )
        );
        return () => timers.forEach(clearTimeout);
    }, [toasts]);

    return (
        <div className="fixed inset-x-0 bottom-6 z-[100] mx-auto flex max-w-md flex-col gap-2 px-4 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => {
                    const Icon = icons[toast.type];
                    return (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: 24, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.95 }}
                            transition={{ type: "spring", damping: 24, stiffness: 300 }}
                            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-lg backdrop-blur-xl ${colors[toast.type]}`}
                        >
                            <Icon size={20} className="mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{toast.title}</p>
                                {toast.message && (
                                    <p className="mt-0.5 text-xs opacity-80">{toast.message}</p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 rounded-lg p-1 opacity-60 transition hover:opacity-100"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

