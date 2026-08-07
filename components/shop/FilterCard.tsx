"use client";


import { Button } from '@/components/ui/button';import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterCardProps {
    icon: ReactNode;
    title: string;
    defaultOpen?: boolean;
    children: ReactNode;
    /** Optional count badge shown in the header (e.g. active selections). */
    badge?: number;
    /** Optional right-side action (e.g. "Clear"). */
    action?: ReactNode;
    className?: string;
}

/**
 * Reusable filter accordion card used across the shop sidebar & drawer.
 * Animated expand/collapse (height + opacity), consistent typography.
 */
export default function FilterCard({
    icon,
    title,
    defaultOpen = false,
    children,
    badge,
    action,
    className,
}: FilterCardProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-colors",
                className,
            )}
        >
            <Button
                type="button"
                onClick={() => setOpen((p) => !p)}
                aria-expanded={open}
                className="group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/60"
            >
                <span className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
                        {icon}
                    </span>
                    <span className="text-label font-semibold text-foreground">
                        {title}
                    </span>
                    {badge !== undefined && badge > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-foreground px-1.5 text-badge font-bold text-background">
                            {badge}
                        </span>
                    )}
                </span>
                <span className="flex items-center gap-1.5">
                    {action}
                    <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-muted-foreground"
                    >
                        <ChevronDown size={15} />
                    </motion.span>
                </span>
            </Button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border/70 px-4 pb-4 pt-3">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
