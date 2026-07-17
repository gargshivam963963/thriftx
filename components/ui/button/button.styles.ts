import { cva } from "class-variance-authority";

/**
 * THRIFTX Design System
 * Button Variants
 */

export const buttonVariants = cva(
  [
    // Layout
    "inline-flex items-center justify-center gap-2",

    // Typography
    "font-medium",
    "whitespace-nowrap",

    // Shape
    "rounded-xl",

    // Animation
    "transition-all duration-200 ease-out",

    // Interaction
    "select-none",
    "active:scale-[0.98]",

    // Accessibility
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-black/20",
    "focus-visible:ring-offset-2",

    // Disabled
    "disabled:pointer-events-none",
    "disabled:opacity-50",

    // Loading
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
  ],
  {
    variants: {
      /**
       * Button Style
       */
      variant: {
        primary:
          "bg-black text-white hover:bg-neutral-800",

        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",

        outline:
          "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",

        ghost:
          "bg-transparent text-neutral-900 hover:bg-neutral-100",

        danger:
          "bg-red-600 text-white hover:bg-red-700",

        success:
          "bg-green-600 text-white hover:bg-green-700",
      },

      /**
       * Sizes
       */
      size: {
        xs: "h-8 px-3 text-xs",

        sm: "h-9 px-4 text-sm",

        md: "h-11 px-5 text-sm",

        lg: "h-12 px-6 text-base",

        xl: "h-14 px-8 text-lg",
      },

      /**
       * Border Radius
       */
      rounded: {
        none: "rounded-none",

        sm: "rounded-md",

        md: "rounded-lg",

        lg: "rounded-xl",

        full: "rounded-full",
      },

      /**
       * Elevation
       */
      shadow: {
        none: "",

        sm: "shadow-sm",

        md: "shadow-md",

        lg: "shadow-lg",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "lg",
      shadow: "none",
    },
  }
);