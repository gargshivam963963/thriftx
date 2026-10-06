import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AdminPageProps {
    children: ReactNode;
    /** Extra classes merged onto the wrapper. */
    className?: string;
    /**
     * Content width. `default` is the admin standard; `wide` is for dense data
     * grids (products, dashboards) that benefit from the extra columns.
     */
    width?: "default" | "wide";
}

const WIDTH = {
    default: "max-w-[1280px]",
    wide: "max-w-[1600px]",
} as const;

/**
 * AdminPage — the ONE page wrapper for the admin panel.
 *
 * `AdminShell` already owns the responsive gutter (`p-4 sm:p-6 lg:p-8`), so
 * pages must NOT add their own horizontal/vertical padding on top of it — that
 * double padding is what made Products sit further in than Orders. This wrapper
 * therefore only handles width, centring and the vertical rhythm between blocks.
 */
export function AdminPage({
    children,
    className,
    width = "default",
}: AdminPageProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full space-y-6",
                WIDTH[width],
                className,
            )}
        >
            {children}
        </div>
    );
}

export default AdminPage;