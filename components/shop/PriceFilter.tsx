"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

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
                    <Button
                        key={range.value}
                        type="button"
                        onClick={() => togglePrice(range.value)}
                        variant={active ? "primary" : "ghost"}
                        size="sm"
                        rounded="lg"
                        className="px-4 py-2.5 text-left text-body-sm font-medium w-full justify-start"
                    >
                        {range.label}
                        {active && <span className="ml-auto text-badge font-bold">✓</span>}
                    </Button>
                );
            })}
        </div>
    );
}
