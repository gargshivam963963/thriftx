"use client";

import { cn } from "@/lib/utils";

interface Props {
    label: string;
    value: string;
    name: string;
    options: string[];
    aiFilled?: boolean;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

export default function FloatingSelect({
    label,
    value,
    name,
    options,
    aiFilled,
    onChange,
}: Props) {
    return (
        <div className="relative">

            <label className="absolute left-4 -top-2 bg-white px-1 text-xs text-neutral-500">

                {label}

            </label>

            <select
                value={value}
                name={name}
                onChange={onChange}
                className={cn(
                    "h-14 w-full rounded-2xl border border-neutral-300 bg-white px-4 outline-none transition",
                    "focus:border-black focus:ring-4 focus:ring-black/5",
                    aiFilled &&
                    "border-emerald-400 bg-emerald-50/50"
                )}
            >
                <option value="">Select {label}</option>

                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>
                ))}
            </select>

        </div>
    );
}