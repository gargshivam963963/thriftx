"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

export default function SizeFilter() {
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

    return (
        <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) => {
                const active = selectedSize === size;
                return (
                    <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`h-10 rounded-xl text-xs font-semibold transition-all duration-150 ${active
                                ? "bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900"
                                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-500"
                            }`}
                    >
                        {size}
                    </button>
                );
            })}
        </div>
    );
}

