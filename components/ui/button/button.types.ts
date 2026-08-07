import type { ReactNode } from "react";
import type { HTMLMotionProps } from "framer-motion";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "./button.styles";

/**
 * Button Component Props
 *
 * Extends framer-motion button props while adding
 * design-system specific variants and utilities.
 */
export interface ButtonProps
  extends HTMLMotionProps<"button">, VariantProps<typeof buttonVariants> {
  /**
   * Displays a loading spinner and disables interaction.
   * @default false
   */
  loading?: boolean;

  /**
   * Custom text shown while loading.
   * @default "Loading..."
   */
  loadingText?: string;

  /**
   * Shows a success checkmark icon.
   * @default false
   */
  success?: boolean;

  /**
   * Custom text shown on success.
   * @default "Success"
   */
  successText?: string;

  /**
   * Makes the button take the full width of its parent.
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Render children as a different element (e.g., Next `Link`) while preserving
   * button styles. When true, `Button` uses Radix `Slot` so the immediate child
   * element receives the button's className and attributes.
   */
  asChild?: boolean;

  /**
   * Optional icon displayed before the button text.
   */
  leftIcon?: ReactNode;

  /**
   * Optional icon displayed after the button text.
   */
  rightIcon?: ReactNode;
}
