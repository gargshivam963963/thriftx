import { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
    children: ReactNode;
    className?: string;
    containerClassName?: string;
    as?: ElementType;
    fluid?: boolean;
}

export default function Section({
    children,
    className,
    containerClassName,
    as: Component = "section",
    fluid = false,
}: SectionProps) {
    return (
        <Component className={cn("w-full py-8 md:py-12 lg:py-16", className)}>
            <div
                className={cn(
                    fluid
                        ? "w-full px-4 sm:px-6 lg:px-8"
                        : "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8",
                    containerClassName
                )}
            >
                {children}
            </div>
        </Component>
    );
}