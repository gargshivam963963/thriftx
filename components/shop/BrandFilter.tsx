"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BrandFilterProps {
    brands: string[];
}

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
            {displayed.map((brand) => {
                const active = selectedBrand === brand;
                return (
                    <Button
                        key={brand}
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        variant={active ? "primary" : "ghost"}
                        size="sm"
                        rounded="lg"
                        className="flex items-center gap-2 px-3.5 py-2.5 text-body-sm font-medium w-full justify-start"
                    >
                        <span className="truncate">{brand}</span>
                        {active && <span className="ml-auto text-badge font-bold text-background/70">✓</span>}
                    </Button>
                );
            })}
            {brands.length > 10 && (
                <Button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    variant="ghost"
                    size="sm"
                    rounded="lg"
                    className="mt-1 text-small font-semibold text-muted-foreground hover:text-foreground w-full justify-center"
                >
                    {showAll ? "− Show less" : `+ ${brands.length - 10} more`}
                </Button>
            )}
        </div>
    );
}
