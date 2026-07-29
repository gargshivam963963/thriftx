import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    [
        "inline-flex items-center gap-1.5",
        "font-semibold leading-none",
        "whitespace-nowrap select-none",
        "transition-colors duration-200",
    ],
    {
        variants: {
            variant: {
                default: [
                    "bg-neutral-900 text-neutral-100",
                    "dark:bg-neutral-100 dark:text-neutral-900",
                ],
                secondary: [
                    "bg-neutral-100 text-neutral-700",
                    "dark:bg-neutral-800 dark:text-neutral-300",
                ],
                outline: [
                    "border border-neutral-300 text-neutral-700 bg-transparent",
                    "dark:border-neutral-600 dark:text-neutral-300",
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
                xs: "px-2 py-0.5 text-[0.625rem] tracking-wider uppercase",
                sm: "px-2.5 py-0.5 text-[0.6875rem]",
                md: "px-3 py-1 text-[0.75rem]",
                lg: "px-4 py-1.5 text-[0.8125rem]",
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
