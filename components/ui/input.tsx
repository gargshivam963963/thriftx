import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Show error state styling */
    error?: boolean;
    /** Left icon/element */
    leftIcon?: React.ReactNode;
    /** Right icon/element */
    rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
        return (
            <div className="relative">
                {leftIcon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        // Base
                        "flex h-11 w-full rounded-xl border bg-white px-4 py-2.5",
                        "text-sm font-medium text-neutral-900",
                        "placeholder:text-neutral-400 placeholder:font-normal",
                        // Border
                        "border-neutral-300",
                        error && "border-red-400",
                        // Focus
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:border-neutral-600",
                        // Disabled
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50",
                        // Dark mode
                        "dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-600",
                        "dark:placeholder:text-neutral-500",
                        "dark:focus-visible:ring-white/20 dark:focus-visible:border-neutral-400",
                        "dark:disabled:bg-neutral-950",
                        // Icons padding
                        leftIcon && "pl-10",
                        rightIcon && "pr-10",
                        className,
                    )}
                    ref={ref}
                    {...props}
                />
                {rightIcon && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400">
                        {rightIcon}
                    </div>
                )}
            </div>
        );
    },
);
Input.displayName = "Input";

export { Input };
