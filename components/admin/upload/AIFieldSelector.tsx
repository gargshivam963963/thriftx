"use client";

import { PRODUCT_FIELDS } from "@/lib/productFields";
import { Sparkles, Check, RotateCcw } from "lucide-react";

interface AIFieldSelectorProps {
    selectedAiFields: string[];
    setSelectedAiFields: React.Dispatch<
        React.SetStateAction<string[]>
    >;
}

export default function AIFieldSelector({
    selectedAiFields,
    setSelectedAiFields,
}: AIFieldSelectorProps) {
    const AI_FIELDS = PRODUCT_FIELDS.filter(
        (field) => field.ai
    );

    function toggleField(name: string) {
        if (selectedAiFields.includes(name)) {
            setSelectedAiFields((prev) =>
                prev.filter((item) => item !== name)
            );
        } else {
            setSelectedAiFields((prev) => [...prev, name]);
        }
    }

    function selectAll() {
        setSelectedAiFields(
            AI_FIELDS.map((field) => field.name)
        );
    }

    function clearAll() {
        setSelectedAiFields([]);
    }

    return (
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">

            <div className="border-b border-neutral-200 p-6">

                <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">

                        <Sparkles
                            size={22}
                            className="text-violet-600"
                        />

                    </div>

                    <div>

                        <h2 className="text-xl font-bold">
                            AI Fields
                        </h2>

                        <p className="text-sm text-neutral-500">
                            Select which fields AI should generate.
                        </p>

                    </div>

                </div>

            </div>

            <div className="space-y-5 p-6">

                <div className="flex gap-3">

                    <button
                        type="button"
                        onClick={selectAll}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-white transition hover:bg-neutral-800"
                    >
                        <Check size={18} />
                        Select All
                    </button>

                    <button
                        type="button"
                        onClick={clearAll}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-3 transition hover:bg-neutral-100"
                    >
                        <RotateCcw size={18} />
                        Clear
                    </button>

                </div>

                <div className="grid gap-3">

                    {AI_FIELDS.map((field) => {

                        const checked =
                            selectedAiFields.includes(
                                field.name
                            );

                        return (
                            <label
                                key={field.name}
                                className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${checked
                                    ? "border-black bg-neutral-100"
                                    : "border-neutral-200 hover:border-neutral-400"
                                    }`}
                            >

                                <div>

                                    <h3 className="font-medium">
                                        {field.label}
                                    </h3>

                                    <p className="mt-1 text-xs text-neutral-500">
                                        AI will generate this field.
                                    </p>

                                </div>

                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                        toggleField(
                                            field.name
                                        )
                                    }
                                    className="h-5 w-5 accent-black"
                                />

                            </label>
                        );
                    })}

                </div>

                <div className="rounded-2xl bg-neutral-50 p-4">

                    <div className="flex items-center justify-between">

                        <span className="text-sm text-neutral-500">
                            Selected
                        </span>

                        <span className="rounded-full bg-black px-3 py-1 text-sm font-semibold text-white">
                            {selectedAiFields.length}
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}