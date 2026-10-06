import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    [
        "inline-flex items-center gap-1.5",
        "font-semibold leading-normal",
        "whitespace-nowrap select-none",
        "transition-colors duration-200",
    ],
    {
        variants: {
            variant: {
                default: [
                    "bg-foreground text-muted-foreground",
                    "dark:bg-muted dark:text-foreground",
                ],
                secondary: [
                    "bg-muted text-muted-foreground",
                    "dark:bg-card dark:text-muted-foreground",
                ],
                outline: [
                    "border border-border text-muted-foreground bg-transparent",
                    "dark:border-border dark:text-muted-foreground",
                ],
                success: [
                    "bg-emerald-100 text-emerald-700",
                    "dark:bg-emerald-900/30 dark:text-emerald-400",
                ],
                warning: [
                    "bg-amber-100 text-amber-700",
                    "dark:bg-amber-900/30 dark:text-amber-400",
                ],
                error: [
                    "bg-red-100 text-red-700",
                    "dark:bg-red-900/30 dark:text-red-400",
                ],
                info: [
                    "bg-blue-100 text-blue-700",
                    "dark:bg-blue-900/30 dark:text-blue-400",
                ],
            },
            size: {
                xs: "px-2 py-0.5 text-2xs tracking-wider uppercase",
                sm: "px-2.5 py-0.5 text-2xs",
                md: "px-3 py-1 text-xs",
                lg: "px-4 py-1.5 text-xs",
            },
            rounded: {
                none: "rounded-none",
                sm: "rounded",
                md: "rounded-md",
                lg: "rounded-lg",
                full: "rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "sm",
            rounded: "full",
        },
    },
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, size, rounded, ...props }: BadgeProps) {
    return (
        <span
            className={cn(badgeVariants({ variant, size, rounded }), className)}
            {...props}
        />
    );
}

export { Badge, badgeVariants };
