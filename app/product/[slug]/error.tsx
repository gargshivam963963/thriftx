"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Product detail error boundary — professional empty state with
 * a retry button. Prevents crashes / blank pages.
 */
export default function ProductDetailError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-[1280px] flex-col items-center justify-center px-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error-bg text-error">
                <AlertTriangle className="h-8 w-8" />
            </div>

            <h1 className="mt-6 text-heading-3 font-bold text-foreground">
                Something went wrong
            </h1>

            <p className="mt-3 max-w-md text-body text-muted-foreground">
                We couldn&apos;t load this product. This is usually temporary —
                please try again.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button variant="primary" size="lg" onClick={reset}>
                    Try Again
                </Button>
                <Button variant="outline" size="lg" onClick={() => (window.location.href = "/shop")}>
                    Browse Shop
                </Button>
            </div>
        </div>
    );
}
