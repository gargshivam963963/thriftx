"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    CalendarDays,
    IndianRupee,
    Percent,
    Sparkles,
    Tag,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/lib/marketing/types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CouponEditorModalProps {
    /** Controlled visibility. */
    open: boolean;
    /** Coupon being edited, or `null` when creating a new one. */
    coupon: Coupon | null;
    /** Codes already taken by *other* coupons, used to block duplicates. */
    takenCodes: readonly string[];
    onClose: () => void;
    /** Called after a successful create/update so the list can reload. */
    onSaved: () => void | Promise<void>;
}

/** Mirrors the backend rule the admin marketing endpoint expects. */
const COUPON_CODE_PATTERN = /^[A-Z0-9_-]{3,40}$/;

type CouponField =
    | "code"
    | "discountValue"
    | "minOrderValue"
    | "expiresAt";

interface CouponFormState {
    code: string;
    discountType: Coupon["discountType"];
    /** Kept as a string so a half-typed number is never coerced to 0. */
    discountValue: string;
    minOrderValue: string;
    /** `datetime-local` value (local time, `YYYY-MM-DDTHH:mm`). */
    expiresAt: string;
    isActive: boolean;
}

const EMPTY_COUPON_FORM: CouponFormState = {
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderValue: "",
    expiresAt: "",
    isActive: true,
};

const FIELD_ERROR_IDS: Record<CouponField, string> = {
    code: "coupon-code-error",
    discountValue: "coupon-discount-error",
    minOrderValue: "coupon-min-order-error",
    expiresAt: "coupon-expiry-error",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** ISO timestamp → the `datetime-local` string an `<input>` expects. */
function toDatetimeLocal(value?: string) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const localOffset = date.getTimezoneOffset() * 60_000;

    return new Date(date.getTime() - localOffset).toISOString().slice(0, 16);
}

/** `datetime-local` string → the ISO timestamp the API stores. */
function toIsoOrEmpty(value: string) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/** Keep digits only so the inputs can never hold invalid text. */
function digitsOnly(raw: string) {
    return raw.replace(/\D/g, "");
}

/**
 * Customer-facing description, derived from the entered values so it can never
 * drift from the rules that are actually enforced.
 */
function buildCouponDescription(form: CouponFormState) {
    const value = Number(form.discountValue || 0);
    const minimum = Number(form.minOrderValue || 0);

    if (!value || value <= 0) {
        return "";
    }

    const discount =
        form.discountType === "percent" ? `${value}% off` : `₹${value} off`;

    return minimum > 0 ? `${discount} on orders above ₹${minimum}` : discount;
}

function couponToForm(coupon: Coupon): CouponFormState {
    return {
        code: String(coupon.code ?? ""),
        discountType: coupon.discountType === "flat" ? "flat" : "percent",
        discountValue:
            coupon.discountValue !== undefined && coupon.discountValue !== null
                ? String(coupon.discountValue)
                : "",
        minOrderValue:
            coupon.minOrderValue !== undefined &&
            coupon.minOrderValue !== null &&
            Number(coupon.minOrderValue) > 0
                ? String(coupon.minOrderValue)
                : "",
        expiresAt: toDatetimeLocal(coupon.expiresAt),
        isActive: coupon.isActive !== false,
    };
}


// ─────────────────────────────────────────────────────────────────────────────
// Field primitives — single source of truth for label/control/error styling
// ─────────────────────────────────────────────────────────────────────────────

const CONTROL_BASE =
    "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-body-sm text-foreground outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60";

const LABEL_BASE =
    "mb-1.5 block text-caption font-semibold uppercase tracking-wide text-muted-foreground";

const ERROR_BASE = "mt-1.5 text-body-sm font-medium text-destructive";

function FieldLabel({
    htmlFor,
    children,
    required,
}: {
    htmlFor: string;
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label htmlFor={htmlFor} className={LABEL_BASE}>
            {children}

            {required && (
                <span className="ml-1 text-destructive" aria-hidden="true">
                    *
                </span>
            )}
        </label>
    );
}

