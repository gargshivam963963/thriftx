"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const priceRanges = [
    {
        label: "Under ₹499",
        value: "0-499",
    },
    {
        label: "₹500 - ₹999",
        value: "500-999",
    },
    {
        label: "₹1000 - ₹1499",
        value: "1000-1499",
    },
    {
        label: "₹1500+",
        value: "1500+",
    },
];

export default function PriceFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedPrice = searchParams.get("price");

    function togglePrice(value: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (selectedPrice === value) {
            params.delete("price");
        } else {
            params.set("price", value);
        }

        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col gap-3">
            {priceRanges.map((range) => {
                const active = selectedPrice === range.value;

                return (
                    <button
                        key={range.value}
                        onClick={() => togglePrice(range.value)}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${active
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-black hover:bg-neutral-50"
                            }`}
                    >
                        <span>{range.label}</span>

                        {active && (
                            <span className="text-xs font-semibold">
                                ✓
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}