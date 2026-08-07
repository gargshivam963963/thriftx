"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterOptionList from "./FilterOptionList";

interface MaterialFilterProps {
    materials: string[];
}

export default function MaterialFilter({ materials }: MaterialFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedMaterial = searchParams.get("material");

    function toggleMaterial(material: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedMaterial === material) {
            params.delete("material");
        } else {
            params.set("material", material);
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <FilterOptionList
            options={materials}
            selected={selectedMaterial}
            onSelect={toggleMaterial}
            chips
            visibleLimit={10}
        />
    );
}
