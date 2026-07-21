"use client";

import { Sparkles, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

const OPTIONS = [
    {
        id: "title",
        label: "Generate Title",
    },
    {
        id: "brand",
        label: "Generate Brand",
    },
    {
        id: "category",
        label: "Generate Category",
    },
    {
        id: "color",
        label: "Generate Color",
    },
    {
        id: "material",
        label: "Generate Material",
    },
    {
        id: "description",
        label: "Generate Description",
    },
    {
        id: "retailPrice",
        label: "Suggest Retail Price",
    },
];

interface AISettingsProps {
    loading?: boolean;
    onGenerate: (fields: string[]) => void;
}

export default function AISettings({
    loading = false,
    onGenerate,
}: AISettingsProps) {
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("bulk-ai-fields");

        queueMicrotask(() => {
            if (saved) {
                try {
                    setSelected(JSON.parse(saved));
                } catch {
                    setSelected(OPTIONS.map((i) => i.id));
                }
            } else {
                setSelected(OPTIONS.map((i) => i.id));
            }
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(
            "bulk-ai-fields",
            JSON.stringify(selected)
        );
    }, [selected]);

    function toggle(id: string) {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    }

    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

                <div>

                    <h2 className="text-xl font-semibold">
                        AI Assistant
                    </h2>

                    <p className="text-sm text-neutral-500">
                        Select which fields AI
                        should generate.
                    </p>

                </div>

                <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-neutral-100"
                >
                    <Settings2 size={16} />
                    Settings
                </button>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

                {OPTIONS.map((item) => {

                    const checked =
                        selected.includes(
                            item.id
                        );

                    return (
                        <label
                            key={item.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition

${checked
                                    ? "border-black bg-neutral-100"
                                    : "hover:bg-neutral-50"
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={
                                    checked
                                }
                                onChange={() =>
                                    toggle(
                                        item.id
                                    )
                                }
                                className="h-5 w-5"
                            />

                            <span className="font-medium">
                                {item.label}
                            </span>

                        </label>
                    );
                })}

            </div>

            <div className="mt-6 flex items-center justify-between">

                <span className="text-sm text-neutral-500">
                    {selected.length} field(s)
                    selected
                </span>

                <button
                    type="button"
                    disabled={
                        loading ||
                        !selected.length
                    }
                    onClick={() =>
                        onGenerate(selected)
                    }
                    className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Sparkles size={18} />

                    {loading
                        ? "Generating..."
                        : "Generate AI"}
                </button>

            </div>

        </div>
    );
}