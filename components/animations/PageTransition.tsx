"use client";

import { useRef } from "react";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Silky liquid page transition: blur + rise on every route change.
 *
 * ⚠️ IMPORTANT — do not remove the `transitionEnd` / `onAnimationComplete`
 * cleanup below. A `filter` (like a `transform`) on an ancestor makes that
 * element the containing block for `position: fixed` descendants. Framer
 * Motion otherwise keeps the final inline `filter: blur(0px)` on this wrapper
 * FOREVER, which silently breaks every fixed overlay rendered inside page
 * content:
 *   - the admin sidebar stops sticking to the viewport (it scrolls away),
 *   - modals and the fullscreen product gallery get sized/positioned relative
 *     to the whole document instead of the screen (images appear at the very
 *     bottom of the page).
 * `transitionEnd` restores `filter: none` the moment the animation finishes,
 * and the completion handler strips any leftover inline styles as a safety
 * net so the wrapper always returns to a paint-neutral element.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const clearContainingBlockStyles = () => {
    const el = wrapperRef.current;
    if (!el) return;
    el.style.removeProperty("filter");
    el.style.removeProperty("transform");
    el.style.removeProperty("will-change");
  };

  return (
    <motion.div
      key={pathname}
      ref={wrapperRef}
      initial={{ opacity: 0, y: 16, scale: 0.997, filter: "blur(6px)" }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        // Restore `filter: none` when the animation ends so this wrapper never
        // remains a containing block for `position: fixed` descendants.
        transitionEnd: { filter: "none" },
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={clearContainingBlockStyles}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
