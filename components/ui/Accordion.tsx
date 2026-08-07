"use client";


import { Button } from '@/components/ui/button';import { useState } from "react";
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
        <div className={cn("divide-y divide-border dark:divide-border", className)}>
            {items.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <div key={index}>
                        <Button
                            type="button"
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            className="flex w-full items-center justify-between py-4 text-left text-sm font-medium transition hover:text-muted-foreground dark:text-foreground dark:hover:text-muted-foreground"
                        >
                            {item.title}
                            <ChevronDown
                                size={16}
                                className={cn(
                                    "transition-transform duration-200",
                                    isOpen && "rotate-180",
                                )}
                            />
                        </Button>
                        {isOpen && (
                            <div className="pb-4 text-sm leading-relaxed text-muted-foreground">
                                {item.content}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
