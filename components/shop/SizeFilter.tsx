"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

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
                    <Button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        variant={active ? "primary" : "outline"}
                        size="sm"
                        rounded="lg"
                        className="h-10 text-small font-semibold"
                    >
                        {size}
                    </Button>
                );
            })}
        </div>
    );
}
