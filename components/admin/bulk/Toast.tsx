"use client";

import { toast as sonnerToast } from "sonner";

export interface ToastMessage {
    id: string;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message?: string;
    duration?: number;
}

/**
 * Thin wrapper over sonner toast to maintain backward compatibility
 * with existing showToast() calls across bulk upload components.
 */
export function showToast(toast: Omit<ToastMessage, "id">) {
    const { type, title, message, duration } = toast;

    switch (type) {
        case "success":
            sonnerToast.success(title, {
                description: message,
                duration: duration ?? 4000,
            });
            break;
        case "error":
            sonnerToast.error(title, {
                description: message,
                duration: duration ?? 4000,
            });
            break;
        case "info":
            sonnerToast.info(title, {
                description: message,
                duration: duration ?? 4000,
            });
            break;
        case "warning":
            sonnerToast.warning(title, {
                description: message,
                duration: duration ?? 4000,
            });
            break;
    }
}

/** No-op placeholder — sonner Toaster is already in root layout. */
export default function ToastContainer() {
    return null;
}

