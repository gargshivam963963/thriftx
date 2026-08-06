import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm outline-none transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground",
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Input.displayName = "Input";

export { Input };
