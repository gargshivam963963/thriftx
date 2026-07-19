"use client";

import { FileText } from "lucide-react";

interface DescriptionSectionProps {
    form: Record<string, string>;
    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
}

export default function DescriptionSection({
    form,
    handleChange,
}: DescriptionSectionProps) {
    const descriptionLength = form.description?.length || 0;
    const shippingLength = form.shipping?.length || 0;

    return (
        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">

            <div className="mb-8 flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">

                    <FileText
                        size={24}
                        className="text-violet-600"
                    />

                </div>

                <div>

                    <h2 className="text-2xl font-bold tracking-tight">
                        Description
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                        A good description increases trust and improves conversions.
                    </p>

                </div>

            </div>

            <div className="space-y-8">

                <div>

                    <div className="mb-2 flex items-center justify-between">

                        <label
                            htmlFor="description"
                            className="text-sm font-semibold"
                        >
                            Product Description
                        </label>

                        <span className="text-xs text-neutral-500">
                            {descriptionLength} Characters
                        </span>

                    </div>

                    <textarea
                        id="description"
                        rows={8}
                        name="description"
                        value={form.description ?? ""}
                        onChange={handleChange}
                        placeholder="Write a complete product description..."
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-neutral-300
                            p-5
                            outline-none
                            transition
                            resize-none
                            focus:border-black
                            focus:ring-2
                            focus:ring-black/5
                        "
                    />
                </div>
            </div>
        </section>
    );
}