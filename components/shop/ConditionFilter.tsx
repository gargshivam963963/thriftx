"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterOptionList from "./FilterOptionList";

interface ConditionFilterProps {
    conditions: string[];
}

export default function ConditionFilter({ conditions }: ConditionFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedCondition = searchParams.get("condition");

    function toggleCondition(condition: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedCondition === condition) {
            params.delete("condition");
        } else {
            params.set("condition", condition);
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <FilterOptionList
            options={conditions}
            selected={selectedCondition}
            onSelect={toggleCondition}
            chips
            visibleLimit={8}
        />
    );
}
