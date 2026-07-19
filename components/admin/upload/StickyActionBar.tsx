"use client";

import { Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button/Button";

interface StickyActionBarProps {
    isGenerating: boolean;
    isSaving?: boolean;
    onGenerate: () => void;
    onSubmit: () => void;
}

export default function StickyActionBar({
    isGenerating,
    isSaving = false,
    onGenerate,
    onSubmit,
}: StickyActionBarProps) {
    return (
        <>
            {/* Desktop Footer */}

            <section className="hidden rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm lg:block">
                <div className="flex items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-2xl font-bold">
                            Ready to Publish?
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            leftIcon={<Sparkles size={18} />}
                            loading={isGenerating}
                            loadingText="Generating..."
                            onClick={onGenerate}
                        >
                            Generate AI
                        </Button>

                        <Button
                            type="button"
                            leftIcon={<Save size={18} />}
                            loading={isSaving}
                            loadingText="Saving..."
                            onClick={onSubmit}
                        >
                            Save Product
                        </Button>
                    </div>
                </div>
            </section>

            {/* Mobile Sticky Footer */}

            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur shadow-lg lg:hidden">
                <div className="mx-auto flex max-w-7xl gap-3 p-4">
                    <Button
                        type="button"
                        variant="outline"
                        fullWidth
                        leftIcon={<Sparkles size={18} />}
                        loading={isGenerating}
                        loadingText="Generating..."
                        onClick={onGenerate}
                    >
                        Generate AI
                    </Button>

                    <Button
                        type="button"
                        fullWidth
                        leftIcon={<Save size={18} />}
                        loading={isSaving}
                        loadingText="Saving..."
                        onClick={onSubmit}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </>
    );
}