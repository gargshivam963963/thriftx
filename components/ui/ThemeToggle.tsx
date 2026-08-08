"use client";

import { motion } from "framer-motion";
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
            <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: theme === "light" ? 90 : -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center justify-center"
            >
                {theme === "light" ? (
                    <Moon size={iconSizes[size]} strokeWidth={2} />
                ) : (
                    <Sun size={iconSizes[size]} strokeWidth={2} />
                )}
            </motion.span>
        </Button>
    );
}
