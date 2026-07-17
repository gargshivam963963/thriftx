"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

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
        <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => {
                const active = selectedSize === size;

                return (
                    <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`
              h-11
              rounded-xl
              border
              text-sm
              font-semibold
              transition-all
              ${active
                                ? "border-black bg-black text-white"
                                : "border-neutral-300 bg-white text-black hover:border-black"
                            }
            `}
                    >
                        {size}
                    </button>
                );
            })}
        </div>
    );
}