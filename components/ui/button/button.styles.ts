import { cva } from "class-variance-authority";

/**
 * THRIFTX Design System
 * Button Variants — Premium, Modern, Production-Grade
 *
 * Uses the design-token type scale (text-label / text-button) instead of
 * arbitrary Tailwind font sizes so every button stays consistent & responsive.
 */

export const buttonVariants = cva(
  [
    // Layout
    "group inline-flex items-center justify-center gap-2.5",

    // Typography
    "font-medium leading-none",
    "whitespace-nowrap",
    "select-none",

    // Shape
    "rounded-xl",

    // Animation
    "transition-all duration-200 ease-out",
    "transition-shadow",

    // Interaction
    "active:scale-[0.97]",

    // Accessibility
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ring",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background",

    // Disabled
    "disabled:pointer-events-none",
    "disabled:opacity-50",

    // SVG children
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg]:text-current",
    "[&_svg]:stroke-current",
    "[&_svg]:fill-none",

    // Cursor
    "cursor-pointer",
  ],
  {
    variants: {
      /**
       * Visual variants
       */

      variant: {
        /**
         * Primary Action
         */
        primary: [
          // Semantic theme-aware colors
          "bg-[color:var(--foreground)]",
          "text-[color:var(--background)]",

          "border border-transparent",

          // Hover / active
          "hover:bg-[color:color-mix(in_srgb,var(--foreground)_90%,transparent)]",
          "active:bg-[color:color-mix(in_srgb,var(--foreground)_95%,transparent)]",

          // Focus
          "focus-visible:ring-ring",

          // Disabled
          "disabled:bg-[color:color-mix(in_srgb,var(--foreground)_60%,transparent)]",
          "disabled:!text-[color:var(--background)]",
        ],

        /**
         * Secondary Surface
         */
        secondary: [
          "bg-secondary",
          "text-secondary-foreground",
          "border border-transparent",

          "hover:bg-secondary/80",
          "active:bg-secondary/90",

          "focus-visible:ring-ring",
        ],

        /**
         * Outline
         */
        outline: [
          "border",
          "border-border",

          "bg-background",
          "text-foreground",

          "hover:bg-muted",
          "hover:text-foreground",

          "active:bg-muted/80",

          "focus-visible:ring-ring",
        ],

        /**
         * Ghost
         */
        ghost: [
          "bg-transparent",

          "text-muted-foreground",

          "hover:bg-muted",
          "hover:text-foreground",

          "active:bg-muted/80",

          "focus-visible:ring-ring",
        ],

        /**
         * Glass
         */
        glass: [
          "border border-border/50",

          "bg-card/70",

          "backdrop-blur-xl",

          "text-foreground",

          "hover:bg-card",

          "shadow-lg",
        ],

        /**
         * Success
         */
        success: [
          "bg-success",
          "text-success-foreground",

          "hover:opacity-90",

          "focus-visible:ring-success",
        ],

        /**
         * Danger
         */
        danger: [
          "bg-destructive",
          "text-destructive-foreground",

          "hover:opacity-90",

          "focus-visible:ring-destructive",
        ],

        /**
         * Link
         */
        link: [
          "bg-transparent",

          "text-foreground",

          "underline-offset-4",

          "hover:underline",

          "p-0",
          "h-auto",
        ],

        /**
         * Dark Surface
         */
        dark: [
          "bg-neutral-900",

          "text-white",

          "hover:bg-neutral-800",

          "dark:bg-white",

          "dark:text-black",

          "dark:hover:bg-neutral-100",
        ],

        /**
         * Light Surface
         */
        light: [
          "bg-white",

          "text-black",

          "border border-border",

          "hover:bg-muted",

          "dark:bg-card",

          "dark:text-foreground",

          "dark:hover:bg-muted",
        ],
      },

      /**
       * Size presets — consistent heights with token-based type scale
       */
      size: {
        xs: "h-7 px-2.5 text-badge gap-1.5",
        sm: "h-9 px-3.5 text-label gap-2",
        md: "h-11 px-5 text-button gap-2",
        lg: "h-12 px-6 text-body gap-2.5",
        xl: "h-14 px-8 text-body-lg gap-3",

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
