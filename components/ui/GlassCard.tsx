"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
}

export function GlassCard({
    children,
    className,
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .35 }}
            whileHover={{ y: -2 }}
            className={cn(
                "rounded-3xl",
                "border border-neutral-200/70",
                "bg-white/80",
                "backdrop-blur-xl",
                "shadow-[0_10px_40px_rgba(0,0,0,.05)]",
                "transition-all",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}