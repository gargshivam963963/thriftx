import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            children,
            hover = false,
            padding = "md",
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-200",
                    paddingMap[padding],
                    hover &&
                    "hover:-translate-y-1 hover:shadow-xl hover:border-neutral-300",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

export default Card;