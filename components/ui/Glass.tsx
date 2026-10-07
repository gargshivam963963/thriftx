"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Glass — Liquid-glass surface primitive.
 * iOS 26 style: saturate-boosted blur + specular top light + chromatic edge.
 * Use for nav pills, cards, sheets, floating panels.
 */
export function Glass({
  children,
  className,
  strong = false,
  hover = false,
  sheen = false,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  hover?: boolean;
  sheen?: boolean;
}) {
  return (
    <div
      className={cn(
        strong ? "glass-liquid-strong" : "glass-liquid",
        hover && "glass-card-hover",
        sheen && "group/liquid",
        className
      )}
    >
      {children}
      {sheen && <span className="liquid-sheen" aria-hidden />}
    </div>
  );
}

/** Floating ambient orbs that sit behind glass for liquid depth. */
export function LiquidOrbs({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="liquid-orb animate-orb-a left-[-8%] top-[-12%] h-[420px] w-[420px] bg-gradient-to-br from-violet-400/30 via-fuchsia-300/20 to-transparent dark:from-violet-500/20 dark:via-fuchsia-500/10" />
      <div className="liquid-orb animate-orb-b right-[-10%] top-[20%] h-[480px] w-[480px] bg-gradient-to-bl from-sky-300/25 via-cyan-200/15 to-transparent dark:from-sky-500/15 dark:via-cyan-400/10" />
      <div className="liquid-orb animate-orb-c bottom-[-18%] left-[30%] h-[380px] w-[560px] bg-gradient-to-tr from-amber-200/20 via-rose-200/15 to-transparent dark:from-amber-500/10 dark:via-rose-500/10" />
    </div>
  );
}

/** Motion wrapper: silky rise + blur-in on scroll into view. */
export function LiquidRise({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.985, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
