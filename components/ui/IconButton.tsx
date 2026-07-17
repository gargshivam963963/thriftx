"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Spinner from "./Spinner";

interface IconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
}

const variants = {
    primary:
        "bg-black text-white hover:bg-neutral-900",

    secondary:
        "bg-neutral-100 text-black hover:bg-neutral-200",

    outline:
        "border border-neutral-300 bg-white text-black hover:bg-neutral-50",

    ghost:
        "bg-transparent hover:bg-neutral-100",
};

const sizes = {
    sm: "h-9 w-9",

    md: "h-11 w-11",

    lg: "h-12 w-12",
};

const IconButton = forwardRef<
    HTMLButtonElement,
    IconButtonProps
>(
    (
        {
            children,
            className,
            variant = "outline",
            size = "md",
            loading = false,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{
                    scale: 1.04,
                }}
                whileTap={{
                    scale: 0.96,
                }}
                transition={{
                    duration: 0.15,
                }}
                disabled={disabled || loading}
                className={cn(
                    "inline-flex items-center justify-center rounded-2xl transition-all duration-200",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-black",
                    "disabled:pointer-events-none",
                    "disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {loading ? (
                    <Spinner size="sm" />
                ) : (
                    children
                )}
            </motion.button>
        );
    }
);

IconButton.displayName = "IconButton";

export default IconButton;