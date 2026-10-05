"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
    /** Page title — always rendered as the single `<h1>`. */
    title: ReactNode;
    /** Sub-heading / supporting copy rendered as a `<p>`. */
    description?: ReactNode;
    /** Small uppercase kicker above the title (`.text-caption`). */
    eyebrow?: ReactNode;
    /** Optional icon or badge sitting beside the title. */
    icon?: ReactNode;
    /** Right-aligned actions (buttons, filters, toggles). */
    actions?: ReactNode;
    /** Extra content rendered under the header block (filters, tabs…). */
    children?: ReactNode;
    className?: string;
}

/**
 * PageHeader — the ONE page-title block for THRIFTX.
 *
 * Enforces the type hierarchy everywhere:
 *   h1 `text-h2` → sub-heading `text-subtitle` → body `text-body`.
 *
 * Every admin / storefront page routes its title through this component so
 * spacing, fluid sizing and light-dark colours can never drift apart again.
 */
export function PageHeader({
    title,
    description,
    eyebrow,
    icon,
    actions,
    children,
    className,
}: PageHeaderProps) {
    return (
        <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
                "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
                className,
            )}
        >
            <div className="min-w-0">
                {eyebrow && (
                    <p className="text-caption text-muted-foreground">{eyebrow}</p>
                )}

                <div className="flex items-center gap-2.5">
                    <h1 className="text-h2 font-bold tracking-tight text-foreground">
                        {title}
                    </h1>
                    {icon && (
                        <span
                            aria-hidden="true"
                            className="inline-flex shrink-0 items-center text-muted-foreground [&_svg]:h-5 [&_svg]:w-5"
                        >
                            {icon}
                        </span>
                    )}
                </div>

                {description && (
                    <p className="mt-1.5 text-subtitle text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    {actions}
                </div>
            )}

            {children}
        </motion.header>
    );
}

export default PageHeader;