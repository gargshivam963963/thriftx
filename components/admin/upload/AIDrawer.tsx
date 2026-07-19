"use client";

import { Sparkles, Wand2, CheckCircle2 } from "lucide-react";

import AIFieldSelector from "./AIFieldSelector";

interface AIDrawerProps {
    isGenerating: boolean;
    selectedAiFields: string[];
    setSelectedAiFields: React.Dispatch<
        React.SetStateAction<string[]>
    >;
    onGenerate: () => void;
}

const FEATURES = [
    "Brand Detection",
    "Product Description",
    "Category Prediction",
    "Material & Color",
];

export default function AIDrawer({
    isGenerating,
    selectedAiFields,
    setSelectedAiFields,
    onGenerate,
}: AIDrawerProps) {
    return (
        <aside className="sticky top-6 space-y-6 self-start">
            <div className="overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-xl">
                <div className="p-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                            <Sparkles size={28} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold">
                                AI Assistant
                            </h2>

                            <p className="text-sm text-violet-100">
                                Generate product details instantly.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        {FEATURES.map((feature) => (
                            <div
                                key={feature}
                                className="flex items-center gap-3"
                            >
                                <CheckCircle2 size={18} />

                                <span className="text-sm">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <>
                            {isGenerating ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                            ) : (
                                <Wand2 size={20} />
                            )}

                            {isGenerating
                                ? "Generating..."
                                : "Generate With AI"}
                        </>
                    </button>
                </div>
            </div>

            <AIFieldSelector
                selectedAiFields={selectedAiFields}
                setSelectedAiFields={setSelectedAiFields}
            />
        </aside>
    );
}