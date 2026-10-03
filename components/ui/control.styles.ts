/**
 * THRIFTX Control System — Single Source of Truth
 * ==============================================
 * Every interactive control in the shop toolbar, search, sort, chips, and
 * filter sidebar must derive from these tokens so that heights, radii, icon
 * sizes, font sizes, weights, padding, transitions, focus rings, disabled,
 * and loading styles are IDENTICAL across dark & light themes.
 *
 * Heights: 40px mobile (`h-10`) / 44px desktop (`md:h-11`).
 * Radius:  rounded-xl (matches the Button `lg` preset).
 * Icon:    16px (`h-4 w-4`).
 * Spacing: 4 / 8 / 12 / 16 px scale within controls.
 */

/** Standard interactive-control height (mobile 40px, desktop 44px). */
export const controlHeight = "h-10 md:h-11";

/** Standard border radius for controls. */
export const controlRadius = "rounded-xl";

/** Standard horizontal padding (16px). */
export const controlPadding = "px-4";

/** Standard font size + weight for control labels. */
export const controlText = "font-medium text-sm leading-normal";

/** Standard gap between icon and label (8px). */
export const controlGap = "gap-2";

/** Standard icon size (16px). */
export const controlIcon = "h-4 w-4";

/** Standard transition duration. */
export const controlTransition = "transition-all duration-200 ease-out";

/** Standard focus-visible ring (theme aware). */
export const controlFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Standard disabled state. */
export const controlDisabled =
  "disabled:pointer-events-none disabled:opacity-50";

/** Standard loading state (shared by spinner usage). */
export const controlLoading = "[&_svg[data-loading]]:animate-spin";

/**
 * Base tokens for a bordered control that visually matches the search input
 * and sort trigger (background card, border-border, theme aware).
 */
export const controlSurface = [
  "border border-border bg-card text-foreground",
  "hover:border-foreground/60",
  "dark:border-border dark:bg-card dark:text-foreground",
  "dark:hover:border-foreground/60",
].join(" ");

/** Fully assembled base for a control trigger/button. */
export const controlBase = [
  controlHeight,
  controlRadius,
  controlPadding,
  controlText,
  controlGap,
  "inline-flex items-center justify-center",
  "whitespace-nowrap select-none",
  controlTransition,
  controlFocusRing,
  controlDisabled,
  "cursor-pointer",
].join(" ");

/**
 * Filter chip tokens — used by the selected-filter chip system.
 * Keeps chips on the 4/8/12 spacing scale and the 40px-height language.
 */
export const chipBase = [
  "inline-flex items-center gap-1.5",
  "h-8 rounded-full",
  "px-3 text-sm font-medium",
  "border border-border bg-card text-foreground",
  "shadow-card",
  "transition-all duration-200 ease-out",
  "hover:border-foreground/60 hover:bg-muted dark:hover:bg-card",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
].join(" ");

/** Filter-chip remove (X) icon button. */
export const chipRemove = [
  "flex h-4 w-4 items-center justify-center rounded-full",
  "text-muted-foreground",
  "transition-colors duration-150",
  "hover:text-foreground hover:opacity-90",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
].join(" ");
