"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Ruler, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const CHEST_RANGE = { min: 20, max: 50, step: 1 };
const WAIST_RANGE = { min: 22, max: 46, step: 1 };
const LENGTH_RANGE = { min: 18, max: 44, step: 1 };
const INSEAM_RANGE = { min: 18, max: 40, step: 1 };

const quickOptions = [
    { label: "Chest 20–22″", value: "chest-20-22" },
    { label: "Chest 22–24″", value: "chest-22-24" },
    { label: "Chest 24–26″", value: "chest-24-26" },
    { label: "Chest 26+″", value: "chest-26-plus" },
    { label: "Waist 28–30″", value: "waist-28-30" },
    { label: "Waist 30–32″", value: "waist-30-32" },
    { label: "Waist 32–34″", value: "waist-32-34" },
    { label: "Waist 34+″", value: "waist-34-plus" },
    { label: "Inseam 26–28″", value: "inseam-26-28" },
    { label: "Inseam 28–30″", value: "inseam-28-30" },
    { label: "Inseam 30–32″", value: "inseam-30-32" },
    { label: "Inseam 32+″", value: "inseam-32-plus" },
    { label: "Length 26–28″", value: "length-26-28" },
    { label: "Length 28–30″", value: "length-28-30" },
    { label: "Length 30–32″", value: "length-30-32" },
    { label: "Length 32+″", value: "length-32-plus" },
];

function parseValue(value: string | null): { chest: string; waist: string; length: string; inseam: string } {
    const chest = value?.startsWith("chest-") ? value.replace("chest-", "").replace("-plus", "+").replace("-", "–") : "";
    const waist = value?.startsWith("waist-") ? value.replace("waist-", "").replace("-plus", "+").replace("-", "–") : "";
    const length = value?.startsWith("length-") ? value.replace("length-", "").replace("-plus", "+").replace("-", "–") : "";
    const inseam = value?.startsWith("inseam-") ? value.replace("inseam-", "").replace("-plus", "+").replace("-", "–") : "";
    return { chest, waist, length, inseam };
}

