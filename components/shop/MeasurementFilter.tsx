"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { controlTransition, controlFocusRing } from "@/components/ui/control.styles";

/**
 * Clothing measurements. Values are stored as `type-value` (e.g. `chest-38`)
 * so they match the backend regex `^(chest|waist|length)-(\d+)(?:-plus)?$`.
 * Inseam is intentionally omitted.
 */
type MeasurementType = "chest" | "waist" | "length";

interface MeasurementConfig {
    type: MeasurementType;
    label: string;
    min: number;
    max: number;
    dotClass: string;
    buckets: { label: string; value: string }[];
}

const MEASUREMENTS: MeasurementConfig[] = [
    {
        type: "chest",
        label: "Chest",
        min: 20,
        max: 50,
        dotClass: "bg-blue-500",
        buckets: [
            { label: "36–38″", value: "chest-36" },
            { label: "38–40″", value: "chest-38" },
            { label: "40–42″", value: "chest-40" },
            { label: "42–44″", value: "chest-42" },
            { label: "44+″", value: "chest-44-plus" },
        ],
    },
    {
        type: "waist",
        label: "Waist",
        min: 22,
        max: 46,
        dotClass: "bg-rose-500",
        buckets: [
            { label: "28–30″", value: "waist-28" },
            { label: "30–32″", value: "waist-30" },
            { label: "32–34″", value: "waist-32" },
            { label: "34+″", value: "waist-34-plus" },
        ],
    },
    {
        type: "length",
        label: "Length",
        min: 18,
        max: 44,
        dotClass: "bg-violet-500",
        buckets: [
            { label: "26–28″", value: "length-26" },
            { label: "28–30″", value: "length-28" },
            { label: "30–32″", value: "length-30" },
            { label: "32+″", value: "length-32-plus" },
        ],
    },
];

function parseSelected(value: string | null): Record<MeasurementType, string> {
    const result: Record<MeasurementType, string> = { chest: "", waist: "", length: "" };
    if (!value) return result;
    const [type] = value.split("-");
    const t = type as MeasurementType;
    if (result[t] !== undefined) {
        result[t] = value
            .replace(`${t}-`, "")
            .replace("-plus", "+")
            .replace(/-/g, "–");
    }
    return result;
}

export default function MeasurementFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selected = searchParams.get("measurement");

    const [sliderValues, setSliderValues] = useState<Record<MeasurementType, number>>({
        chest: 24,
        waist: 28,
        length: 24,
    });

    const labels = parseSelected(selected);

    function updateQuery(value: string | null) {
        const params = new URLSearchParams(searchParams.toString());
        if (!value) params.delete("measurement");
        else params.set("measurement", value);
        router.push(`${pathname}?${params.toString()}`);
    }

    function toggleBucket(m: MeasurementConfig, bucketValue: string) {
        if (selected === bucketValue) updateQuery(null);
        else updateQuery(bucketValue);
    }

    function applySlider(m: MeasurementConfig, val: number) {
        setSliderValues((prev) => ({ ...prev, [m.type]: val }));
        updateQuery(`${m.type}-${val}`);
    }

    return (
        <div className="space-y-5">
            {MEASUREMENTS.map((m) => (
                <div key={m.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-badge font-medium text-muted-foreground">
                            <span className={cn("h-2 w-2 rounded-full", m.dotClass)} />
                            {m.label}
                        </label>
                        <span className="text-small font-semibold text-foreground">
                            {labels[m.type] || `${m.min}″ – ${m.max}″`}
                        </span>
                    </div>

                    {/* Quick range chips */}
                    <div className="grid grid-cols-2 gap-1.5">
                        {m.buckets.map((bucket) => {
                            const active = selected === bucket.value;
                            return (
                                <Button
                                    key={bucket.value}
                                    type="button"
                                    variant={active ? "primary" : "outline"}
                                    size="sm"
                                    rounded="md"
                                    onClick={() => toggleBucket(m, bucket.value)}
                                    aria-pressed={active}
                                    className={cn(
                                        controlTransition,
                                        controlFocusRing,
                                        "h-8 min-w-0 px-2 text-label",
                                        !active && "text-muted-foreground hover:border-foreground/50 hover:text-foreground",
                                    )}
                                >
                                    {bucket.label}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Slider for exact measurement */}
                    <div className="flex items-center gap-2 pt-0.5">
                        <Ruler size={13} className="shrink-0 text-muted-foreground" />
                        <input
                            type="range"
                            aria-label={`${m.label} measurement`}
                            min={m.min}
                            max={m.max}
                            step={1}
                            value={sliderValues[m.type]}
                            onChange={(e) => applySlider(m, Number(e.target.value))}
                            className="range-slider flex-1"
                        />
                    </div>
                </div>
            ))}

            <p className="flex items-center gap-1.5 text-small text-muted-foreground">
                <Ruler size={12} />
                Use a quick range or slider for an exact fit.
            </p>
        </div>
    );
}
