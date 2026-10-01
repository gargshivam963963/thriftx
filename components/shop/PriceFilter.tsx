"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { controlTransition, controlFocusRing } from "@/components/ui/control.styles";

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
                        variant={active ? "primary" : "ghost"}
                        size="sm"
                        fullWidth
                        onClick={() => togglePrice(range.value)}
                        aria-pressed={active}
                        className={cn(
                            controlTransition,
                            controlFocusRing,
                            "justify-start rounded-lg px-3 text-left",
                            !active && "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-card",
                        )}
                    >
                        <span
                            className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                                active ? "border-background" : "border-border bg-card",
                            )}
                        >
                            {active && <span className="h-2 w-2 rounded-full bg-background" />}
                        </span>
                        <span className="truncate">{range.label}</span>
                    </Button>
                );
            })}
        </div>
    );
}
