import { cn } from "@/lib/utils";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "skeleton-glass rounded-xl",
                className,
            )}
            {...props}
        />
    );
}

export { Skeleton };