"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProductError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to console in dev only
        if (process.env.NODE_ENV === "development") {
            console.error(error);
        }
    }, [error]);

    return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-[1280px] flex-col items-center justify-center px-4 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-bg">
                <AlertTriangle className="h-8 w-8 text-error" />
            </div>
            <h1 className="text-heading-2 font-bold text-foreground">
                Something went wrong
            </h1>
            <p className="mt-2 max-w-md text-body text-muted-foreground">
                We couldn&apos;t load this product. Please try again or browse
                the rest of the collection.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={reset}
                    leftIcon={<RefreshCcw />}
                >
                    Try Again
                </Button>
                <Link href="/shop">
                    <Button variant="outline" size="lg" leftIcon={<Home />}>
                        Browse Shop
                    </Button>
                </Link>
            </div>
        </div>
    );
}
