"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function SortDropdown({
    defaultValue,
}: {
    defaultValue: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function handleChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());

        params.set("sort", value);

        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <select
            value={defaultValue}
            onChange={(e) => handleChange(e.target.value)}
            className="
        rounded-full
        border
        border-neutral-200
        bg-neutral-50
        px-4
        py-1.5
        text-sm
        font-medium
        text-neutral-900
        outline-none
        transition
        hover:bg-neutral-100
      "
        >
            <option value="newest">Newest</option>
            <option value="name">Alphabetical</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
        </select>
    );
}