"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterOptionList from "./FilterOptionList";

interface SizeFilterProps {
    /** Only sizes that exist among loaded products are shown. */
    sizes: string[];
}

export default function SizeFilter({ sizes }: SizeFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedSize = searchParams.get("size");

    function toggleSize(size: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedSize === size) {
            params.delete("size");
        } else {
            params.set("size", size);
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    if (sizes.length === 0) {
        return (
            <p className="py-2 text-center text-small text-muted-foreground">
                No sizes available
            </p>
        );
    }

    return (
        <FilterOptionList
            options={sizes}
            selected={selectedSize}
            onSelect={toggleSize}
            chips
            visibleLimit={12}
        />
    );
}
