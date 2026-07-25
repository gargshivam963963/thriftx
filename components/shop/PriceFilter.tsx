"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const priceRanges = [
    { label: "Under ₹499", value: "0-499" },
    { label: "₹500 – ₹999", value: "500-999" },
    { label: "₹1,000 – ₹1,499", value: "1000-1499" },
    { label: "₹1,500+", value: "1500+" },
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
        <div className="flex flex-col gap-1.5">
            {priceRanges.map((range) => {
                const active = selectedPrice === range.value;
                return (
                    <button
                        key={range.value}
                        onClick={() => togglePrice(range.value)}
                        className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-150 ${active
                                ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900"
                                : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:bg-neutral-800"
                            }`}
                    >
                        {range.label}
                    </button>
                );
            })}
        </div>
    );
}

