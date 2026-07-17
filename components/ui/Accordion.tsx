"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItem {
    value: string;
    title: React.ReactNode;
    content: React.ReactNode;
}

interface AccordionProps {
    items: AccordionItem[];
    type?: "single" | "multiple";
    collapsible?: boolean;
    className?: string;
}

export default function Accordion({
    items,
    type = "single",
    collapsible = true,
    className,
}: AccordionProps) {
    return (
        <AccordionPrimitive.Root
            type={type}
            collapsible={type === "single" ? collapsible : undefined}
            className={cn("w-full space-y-3", className)}
        >
            {items.map((item) => (
                <AccordionPrimitive.Item
                    key={item.value}
                    value={item.value}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >
                    <AccordionPrimitive.Header>
                        <AccordionPrimitive.Trigger
                            className={cn(
                                "group flex w-full items-center justify-between",
                                "px-5 py-4 text-left font-medium",
                                "transition-colors hover:bg-neutral-50"
                            )}
                        >
                            <span>{item.title}</span>

                            <ChevronDown
                                className={cn(
                                    "h-5 w-5 shrink-0 transition-transform duration-200",
                                    "group-data-[state=open]:rotate-180"
                                )}
                            />
                        </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>

                    <AccordionPrimitive.Content
                        className={cn(
                            "overflow-hidden",
                            "data-[state=closed]:animate-accordion-up",
                            "data-[state=open]:animate-accordion-down"
                        )}
                    >
                        <div className="px-5 pb-5 text-sm leading-7 text-neutral-600">
                            {item.content}
                        </div>
                    </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
            ))}
        </AccordionPrimitive.Root>
    );
}