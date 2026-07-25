"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Ruler } from "lucide-react";

const measurementOptions = [
    { label: "Chest 20–22″", value: "chest-20-22" },
    { label: "Chest 22–24″", value: "chest-22-24" },
    { label: "Chest 24–26″", value: "chest-24-26" },
    { label: "Chest 26+″", value: "chest-26-plus" },
    { label: "Waist 28–30″", value: "waist-28-30" },
    { label: "Waist 30–32″", value: "waist-30-32" },
    { label: "Waist 32–34″", value: "waist-32-34" },
    { label: "Waist 34+″", value: "waist-34-plus" },
];

export default function MeasurementFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selected = searchParams.get("measurement");

    function toggle(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (selected === value) params.delete("measurement");
        else params.set("measurement", value);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="space-y-1.5">
            {measurementOptions.map((opt) => {
                const active = selected === opt.value;
                const isChest = opt.label.startsWith("Chest");
                return (
                    <button
                        key={opt.value}
                        onClick={() => toggle(opt.value)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${active
                                ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:bg-neutral-700/50"
                            }`}
                    >
                        <Ruler
                            size={14}
                            className={`shrink-0 ${active ? "text-white/80 dark:text-neutral-900/80" : isChest ? "text-blue-500" : "text-emerald-500"}`}
                        />
                        <span>{opt.label}</span>
                        {active && <span className="ml-auto text-[10px] font-bold">✓</span>}
                    </button>
                );
            })}
        </div>
    );
}
