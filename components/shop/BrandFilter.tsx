"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterOptionList from "./FilterOptionList";

interface BrandFilterProps {
    /** Alphabetically sorted, deduped list of brands. */
    brands: string[];
}

export default function BrandFilter({ brands }: BrandFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedBrand = searchParams.get("brand");

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
        <FilterOptionList
            options={brands}
            selected={selectedBrand}
            onSelect={toggleBrand}
            searchable
            visibleLimit={8}
        />
    );
}
