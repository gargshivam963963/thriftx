"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItem {
    title: string;
    content: React.ReactNode;
}

interface AccordionProps {
    items: AccordionItem[];
    className?: string;
    defaultOpen?: number;
}

export default function Accordion({ items, className, defaultOpen }: AccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen ?? null);

    return (
        <div className={cn("divide-y divide-neutral-200 dark:divide-neutral-700", className)}>
            {items.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <div key={index}>
                        <button
                            type="button"
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            className="flex w-full items-center justify-between py-4 text-left text-sm font-medium transition hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400"
                        >
                            {item.title}
                            <ChevronDown
                                size={16}
                                className={cn(
                                    "transition-transform duration-200",
                                    isOpen && "rotate-180",
                                )}
                            />
                        </button>
                        {isOpen && (
                            <div className="pb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                {item.content}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
