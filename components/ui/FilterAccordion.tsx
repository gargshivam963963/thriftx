"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FilterAccordionProps {
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
 *
 * The header is a PLAIN <button> (NOT the Button wrapper) so that the three
 * layout regions — leading icon, title, and trailing icon — are direct flex
 * children and can never be collapsed into a single truncating span.
 *
 * Flex rules that guarantee the title NEVER disappears:
 *   - leading icon  : `shrink-0` (cannot shrink)
 *   - title         : `flex-1 min-w-0 truncate` (fills space, truncates safely)
 *   - badge/action  : `shrink-0`
 *   - chevron       : `shrink-0`
 *
 * Height: 44px desktop / 40px mobile. Same radius, padding, focus ring, and
 * theme tokens as every other control in the system.
 */
export default function FilterAccordion({
    icon,
    title,
    defaultOpen = false,
    children,
    badge,
    action,
    className,
}: FilterAccordionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-200",
                className,
            )}
        >
            <Button
                type="button"
                variant="ghost"
                size="sm"
                rounded="none"
                onClick={() => setOpen((p) => !p)}
                aria-expanded={open}
                className={cn(
                    "group flex w-full items-center justify-start gap-3 px-4 text-left",
                    "min-h-10 md:min-h-11",
                    "transition-colors duration-200 hover:bg-muted/60 dark:hover:bg-muted/40",
                )}
            >
                {/* Leading icon — never shrinks */}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                    <span className="[&_svg]:h-4 [&_svg]:w-4">{icon}</span>
                </span>

                {/* Title — flex-1 min-w-0 so it fills space without disappearing */}
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                    {title}
                </span>

                {/* Badge — shrink-0 */}
                {badge !== undefined && badge > 0 && (
                    <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-foreground px-1.5 text-badge font-bold text-background">
                        {badge}
                    </span>
                )}

                {/* Trailing group — action + chevron, shrink-0 */}
                <span className="flex shrink-0 items-center gap-1.5">
                    {action}
                    <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex h-4 w-4 items-center justify-center text-muted-foreground"
                    >
                        <ChevronDown size={16} className="h-4 w-4" />
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
