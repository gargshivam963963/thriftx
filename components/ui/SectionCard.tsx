import { ReactNode } from "react";
import clsx from "clsx";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    blur?: "sm" | "md" | "lg" | "xl";
}

const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
};

export default function GlassCard({
    children,
    className,
    blur = "lg",
}: GlassCardProps) {
    return (
        <div
            className={clsx(
                "relative overflow-hidden rounded-3xl",
                "border border-white/20",
                "bg-white/10",
                "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
                blurClasses[blur],
                className
            )}
        >
            {/* Light gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}