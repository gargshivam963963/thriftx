"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    leftIcon?: React.ReactNode;
}

export default function AnimatedButton({
    children,
    loading,
    leftIcon,
    className,
    ...props
}: Props) {
    return (
        <motion.button
            whileHover={{
                y: -2,
                scale: 1.01,
            }}
            whileTap={{
                scale: .98,
            }}
            transition={{
                duration: .15,
            }}
            disabled={loading || props.disabled}
            className={cn(
                "group relative overflow-hidden",
                "inline-flex items-center justify-center gap-2",
                "h-12 rounded-xl",
                "bg-black",
                "px-6",
                "font-medium",
                "text-white",
                "transition-all",
                "hover:shadow-xl",
                "disabled:pointer-events-none",
                "disabled:opacity-60",
                className
            )}
            {...props}
        >
            <motion.div
                initial={{ x: "-120%" }}
                whileHover={{ x: "120%" }}
                transition={{
                    duration: .8,
                }}
                className="absolute inset-y-0 w-24 bg-white/20 blur-xl"
            />

            {loading ? (
                <>
                    <Loader2
                        size={18}
                        className="animate-spin"
                    />
                    Loading...
                </>
            ) : (
                <>
                    {leftIcon}
                    {children}
                </>
            )}
        </motion.button>
    );
}