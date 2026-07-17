import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "./button.styles";

/**
 * Button Component Props
 *
 * Extends the native HTML button attributes while adding
 * design-system specific variants and utilities.
 */
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Displays a loading spinner and disables interaction.
   */
  loading?: boolean;

  /**
   * Makes the button take the full width of its parent.
   */
  fullWidth?: boolean;

  /**
   * Optional icon displayed before the button text.
   */
  leftIcon?: ReactNode;

  /**
   * Optional icon displayed after the button text.
   */
  rightIcon?: ReactNode;
}