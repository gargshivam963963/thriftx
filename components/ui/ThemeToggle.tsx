"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export default function ThemeToggle({
    className,
    size = "md",
}: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
    };

    const iconSizes = {
        sm: 16,
        md: 18,
        lg: 22,
    };

    return (
        <Button
            onClick={toggleTheme}
            variant="ghost"
            size={size === "sm" ? "iconSm" : size === "lg" ? "iconLg" : "iconMd"}
            rounded="full"
            className={cn("shrink-0", className)}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === "light" ? (
                    <motion.span
                        key="sun"
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex items-center justify-center"
                    >
                        <Moon size={iconSizes[size]} />
                    </motion.span>
                ) : (
                    <motion.span
                        key="moon"
                        initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex items-center justify-center"
                    >
                        <Sun size={iconSizes[size]} />
                    </motion.span>
                )}
            </AnimatePresence>
        </Button>
    );
}

