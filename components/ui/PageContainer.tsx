import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
    children: ReactNode;
    /** Additional classes merged onto the container. */
    className?: string;
    /**
     * Max-width variant.
     * - `"default"` → 1280px (standard content width across all pages)
     * - `"wide"`   → 1440px (used sparingly for dense marketing grid sections)
     * - `"narrow"` → 960px  (constrained reading/forms width)
     */
    maxWidth?: "default" | "wide" | "narrow";
    /** Vertical padding shorthand (mobile-first). Default `py-8`. */
    padded?: boolean;
}

const MAX_WIDTH: Record<NonNullable<PageContainerProps["maxWidth"]>, string> = {
    default: "max-w-[1280px]",
    wide: "max-w-[1440px]",
    narrow: "max-w-[960px]",
};

/**
 * PageContainer — the ONE consistent content wrapper for every page.
 *
 * Uses a shared max-width (1280px by default), fluid horizontal padding
 * (mobile-first) and optional vertical padding so all pages align perfectly.
 *
 * Usage:
 *   <PageContainer>
 *     ...page content...
 *   </PageContainer>
 *
 *   <PageContainer maxWidth="narrow" padded={false}>
 *     ...constrained form...
 *   </PageContainer>
 */
export function PageContainer({
    children,
    className,
    maxWidth = "default",
    padded = true,
}: PageContainerProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full",
                MAX_WIDTH[maxWidth],
                "px-4 sm:px-6 lg:px-8",
                padded && "py-8",
                className,
            )}
        >
            {children}
        </div>
    );
}

