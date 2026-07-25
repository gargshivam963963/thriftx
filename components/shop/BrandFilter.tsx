"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface BrandFilterProps {
    brands: string[];
}

const colors = [
    "bg-violet-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-blue-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-orange-500",
];

export default function BrandFilter({ brands }: BrandFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedBrand = searchParams.get("brand");
    const [showAll, setShowAll] = useState(false);

    const displayed = showAll ? brands : brands.slice(0, 10);

    function toggleBrand(brand: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedBrand === brand) {
            params.delete("brand");
        } else {
            params.set("brand", brand);
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col gap-1.5">
            {displayed.map((brand, i) => {
                const active = selectedBrand === brand;
                const colorIndex = i % colors.length;
                return (
                    <button
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${active
                                ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900"
                                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                            }`}
                    >
                        <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${active ? colors[colorIndex] : "bg-neutral-200 dark:bg-neutral-700"
                                }`}
                        >
                            {brand.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate">{brand}</span>
                        {active && (
                            <span className="ml-auto text-[10px] font-bold text-white/70 dark:text-neutral-700">
                                ✓
                            </span>
                        )}
                    </button>
                );
            })}
            {brands.length > 10 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-1 text-xs font-semibold text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                    {showAll ? "− Show less" : `+ ${brands.length - 10} more`}
                </button>
            )}
        </div>
    );
}

