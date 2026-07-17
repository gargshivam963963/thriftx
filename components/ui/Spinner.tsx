import { cn } from "@/lib/utils";

interface SpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[3px]",
    xl: "h-10 w-10 border-[3px]",
};

export default function Spinner({
    size = "md",
    className,
}: SpinnerProps) {
    return (
        <div
            role="status"
            aria-label="Loading"
            className={cn(
                "inline-block animate-spin rounded-full border-neutral-200 border-t-black",
                sizeMap[size],
                className
            )}
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}