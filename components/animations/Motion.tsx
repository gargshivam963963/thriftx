"use client";

import {
    MotionConfig,
    motion,
    type HTMLMotionProps,
    type Transition,
    type Variants,
} from "framer-motion";
import type { ReactNode } from "react";

/* ─── CANONICAL MOTION TOKENS — the ONE source of truth for animation ───────
   Framer Motion cannot read CSS vars, so these numbers are the single TS
   mirror of app/globals.css: durations match --duration-* (fast 150ms,
   base 200ms, normal 300ms, slow 500ms, slower 700ms) and easings match
   --ease-*. Keep the two files in sync; nothing else may define durations. */
type Bezier = [number, number, number, number];

export const motionTokens = {
    duration: {
        instant: 0.12,
        fast: 0.15,
        base: 0.2,
        normal: 0.3,
        slow: 0.5,
        slower: 0.7,
        entrance: 0.55,
    },
    ease: {
        standard: [0.4, 0, 0.2, 1] as Bezier,
        out: [0, 0, 0.2, 1] as Bezier,
        spring: [0.34, 1.56, 0.64, 1] as Bezier,
    },
};

const DEFAULT_DURATION = motionTokens.duration.entrance;

export const viewport = {
    once: true,
    amount: 0.2,
};

export const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: DEFAULT_DURATION, ease: "easeOut" },
    },
};

export const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: DEFAULT_DURATION, ease: "easeOut" },
    },
};

export const scaleInVariants: Variants = {
    hidden: { opacity: 0, scale: 0.94 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: DEFAULT_DURATION, ease: "easeOut" },
    },
};

export const staggerContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};

interface MotionProps extends HTMLMotionProps<"div"> { }

export function FadeIn({ children, ...props }: MotionProps) {
    return (
        <motion.div
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function FadeUp({ children, ...props }: MotionProps) {
    return (
        <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function ScaleIn({ children, ...props }: MotionProps) {
    return (
        <motion.div
            variants={scaleInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({ children, ...props }: MotionProps) {
    return (
        <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, ...props }: MotionProps) {
    return (
        <motion.div variants={fadeUpVariants} {...props}>
            {children}
        </motion.div>
    );
}

/* ─── DIALOG / POPOVER / DRAWER VARIANTS — the ONE dialog motion ───────────
   Modal, ConfirmDialog, ConfirmPopover and every drawer resolve from these,
   so dialogs can never drift apart again. Durations/easings come from
   motionTokens above (which mirrors globals.css). */
export const modalBackdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: motionTokens.duration.base, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        transition: { duration: motionTokens.duration.fast, ease: "easeOut" },
    },
};

export const modalPanelVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: 12 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.out,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        y: 12,
        transition: {
            duration: motionTokens.duration.fast,
            ease: "easeOut",
        },
    },
};

/** Inline confirms speak the same motion language as modal panels. */
export const popoverVariants: Variants = modalPanelVariants;

const drawerTransition: Transition = {
    duration: motionTokens.duration.normal,
    ease: motionTokens.ease.standard,
};

const drawerExitTransition: Transition = {
    duration: motionTokens.duration.fast,
    ease: "easeOut",
};

export const drawerVariants: Record<"bottom" | "left" | "right", Variants> = {
    bottom: {
        hidden: { y: "100%" },
        visible: { y: 0, transition: drawerTransition },
        exit: { y: "100%", transition: drawerExitTransition },
    },
    left: {
        hidden: { x: "-100%" },
        visible: { x: 0, transition: drawerTransition },
        exit: { x: "-100%", transition: drawerExitTransition },
    },
    right: {
        hidden: { x: "100%" },
        visible: { x: 0, transition: drawerTransition },
        exit: { x: "100%", transition: drawerExitTransition },
    },
};

/** Tab indicator glide (replaces SegmentedControl's local spring). */
export const spring: Transition = {
    type: "spring",
    stiffness: 520,
    damping: 40,
    mass: 0.7,
};

/* ─── SHARED TRANSITIONS — micro-interactions resolve from here ──────────── */
export const transitions: {
    micro: Transition;
    normal: Transition;
    pageHeader: Transition;
    springSnappy: Transition;
    springSmooth: Transition;
} = {
    /** Buttons, icon toggles, press feedback (was 0.16s ad-hoc). */
    micro: { duration: motionTokens.duration.fast, ease: "easeOut" },
    /** Empty states, accordions, small entrances (was 0.25s ad-hoc). */
    normal: { duration: motionTokens.duration.normal, ease: "easeOut" },
    /** Page-title entrance — values unchanged, now token-sourced. */
    pageHeader: { duration: 0.32, ease: motionTokens.ease.standard },
    /** Dropdowns / popovers / icon toggles (replaces stiffness 400–520 springs). */
    springSnappy: { type: "spring", stiffness: 480, damping: 38, mass: 0.7 },
    /** Tab indicator glide (replaces SegmentedControl's local spring). */
    springSmooth: { type: "spring", stiffness: 520, damping: 40, mass: 0.7 },
};

/* ─── ACCORDION / DROPDOWN VARIANTS — one expand + one menu language ───────
   FilterAccordion, FilterCard, sort/page-size/theme dropdowns, accordions
   and share popovers resolve from these. */
export const chevronVariants: Variants = {
    closed: { rotate: 0, transition: { duration: motionTokens.duration.base } },
    open: { rotate: 180, transition: { duration: motionTokens.duration.base } },
};

export const accordionVariants: Variants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
        height: "auto",
        opacity: 1,
        transition: {
            duration: motionTokens.duration.normal,
            ease: motionTokens.ease.standard,
        },
    },
    exit: {
        height: 0,
        opacity: 0,
        transition: {
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.standard,
        },
    },
};

/** Small floating menus (sort, page-size, theme, notification, share). */
export const menuVariants: Variants = {
    hidden: { opacity: 0, y: -6, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: motionTokens.duration.fast,
            ease: motionTokens.ease.standard,
        },
    },
    exit: {
        opacity: 0,
        y: -6,
        scale: 0.96,
        transition: {
            duration: motionTokens.duration.fast,
            ease: "easeOut",
        },
    },
};

