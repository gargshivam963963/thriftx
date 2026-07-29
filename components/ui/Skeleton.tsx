import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Border radius variant */
    rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    /** Enable shimmer animation (default: true) */
    animate?: boolean;
}

const roundedMap = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
};

/**
 * Skeleton loading placeholder.
 * Uses CSS shimmer animation defined in globals.css.
 */
function Skeleton({
    className,
    rounded = "xl",
    animate = true,
    ...props
}: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%]",
                animate && "animate-skeleton",
                roundedMap[rounded],
                className,
            )}
            {...props}
        />
    );
}

export { Skeleton };
