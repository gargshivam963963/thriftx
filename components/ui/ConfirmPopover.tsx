'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ConfirmPopoverProps {
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function ConfirmPopover({
    open,
    title,
    description,
    confirmText = 'Remove',
    cancelText = 'Cancel',
    onCancel,
    onConfirm,
}: ConfirmPopoverProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.96,
                            y: 12,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.96,
                            y: 12,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        className="fixed left-1/2 top-1/2 z-[60] w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-neutral-200 bg-white p-7 shadow-2xl"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                            <AlertTriangle className="text-red-600" />
                        </div>

                        <h3 className="mt-5 text-2xl font-semibold">
                            {title}
                        </h3>

                        <p className="mt-3 leading-7 text-neutral-500">
                            {description}
                        </p>

                        <div className="mt-8 flex gap-3">
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
