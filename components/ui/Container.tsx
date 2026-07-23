import { ReactNode } from "react";
import clsx from "clsx";

interface ContainerProps {
    children: ReactNode;
    className?: string;
}

export function Container({
    children,
    className,
}: ContainerProps) {
    return (
        <div
            className={clsx(
                "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12",
                className
            )}
        >
            {children}
        </div>
    );
}