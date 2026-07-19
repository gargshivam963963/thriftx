"use client";

import { Sparkles, Package2, ImageIcon } from "lucide-react";

interface DashboardHeaderProps {
    totalImages: number;
    isGenerating: boolean;
    onGenerate: () => void;
}

export default function DashboardHeader({
    totalImages,
    isGenerating,
    onGenerate,
}: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-30 mb-8 rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur-xl shadow-sm">
            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border bg-neutral-50 px-3 py-1 text-xs font-semibold tracking-wide text-neutral-600">
                        THRIFTX ADMIN
                    </div>

                    <h1 className="mt-4 text-4xl font-bold tracking-tight">
                        Upload Product
                    </h1>

                    <p className="mt-2 max-w-xl text-neutral-500">
                        Upload thrift products, generate AI details, manage pricing,
                        measurements and publish instantly.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 rounded-xl border bg-neutral-50 px-4 py-2">
                            <Package2 className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Ready to Publish
                            </span>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border bg-neutral-50 px-4 py-2">
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {totalImages} Images
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="group flex h-14 items-center justify-center gap-3 rounded-2xl bg-black px-8 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-neutral-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Sparkles
                        className={`h-5 w-5 ${isGenerating ? "animate-spin" : ""
                            }`}
                    />

                    {isGenerating
                        ? "Generating..."
                        : "AI Fill Details"}
                </button>
            </div>
        </header>
    );
}