function FieldError({
    field,
    message,
}: {
    field: CouponField;
    message?: string;
}) {
    if (!message) {
        return null;
    }

    return (
        <p id={FIELD_ERROR_IDS[field]} role="alert" className={ERROR_BASE}>
            {message}
        </p>
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// Coupon editor modal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compact create/edit dialog for coupons.
 *
 * Deliberately exposes only the four inputs that change what the customer
 * pays: code, discount, minimum order and expiry. `maxDiscount`, `usageLimit`
 * and `description` stay out of the UI — the first two are sent as `null` and
 * the third is generated from the entered values.
 */
export default function CouponEditorModal({
    open,
    coupon,
    takenCodes,
    onClose,
    onSaved,
}: CouponEditorModalProps) {
    const [form, setForm] = useState<CouponFormState>(EMPTY_COUPON_FORM);
    const [errors, setErrors] = useState<
        Partial<Record<CouponField, string>>
    >({});
    const [saving, setSaving] = useState(false);

    const codeInputRef = useRef<HTMLInputElement>(null);
    const isEditing = coupon !== null;

    // Reset to a blank form or the coupon being edited, each time it opens,
    // and put the caret in the first field for fast keyboard entry.
    useEffect(() => {
        if (!open) {
            return;
        }

        setForm(coupon ? couponToForm(coupon) : EMPTY_COUPON_FORM);
        setErrors({});

        codeInputRef.current?.focus();
    }, [open, coupon]);

    const patch = (next: Partial<CouponFormState>) =>
        setForm((current) => ({ ...current, ...next }));

    const discountValue = Number(form.discountValue || 0);
    const preview = useMemo(() => buildCouponDescription(form), [form]);

    // Clear a field's error as soon as the admin edits it.
    const clearError = (field: CouponField) =>
        setErrors((current) => {
            if (!current[field]) {
                return current;
            }

            return { ...current, [field]: undefined };
        });

    const validate = (): CouponFormState | null => {
        const code = form.code.trim().toUpperCase();
        const minOrderValue = Number(form.minOrderValue || 0);
        const nextErrors: Partial<Record<CouponField, string>> = {};

        if (!code) {
            nextErrors.code = "Enter a coupon code.";
        } else if (!COUPON_CODE_PATTERN.test(code)) {
            nextErrors.code = "Use 3–40 letters, numbers, _ or -.";
        } else if (takenCodes.includes(code)) {
            nextErrors.code = `${code} already exists.`;
        }

        if (!Number.isFinite(discountValue) || discountValue <= 0) {
            nextErrors.discountValue = "Enter a discount value.";
        } else if (
            form.discountType === "percent" &&
            discountValue > 100
        ) {
            nextErrors.discountValue = "Percentage cannot be above 100%.";
        }

        if (!Number.isFinite(minOrderValue) || minOrderValue < 0) {
            nextErrors.minOrderValue =
                "Minimum order cannot be negative.";
        }

        if (form.expiresAt) {
            const expiry = new Date(form.expiresAt);

            if (Number.isNaN(expiry.getTime())) {
                nextErrors.expiresAt = "Enter a valid expiry.";
            } else if (!isEditing && expiry.getTime() <= Date.now()) {
                nextErrors.expiresAt = "Expiry must be in the future.";
            }
        }

        setErrors(nextErrors);

        const firstError = (Object.keys(nextErrors) as CouponField[])[0];

        if (firstError) {
            document.getElementById(firstError)?.focus();

            return null;
        }

        return {
            ...form,
            code,
            discountValue: String(discountValue),
            minOrderValue: String(minOrderValue),
            expiresAt: toIsoOrEmpty(form.expiresAt),
        };
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Guard against a double submit while a request is in flight.
        if (saving) {
            return;
        }

        const validated = validate();

        if (!validated) {
            return;
        }

        setSaving(true);

        try {
            const response = await fetch("/api/admin/marketing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "coupon",
                    action: isEditing ? "update" : "create",
                    id: coupon?.id,
                    data: {
                        code: validated.code,
                        discountType: validated.discountType,
                        discountValue: Number(validated.discountValue),
                        minOrderValue: Number(validated.minOrderValue),

                        // Intentionally not exposed in the UI: unlimited
                        // usage and no percentage cap.
                        maxDiscount: null,
                        usageLimit: null,

                        expiresAt: validated.expiresAt,
                        description: buildCouponDescription(validated),
                        isActive: validated.isActive !== false,
                    },
                }),
            });

            const result: unknown = await response.json();
            const message =
                typeof result === "object" &&
                result !== null &&
                "message" in result &&
                typeof result.message === "string"
                    ? result.message
                    : isEditing
                        ? "Failed to update coupon"
                        : "Failed to create coupon";

            if (!response.ok) {
                throw new Error(message);
            }

            toast.success(
                isEditing
                    ? "Coupon updated successfully"
                    : "Coupon created successfully",
            );

            await onSaved();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to save coupon",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            dismissible={!saving}
            title={isEditing ? "Edit coupon" : "New coupon"}
            description={
                isEditing
                    ? "Update the rules this coupon applies."
                    : "Four fields are all a customer needs."
            }
            footer={
                <>
                    <div className="mr-auto flex items-center gap-2">
                        <span
                            id="coupon-active-label"
                            className="text-body-sm font-medium text-foreground"
                        >
                            Active
                        </span>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={form.isActive}
                            aria-labelledby="coupon-active-label"
                            onClick={() =>
                                patch({ isActive: !form.isActive })
                            }
                            className={cn(
                                "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                form.isActive
                                    ? "bg-foreground"
                                    : "bg-muted",
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                                    form.isActive
                                        ? "translate-x-5"
                                        : "translate-x-0.5",
                                )}
                            />
                        </button>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="coupon-editor-form"
                        size="md"
                        loading={saving}
                        loadingText="Saving..."
                        disabled={saving}
                        leftIcon={<Tag size={16} />}
                    >
                        {isEditing ? "Save changes" : "Create coupon"}
                    </Button>
                </>
            }
        >
            <form
                id="coupon-editor-form"
                onSubmit={handleSubmit}
                noValidate
                className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2"
            >
                {/* ── Row 1 · 1. Coupon code ── */}
                <div>
                    <FieldLabel htmlFor="code" required>
                        Coupon code
                    </FieldLabel>

                    <input
                        ref={codeInputRef}
                        id="code"
                        name="code"
                        value={form.code}
                        onChange={(event) => {
                            clearError("code");
                            patch({
                                code: event.target.value
                                    .toUpperCase()
                                    .replace(/\s+/g, ""),
                            });
                        }}
                        placeholder="WELCOME50"
                        autoComplete="off"
                        spellCheck={false}
                        aria-invalid={Boolean(errors.code)}
                        aria-describedby={
                            errors.code ? FIELD_ERROR_IDS.code : undefined
                        }
                        className={cn(
                            CONTROL_BASE,
                            "font-semibold tracking-wide",
                            errors.code && "border-destructive",
                        )}
                    />

                    <FieldError field="code" message={errors.code} />
                </div>

                {/* ── Row 1 · 2. Discount ── */}
                <div>
                    <FieldLabel htmlFor="discountValue" required>
                        Discount
                    </FieldLabel>

                    <div
                        className={cn(
                            "flex items-center rounded-xl border border-border bg-card transition-colors focus-within:border-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
                            errors.discountValue && "border-destructive",
                        )}
                    >
                        <div
                            role="group"
                            aria-label="Discount type"
                            className="flex shrink-0 items-center gap-0.5 border-r border-border bg-muted p-1"
                        >
                            {(
                                [
                                    {
                                        value: "percent",
                                        label: "%",
                                        icon: <Percent size={14} />,
                                    },
                                    {
                                        value: "flat",
                                        label: "₹",
                                        icon: <IndianRupee size={14} />,
                                    },
                                ] as const
                            ).map((option) => {
                                const selected =
                                    form.discountType === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() =>
                                            patch({
                                                discountType: option.value,
                                            })
                                        }
                                        className={cn(
                                            "inline-flex h-8 min-w-9 items-center justify-center gap-1 rounded-lg text-body-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                            selected
                                                ? "bg-foreground text-background shadow-sm"
                                                : "text-muted-foreground hover:text-foreground",
                                        )}
                                    >
                                        {option.icon}
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>

                        <input
                            id="discountValue"
                            name="discountValue"
                            type="text"
                            inputMode="numeric"
                            value={form.discountValue}
                            onChange={(event) => {
                                clearError("discountValue");
                                patch({
                                    discountValue: digitsOnly(
                                        event.target.value,
                                    ),
                                });
                            }}
                            placeholder={
                                form.discountType === "percent"
                                    ? "50"
                                    : "100"
                            }
                            aria-invalid={Boolean(errors.discountValue)}
                            aria-describedby={
                                errors.discountValue
                                    ? FIELD_ERROR_IDS.discountValue
                                    : undefined
                            }
                            className="h-10 w-full min-w-0 rounded-r-xl bg-transparent px-3 text-body-sm font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
                        />
                    </div>

                    <FieldError
                        field="discountValue"
                        message={errors.discountValue}
                    />
                </div>

                {/* ── Row 2 · 3. Minimum order ── */}
                <div>
                    <FieldLabel htmlFor="minOrderValue">
                        Minimum order
                    </FieldLabel>

                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center text-muted-foreground">
                            <IndianRupee size={15} />
                        </div>

                        <input
                            id="minOrderValue"
                            name="minOrderValue"
                            type="text"
                            inputMode="numeric"
                            value={form.minOrderValue}
                            onChange={(event) => {
                                clearError("minOrderValue");
                                patch({
                                    minOrderValue: digitsOnly(
                                        event.target.value,
                                    ),
                                });
                            }}
                            placeholder="499"
                            aria-invalid={Boolean(errors.minOrderValue)}
                            aria-describedby={
                                errors.minOrderValue
                                    ? FIELD_ERROR_IDS.minOrderValue
                                    : undefined
                            }
                            className={cn(
                                CONTROL_BASE,
                                "pl-9",
                                errors.minOrderValue && "border-destructive",
                            )}
                        />
                    </div>

                    <FieldError
                        field="minOrderValue"
                        message={errors.minOrderValue}
                    />
                </div>

                {/* ── Row 2 · 4. Expiry ── */}
                <div>
                    <FieldLabel htmlFor="expiresAt">Expiry</FieldLabel>

                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center text-muted-foreground">
                            <CalendarDays size={15} />
                        </div>

                        <input
                            id="expiresAt"
                            name="expiresAt"
                            type="datetime-local"
                            value={form.expiresAt}
                            onChange={(event) => {
                                clearError("expiresAt");
                                patch({ expiresAt: event.target.value });
                            }}
                            aria-invalid={Boolean(errors.expiresAt)}
                            aria-describedby={
                                errors.expiresAt
                                    ? FIELD_ERROR_IDS.expiresAt
                                    : undefined
                            }
                            className={cn(
                                CONTROL_BASE,
                                "pl-9 pr-2",
                                errors.expiresAt && "border-destructive",
                            )}
                        />
                    </div>

                    <FieldError
                        field="expiresAt"
                        message={errors.expiresAt}
                    />
                </div>

                {/* Auto-generated customer description (read-only preview) */}
                <div className="sm:col-span-2">
                    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-3.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
                            <Sparkles size={15} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                                Customer description
                            </p>

                            <p className="mt-0.5 text-body-sm font-medium text-foreground">
                                {preview ||
                                    "Enter a discount value to preview the customer-facing description."}
                            </p>

                            <p className="mt-0.5 text-body-sm text-muted-foreground">
                                Generated automatically from the coupon rules.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
