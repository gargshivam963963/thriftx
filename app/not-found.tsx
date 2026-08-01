"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                    404
                </p>
                <h1 className="mt-3 font-sans text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Page not found
                </h1>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
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
