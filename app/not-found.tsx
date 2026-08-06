"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
                <p className="text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    404
                </p>
                <h1 className="mt-3 font-sans text-heading-3 font-bold text-foreground">
                    Page not found
                </h1>
                <p className="mt-3 text-body-sm leading-6 text-muted-foreground">
                    The page you are looking for does not exist or may have moved.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link href="/">
                        <Button leftIcon={<Home size={16} />} className="w-full rounded-xl">
                            Go home
                        </Button>
                    </Link>
                    <Link href="/shop">
                        <Button variant="outline" leftIcon={<ArrowLeft size={16} />} className="w-full rounded-xl">
                            Continue shopping
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
