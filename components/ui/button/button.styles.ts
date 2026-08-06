import { cva } from "class-variance-authority";

/**
 * THRIFTX Design System
 * Button Variants — Premium, Modern, Production-Grade
 */

export const buttonVariants = cva(
  [
    // Layout
    "group inline-flex items-center justify-center gap-2",

    // Typography
    "font-medium leading-none",
    "whitespace-nowrap",
    "select-none",

    // Shape
    "rounded-xl",

    // Animation
    "transition-all duration-200 ease-out",

    // Interaction
    "active:scale-[0.97]",

    // Accessibility
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-black/20",
    "focus-visible:ring-offset-2",
    "dark:focus-visible:ring-white/20",

    // Disabled
    "disabled:pointer-events-none",
    "disabled:opacity-50",

    // SVG children
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg]:h-[1.125em]",
    "[&_svg]:w-[1.125em]",

    // Cursor
    "cursor-pointer",
  ],
  {
    variants: {
      /**
       * Visual variants
       */
      variant: {
        // ── Solid Primary ───────────────────────────
        primary: [
          "bg-foreground text-background",
          "hover:bg-foreground/90",
          "shadow-sm hover:shadow-md",
          "dark:bg-foreground dark:text-background",
          "dark:hover:bg-foreground/90",
        ],

        // ── Subtle Secondary ────────────────────────
        secondary: [
          "bg-muted text-foreground",
          "hover:bg-muted-foreground/20",
          "dark:bg-card dark:text-foreground",
          "dark:hover:bg-muted",
        ],

        // ── Bordered Outline ────────────────────────
        outline: [
          "border border-border bg-transparent text-foreground",
          "hover:bg-muted",
          "dark:border-border dark:text-foreground",
          "dark:hover:bg-card",
        ],

        // ── Ghost (no background) ───────────────────
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-muted",
          "dark:text-foreground",
          "dark:hover:bg-card",
        ],

        // ── Glass morphism ──────────────────────────
        glass: [
          "border border-white/30 bg-white/70 text-foreground",
          "backdrop-blur-xl shadow-lg",
          "hover:bg-white/80 hover:shadow-xl",
          "dark:border-border dark:bg-card/70 dark:text-foreground",
          "dark:hover:bg-card",
        ],

        // ── Danger / Destructive ────────────────────
        danger: [
          "bg-red-600 text-white",
          "hover:bg-red-700",
          "shadow-sm hover:shadow-md",
          "dark:bg-red-700 dark:hover:bg-red-600",
        ],

        // ── Success / Confirm ───────────────────────
        success: [
          "bg-emerald-600 text-white",
          "hover:bg-emerald-700",
          "shadow-sm hover:shadow-md",
          "dark:bg-emerald-700 dark:hover:bg-emerald-600",
        ],

        // ── Link (looks like an anchor) ─────────────
        link: [
          "bg-transparent text-foreground underline-offset-4",
          "hover:underline",
          "dark:text-foreground",
        ],
      },

      /**
       * Size presets
       */
      size: {
        xs: "h-7 px-2.5 text-[0.6875rem] gap-1.5",
        sm: "h-9 px-3.5 text-[0.8125rem] gap-1.5",
        md: "h-11 px-5 text-[0.9375rem]",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-[1.0625rem]",

        // Icon-only sizes
        iconXs: "h-7 w-7 p-0",
        iconSm: "h-9 w-9 p-0",
        iconMd: "h-11 w-11 p-0",
        iconLg: "h-12 w-12 p-0",
        iconXl: "h-14 w-14 p-0",
      },

      /**
       * Border radius
       */
      rounded: {
        none: "rounded-none",
        sm: "rounded-md",
        md: "rounded-lg",
        lg: "rounded-xl",
        xl: "rounded-2xl",
        full: "rounded-full",
      },

      /**
       * Shadow presets
       */
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "lg",
      shadow: "none",
    },
  },
);
