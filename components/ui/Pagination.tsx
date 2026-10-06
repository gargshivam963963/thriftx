"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import PageSizeSelect from "@/components/ui/PageSizeSelect";
import { cn } from "@/lib/utils";

interface PaginationProps {
    /** Current 1-based page. */
    page: number;
    /** Total number of pages (already clamped to >= 1). */
    totalPages: number;
    /** Total number of records across every page. */
    totalItems: number;
    /** Page size, used for the "showing x–y of z" summary. */
    pageSize: number;
    onPageChange: (page: number) => void;
    /** Noun used in the summary, e.g. `"product"` → "products". */
    itemNoun?: string;
    /** Hide the "showing x–y of z" line (useful in dense toolbars). */
    hideSummary?: boolean;
    /**
     * Page-size choices (e.g. `[20, 50, 100]`). When supplied together with
     * `onPageSizeChange`, a page-size selector is rendered inside the pager
     * row — page size is part of paging, so it lives here rather than in the
     * toolbar above the grid.
     */
    pageSizeOptions?: readonly number[];
    /** Called when the user picks a different page size. */
    onPageSizeChange?: (pageSize: number) => void;
    className?: string;
}

/** Builds a compact page list with ellipses: 1 … 4 5 6 … 20 */
function buildPageList(page: number, totalPages: number): (number | "gap")[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);

    const sorted = Array.from(pages)
        .filter((p) => p >= 1 && p <= totalPages)
        .sort((a, b) => a - b);

    const list: (number | "gap")[] = [];
    let previous = 0;

    for (const value of sorted) {
        if (previous && value - previous > 1) list.push("gap");
        list.push(value);
        previous = value;
    }

    return list;
}

/**
 * Pagination — the ONE pager for THRIFTX.
 *
 * Built entirely from design-system tokens (`text-label`, `text-muted-foreground`,
 * the shared control heights and the `Button` primitive) so admin tables and the
 * storefront shop grid read as the same system instead of two hand-rolled
 * "Load more" buttons.
 *
 * The caller owns navigation: pass an `onPageChange` that pushes the new page to
 * the router (storefront) or updates local state (admin).
 */
export function Pagination({
    page,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    itemNoun = "items",
    hideSummary = false,
    pageSizeOptions,
    onPageSizeChange,
    className,
}: PaginationProps) {
    const pages = useMemo(
        () => buildPageList(page, totalPages),
        [page, totalPages],
    );

    // Page size is configurable only when the caller opts in with both props.
    const showPageSize = Boolean(pageSizeOptions && onPageSizeChange);

    // Nothing to render when there's a single page and no page-size selector.
    if (totalPages <= 1 && !showPageSize) return null;

    const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalItems);

    return (
        <nav
            aria-label="Pagination"
            className={cn(
                "flex w-full flex-col items-center justify-between gap-4",
                "sm:flex-row sm:gap-6",
                className,
            )}
        >
            {!hideSummary && (
                <div className="order-2 flex flex-wrap items-center gap-x-4 gap-y-2 sm:order-1">
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        Showing{" "}
                        <span className="font-semibold text-foreground tabular-nums">
                            {from}–{to}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-foreground tabular-nums">
                            {totalItems}
                        </span>{" "}
                        {itemNoun}
                    </p>

                    {showPageSize && (
                        <PageSizeSelect
                            value={pageSize}
                            options={pageSizeOptions}
                            onChange={onPageSizeChange!}
                        />
                    )}
                </div>
            )}

            {totalPages > 1 && (
                <div
                    className={cn(
                        "order-1 flex items-center gap-1.5 sm:order-2",
                        !hideSummary && "sm:ml-auto",
                    )}
                >
                <Button
                    variant="outline"
                    size="sm"
                    rounded="lg"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    leftIcon={<ChevronLeft size={15} />}
                    aria-label="Previous page"
                >
                    <span className="hidden sm:inline">Prev</span>
                </Button>

                <div className="flex items-center gap-1">
                    {pages.map((entry, index) =>
                        entry === "gap" ? (
                            <span
                                key={`gap-${index}`}
                                aria-hidden="true"
                                className="inline-flex h-9 w-6 items-center justify-center text-label text-muted-foreground"
                            >
                                …
                            </span>
                        ) : (
                            <Button
                                key={entry}
                                variant={
                                    entry === page ? "primary" : "ghost"
                                }
                                size="sm"
                                rounded="lg"
                                onClick={() => onPageChange(entry)}
                                aria-label={`Page ${entry}`}
                                aria-current={
                                    entry === page ? "page" : undefined
                                }
                                className={cn(
                                    "min-w-9 tabular-nums",
                                    entry !== page &&
                                        "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {entry}
                            </Button>
                        ),
                    )}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    rounded="lg"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    rightIcon={<ChevronRight size={15} />}
                    aria-label="Next page"
                >
                    <span className="hidden sm:inline">Next</span>
                </Button>
            </div>
            )}

        </nav>
    );
}

export default Pagination;