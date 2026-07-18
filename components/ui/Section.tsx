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
        <Component className={cn("w-full py-8 md:py-12 lg:py-4", className)}>
            <div
                className={cn(
                    fluid
                        ? "w-full px-4 xl:px-8 2xl:px-10 sm:px-6 lg:px-8"
                        : "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8",
                    containerClassName
                )}
            >
                {children}
            </div>
        </Component>
    );
}