/** Sheet-style bottom panel (mobile filter drawer). */
export const sheetVariants: Variants = {
    hidden: { y: "100%" },
    visible: { y: 0, transition: { type: "spring", damping: 30, stiffness: 300 } },
    exit: { y: "100%", transition: { type: "spring", damping: 30, stiffness: 300 } },
};

/** Top-anchored search panel. */
export const searchPanelVariants: Variants = {
    hidden: { opacity: 0, y: -20, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", damping: 30, stiffness: 300 },
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        transition: {
            duration: motionTokens.duration.fast,
            ease: "easeOut",
        },
    },
};

/** Fullscreen image-preview lightbox (admin product previews). */
export const previewBackdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: motionTokens.duration.base, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        transition: { duration: motionTokens.duration.base, ease: "easeOut" },
    },
};

export const previewPanelVariants: Variants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: motionTokens.duration.normal,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        scale: 0.92,
        transition: {
            duration: motionTokens.duration.base,
            ease: "easeOut",
        },
    },
};

export const previewSlideVariants: Variants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: motionTokens.duration.base,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        x: -40,
        transition: {
            duration: motionTokens.duration.base,
            ease: "easeOut",
        },
    },
};

/** Staggered result items inside the search panel. */
export function staggerDelay(index: number, step = 0.03): Transition {
    return {
        duration: motionTokens.duration.base,
        ease: "easeOut",
        delay: index * step,
    };
}

/** Shared press feedback for tappable surfaces. */
export const press = {
    tap: { scale: 0.98 },
    /** Stronger press for small icon buttons (theme toggle, wishlist, close). */
    iconTap: { scale: 0.92 },
};

/** Shared lift feedback for cards / selectable surfaces. */
export const lift = {
    card: { y: -4 },
    row: { y: -2 },
};

/**
 * MotionProvider — applies `prefers-reduced-motion` to every Framer Motion
 * tree below it. Mount once near the root (see app/layout.tsx) instead of
 * wiring useReducedMotion into each component.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
