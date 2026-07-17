"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { modalAnimation } from "@/lib/motion";
import IconButton from "./IconButton";

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
};

export default function Modal({
    open,
    onOpenChange,
    title,
    description,
    children,
    size = "md",
}: ModalProps) {
    return (
        <AnimatePresence>
            {open && (
                <Dialog.Root open={open} onOpenChange={onOpenChange}>
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                            />
                        </Dialog.Overlay>

                        <Dialog.Content asChild>
                            <motion.div
                                variants={modalAnimation}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={`fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl ${sizes[size]}`}
                            >
                                <div className="flex items-start justify-between border-b p-6">
                                    <div>
                                        {title && (
                                            <Dialog.Title className="text-2xl font-semibold">
                                                {title}
                                            </Dialog.Title>
                                        )}

                                        {description && (
                                            <Dialog.Description className="mt-1 text-sm text-neutral-500">
                                                {description}
                                            </Dialog.Description>
                                        )}
                                    </div>

                                    <Dialog.Close asChild>
                                        <IconButton variant="ghost">
                                            <X className="h-5 w-5" />
                                        </IconButton>
                                    </Dialog.Close>
                                </div>

                                <div className="max-h-[75vh] overflow-y-auto p-6">
                                    {children}
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            )}
        </AnimatePresence>
    );
}