"use client";

import { cn } from "@/lib/utils";

export interface SwitchProps {
    /** Controlled on/off state. */
    checked: boolean;
    /** Called with the *next* value when the user toggles. */
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    /** Accent colour of the "on" track. Defaults to the theme primary. */
    tone?: "default" | "violet";
    id?: string;
    /** Accessible name — use when there is no visible label bound via aria-labelledby. */
    "aria-label"?: string;
    /** id of a visible <label>/<span> that names this switch. */
    "aria-labelledby"?: string;
    className?: string;
}

const TONE_ON = {
    default: "bg-foreground",
    violet: "bg-violet-500",
} as const;

/**
 * Switch — the app's ONE toggle primitive.
 *
 * Every on/off control in THRIFTX resolves here so switches can never drift
 * apart again (previously the admin coupon editor, marketing manager and the
 * product AI-fill panel each hand-rolled their own with mismatched sizes and
 * colours). Motion, focus ring, sizing and the on/off track colours all come
 * from design-system tokens.
 *
 * Accessibility: a real `role="switch"` with `aria-checked`, keyboard
 * operable (it's a <button>), and a visible focus ring.
 */
export function Switch({
    checked,
    onChange,
    disabled = false,
    tone = "default",
    className,
    ...aria
}: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => {
                if (!disabled) {
                    onChange(!checked);
                }
            }}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:cursor-not-allowed disabled:opacity-50",
                checked ? TONE_ON[tone] : "bg-muted",
                className,
            )}
            {...aria}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-sm ring-0 transition-transform",
                    checked ? "translate-x-5" : "translate-x-0.5",
                )}
            />
        </button>
    );
}

export default Switch;
