"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import {
    modalBackdropVariants,
    modalPanelVariants,
} from "@/components/animations/Motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ModalProps {
    /** Controlled visibility. */
    open: boolean;
    /** Called on Escape, backdrop click and the close button. */
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    /** Sticky footer area (actions). */
    footer?: React.ReactNode;
    /** Optional class applied to the panel, e.g. to widen it. */
    className?: string;
    /** When false, Escape / backdrop clicks are ignored (e.g. mid-save). */
    dismissible?: boolean;
}

/**
 * Modal — the project's dialog primitive.
 *
 * Built on Framer Motion (`AnimatePresence`) because that is the animation
 * library already used across THRIFTX (see `ConfirmPopover` and the admin
 * `ConfirmDialog`), and it ships the accessibility behaviour a dialog needs:
 * Escape to dismiss, scroll lock, focus moved into the panel on open, and
 * `aria-modal` / `aria-labelledby` wiring.
 */
export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    className,
    dismissible = true,
}: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    // Escape to close.
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && dismissible) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () =>
            document.removeEventListener("keydown", handleKeyDown);
    }, [open, dismissible, onClose]);

    // Prevent background scroll while open.
    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    // Move focus into the dialog when it opens.
    useEffect(() => {
        if (open) {
            panelRef.current?.focus();
        }
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    variants={modalBackdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(event) => {
                        if (dismissible && event.target === event.currentTarget) {
                            onClose();
                        }
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                >
                    <motion.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={
                            description ? descriptionId : undefined
                        }
                        tabIndex={-1}
                        variants={modalPanelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(
                            // `max-h` + internal body scrolling guarantees the
                            // panel never exceeds the viewport (the backdrop
                            // padding is p-4 = 2rem total), no matter how much
                            // content the dialog holds.
                            "glass-liquid-strong flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl outline-none",
                            className,
                        )}
                    >
                        {/* Header */}
                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
                            <div className="min-w-0">
                                <h2
                                    id={titleId}
                                    className="text-heading-4 font-bold tracking-tight text-foreground"
                                >
                                    {title}
                                </h2>

                                {description && (
                                    <p
                                        id={descriptionId}
                                        className="mt-0.5 text-body-sm text-muted-foreground"
                                    >
                                        {description}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="iconSm"
                                onClick={onClose}
                                disabled={!dismissible}
                                aria-label="Close dialog"
                                className="-mr-1 -mt-1 shrink-0"
                            >
                                <X size={16} />
                            </Button>
                        </div>

                        {/* Body — scrolls internally when the panel hits max height */}
                        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

                        {/* Footer */}
                        {footer && (
                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3.5">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Modal;
