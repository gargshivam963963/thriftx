"use client";


import { Button } from '@/components/ui/button';import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

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
        <div className="flex flex-col gap-1">
            {priceRanges.map((range) => {
                const active = selectedPrice === range.value;
                return (
                    <Button
                        key={range.value}
                        type="button"
                        onClick={() => togglePrice(range.value)}
                        aria-pressed={active}
                        className={cn(
                            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-body-sm font-medium transition-colors",
                            active
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                    >
                        <span
                            className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                                active
                                    ? "border-background"
                                    : "border-border bg-card",
                            )}
                        >
                            {active && (
                                <span className="h-2 w-2 rounded-full bg-background" />
                            )}
                        </span>
                        <span className="truncate">{range.label}</span>
                    </Button>
                );
            })}
        </div>
    );
}