export default function MeasurementFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selected = searchParams.get("measurement");

    const [chestVal, setChestVal] = useState("");
    const [waistVal, setWaistVal] = useState("");
    const [lengthVal, setLengthVal] = useState("");
    const [inseamVal, setInseamVal] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);

    const { chest: chestLabel, waist: waistLabel, length: lengthLabel, inseam: inseamLabel } = parseValue(selected);

    function applyCustomValue(type: "chest" | "waist" | "length" | "inseam", val: string) {
        if (!val || isNaN(Number(val))) return;
        const value = `${type}-${val}`;
        const params = new URLSearchParams(searchParams.toString());
        params.set("measurement", value);
        router.push(`${pathname}?${params.toString()}`);
    }

    function togglePreset(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (selected === value) params.delete("measurement");
        else params.set("measurement", value);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="space-y-3">
            {/* Preset Buttons */}
            <div className="grid grid-cols-2 gap-1.5">
                {quickOptions.map((opt) => {
                    const active = selected === opt.value;
                    return (
                        <Button
                            key={opt.value}
                            type="button"
                            onClick={() => togglePreset(opt.value)}
                            variant={active ? "primary" : "outline"}
                            size="xs"
                            rounded="lg"
                            className="h-8 text-[10px] font-semibold tracking-tight"
                        >
                            {active && <span className="mr-1 text-[9px]">✓</span>}
                            {opt.label}
                        </Button>
                    );
                })}
            </div>

            {/* Advanced: Custom Range Sliders */}
            <div>
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 transition hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                    <span className="flex items-center gap-1.5">
                        <Ruler size={11} />
                        Exact Measurement
                    </span>
                    {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden pt-2"
                        >
                            {/* Chest */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                        <span className="text-blue-500">●</span> Chest
                                    </label>
                                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                                        {chestLabel || `${CHEST_RANGE.min}″ – ${CHEST_RANGE.max}″`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min={CHEST_RANGE.min}
                                        max={CHEST_RANGE.max}
                                        step={CHEST_RANGE.step}
                                        value={
                                            chestLabel
                                                ? parseInt(chestLabel.replace(/[^\d]/g, "")) || CHEST_RANGE.min
                                                : CHEST_RANGE.min
                                        }
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setChestVal(v);
                                            applyCustomValue("chest", v);
                                        }}
                                        className="range-slider flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-neutral-200 dark:bg-neutral-700 accent-neutral-900 dark:accent-neutral-100"
                                    />
                                    <input
                                        type="number"
                                        placeholder="exact"
                                        value={chestVal || chestLabel?.replace(/[^\d]/g, "") || ""}
                                        onChange={(e) => setChestVal(e.target.value)}
                                        onBlur={() => chestVal && applyCustomValue("chest", chestVal)}
                                        onKeyDown={(e) => e.key === "Enter" && chestVal && applyCustomValue("chest", chestVal)}
                                        className="h-8 w-14 rounded-lg border border-neutral-300 px-2 text-center text-[11px] font-medium outline-none focus:border-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    />
                                </div>
                            </div>

                            {/* Waist */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                        <span className="text-emerald-500">●</span> Waist
                                    </label>
                                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                                        {waistLabel || `${WAIST_RANGE.min}″ – ${WAIST_RANGE.max}″`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min={WAIST_RANGE.min}
                                        max={WAIST_RANGE.max}
                                        step={WAIST_RANGE.step}
                                        value={
                                            waistLabel
                                                ? parseInt(waistLabel.replace(/[^\d]/g, "")) || WAIST_RANGE.min
                                                : WAIST_RANGE.min
                                        }
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setWaistVal(v);
                                            applyCustomValue("waist", v);
                                        }}
                                        className="range-slider flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-neutral-200 dark:bg-neutral-700 accent-neutral-900 dark:accent-neutral-100"
                                    />
                                    <input
                                        type="number"
                                        placeholder="exact"
                                        value={waistVal || waistLabel?.replace(/[^\d]/g, "") || ""}
                                        onChange={(e) => setWaistVal(e.target.value)}
                                        onBlur={() => waistVal && applyCustomValue("waist", waistVal)}
                                        onKeyDown={(e) => e.key === "Enter" && waistVal && applyCustomValue("waist", waistVal)}
                                        className="h-8 w-14 rounded-lg border border-neutral-300 px-2 text-center text-[11px] font-medium outline-none focus:border-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    />
                                </div>
                            </div>

                            {/* Inseam — for lower / bottom wear (jeans, trousers, pants, cargo) */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                        <span className="text-amber-500">●</span> Inseam
                                    </label>
                                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                                        {inseamLabel || `${INSEAM_RANGE.min}″ – ${INSEAM_RANGE.max}″`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min={INSEAM_RANGE.min}
                                        max={INSEAM_RANGE.max}
                                        step={INSEAM_RANGE.step}
                                        value={
                                            inseamLabel
                                                ? parseInt(inseamLabel.replace(/[^\d]/g, "")) || INSEAM_RANGE.min
                                                : INSEAM_RANGE.min
                                        }
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setInseamVal(v);
                                            applyCustomValue("inseam", v);
                                        }}
                                        className="range-slider flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-neutral-200 dark:bg-neutral-700 accent-neutral-900 dark:accent-neutral-100"
                                    />
                                    <input
                                        type="number"
                                        placeholder="exact"
                                        value={inseamVal || inseamLabel?.replace(/[^\d]/g, "") || ""}
                                        onChange={(e) => setInseamVal(e.target.value)}
                                        onBlur={() => inseamVal && applyCustomValue("inseam", inseamVal)}
                                        onKeyDown={(e) => e.key === "Enter" && inseamVal && applyCustomValue("inseam", inseamVal)}
                                        className="h-8 w-14 rounded-lg border border-neutral-300 px-2 text-center text-[11px] font-medium outline-none focus:border-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    />
                                </div>
                            </div>

                            {/* Length */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                        <span className="text-violet-500">●</span> Length
                                    </label>
                                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                                        {lengthLabel || `${LENGTH_RANGE.min}″ – ${LENGTH_RANGE.max}″`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min={LENGTH_RANGE.min}
                                        max={LENGTH_RANGE.max}
                                        step={LENGTH_RANGE.step}
                                        value={
                                            lengthLabel
                                                ? parseInt(lengthLabel.replace(/[^\d]/g, "")) || LENGTH_RANGE.min
                                                : LENGTH_RANGE.min
                                        }
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setLengthVal(v);
                                            applyCustomValue("length", v);
                                        }}
                                        className="range-slider flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-neutral-200 dark:bg-neutral-700 accent-neutral-900 dark:accent-neutral-100"
                                    />
                                    <input
                                        type="number"
                                        placeholder="exact"
                                        value={lengthVal || lengthLabel?.replace(/[^\d]/g, "") || ""}
                                        onChange={(e) => setLengthVal(e.target.value)}
                                        onBlur={() => lengthVal && applyCustomValue("length", lengthVal)}
                                        onKeyDown={(e) => e.key === "Enter" && lengthVal && applyCustomValue("length", lengthVal)}
                                        className="h-8 w-14 rounded-lg border border-neutral-300 px-2 text-center text-[11px] font-medium outline-none focus:border-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

