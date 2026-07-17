"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface BrandFilterProps {
    brands: string[];
}

export default function BrandFilter({
    brands,
}: BrandFilterProps) {
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
        <div className="flex flex-col gap-3">
            {brands.map((brand) => {
                const checked = selectedBrand === brand;

                return (
                    <label
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className="
              group
              flex
              cursor-pointer
              items-center
              justify-between
              rounded-2xl
              border
              border-neutral-200
              px-4
              py-3
              transition-all
              hover:border-neutral-300
              hover:bg-neutral-50
            "
                    >
                        <input
                            type="checkbox"
                            checked={checked}
                            readOnly
                            className="
                h-5
                w-5
                rounded
                border-neutral-300
                text-black
                focus:ring-black
              "
                        />

                        <span
                            className={`font-sans text-base ${checked
                                ? "font-semibold text-black"
                                : "text-neutral-700"
                                }`}
                        >
                            {brand}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}