"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterOptionList from "./FilterOptionList";

interface ColorFilterProps {
    colors: string[];
}

export default function ColorFilter({ colors }: ColorFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedColor = searchParams.get("color");

    function toggleColor(color: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedColor === color) {
            params.delete("color");
        } else {
            params.set("color", color);
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <FilterOptionList
            options={colors}
            selected={selectedColor}
            onSelect={toggleColor}
            chips
            visibleLimit={12}
        />
    );
}
