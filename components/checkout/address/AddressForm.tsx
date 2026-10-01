
"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    ArrowRight,
    Home,
    BriefcaseBusiness,
    Building2,
    User,
    MapPin,
    Building,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/ui/FloatingInput";
import type { Address, CreateAddressPayload } from "@/lib/types/address";

const phoneSchema = z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

const addressSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name must contain at least 2 characters")
        .max(100, "Full name is too long"),

    phone: phoneSchema,

    alternatePhone: z
        .string()
        .trim()
        .refine(
            (value) => value === "" || /^[6-9]\d{9}$/.test(value),
            "Enter a valid 10-digit alternate mobile number"
        ),

    addressLine1: z
        .string()
        .trim()
        .min(5, "Enter at least 5 characters")
        .max(200, "Address is too long"),

    addressLine2: z
        .string()
        .trim()
        .max(200, "Address is too long"),

    landmark: z
        .string()
        .trim()
        .max(100, "Landmark is too long"),

    city: z
        .string()
        .trim()
        .min(2, "City must contain at least 2 characters")
        .max(80, "City name is too long"),

    state: z
        .string()
        .trim()
        .min(2, "State must contain at least 2 characters")
        .max(80, "State name is too long"),

    pincode: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "PIN Code must contain exactly 6 digits"),

    type: z.enum(["Home", "Work", "Other"]),
});

type FormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
    initialData?: Address | null;
    onCancel: () => void;
    onSave: (
        data: CreateAddressPayload,
        addressId?: string
    ) => void | Promise<void>;
}

const emptyValues: FormValues = {
    fullName: "",
    phone: "",
    alternatePhone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    type: "Home",
};

const typeOptions = [
    {
        value: "Home" as const,
        icon: Home,
        color: "bg-amber-100 text-amber-700 border-amber-200",
        desc: "Deliver to my home address",
    },
    {
        value: "Work" as const,
        icon: BriefcaseBusiness,
        color: "bg-blue-100 text-blue-700 border-blue-200",
        desc: "Deliver to my workplace",
    },
    {
        value: "Other" as const,
        icon: Building2,
        color: "bg-purple-100 text-purple-700 border-purple-200",
        desc: "Deliver to another location",
    },
];

const stagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05,
        },
    },
};

const fadeUpItem = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut" as const,
        },
    },
};

function SectionCard({
    icon,
    label,
    children,
}: {
    icon: ReactNode;
    label: string;
    children: ReactNode;
}) {
    return (
        <motion.section
            variants={fadeUpItem}
            className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
        >
            <div className="flex items-center gap-2 border-b border-border bg-subtle/80 px-4 py-3 sm:px-5">
                <div className="rounded-lg bg-foreground p-1.5 text-white shadow-sm">
                    {icon}
                </div>

                <h3 className="text-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                </h3>
            </div>

            <div className="p-4 sm:p-5">{children}</div>
        </motion.section>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return (
        <motion.p
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            role="alert"
            className="mt-1.5 px-1 text-small text-error"
        >
            {message}
        </motion.p>
    );
}

export default function AddressForm({
    initialData,
    onCancel,
    onSave,
}: AddressFormProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: emptyValues,
        mode: "onBlur",
    });

    useEffect(() => {
        if (!initialData) {
            reset(emptyValues);
            return;
        }

        reset({
            fullName: initialData.fullName,
            phone: initialData.phone,
            alternatePhone: initialData.alternatePhone ?? "",
            addressLine1: initialData.addressLine1,
            addressLine2: initialData.addressLine2 ?? "",
            landmark: initialData.landmark ?? "",
            city: initialData.city,
            state: initialData.state,
            pincode: initialData.pincode,
            type: initialData.type,
        });
    }, [initialData, reset]);

    const selectedType = useWatch({
        control,
        name: "type",
    });

    const submit = useCallback(
        async (values: FormValues) => {
            const payload: CreateAddressPayload = {
                fullName: values.fullName.trim(),
                phone: values.phone.trim(),
                alternatePhone: values.alternatePhone.trim() || "",
                addressLine1: values.addressLine1.trim(),
                addressLine2: values.addressLine2.trim() || "",
                landmark: values.landmark.trim() || "",
                city: values.city.trim(),
                state: values.state.trim(),
                pincode: values.pincode.trim(),
                type: values.type,
            };

            await onSave(payload, initialData?.$id);
        },
        [initialData?.$id, onSave]
    );

    const selectedOption = typeOptions.find(
        (option) => option.value === selectedType
    );

    return (
        <motion.form
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit(submit)}
            noValidate
            aria-busy={isSubmitting}
            className="space-y-5"
        >
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
            >
                <h2 className="text-heading-3 font-bold tracking-tight text-foreground">
                    {initialData ? "Edit Address" : "New Delivery Address"}
                </h2>

                <p className="mt-1.5 text-body-sm leading-relaxed text-muted-foreground">
                    {initialData
                        ? "Update your delivery address details below."
                        : "Fill in the details below to add a new shipping address."}
                </p>
            </motion.div>

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="space-y-5"
            >
                <SectionCard
                    icon={<User size={14} aria-hidden="true" />}
                    label="Personal Information"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <FloatingInput
                                label="Full Name"
                                autoComplete="name"
                                maxLength={100}
                                required
                                aria-invalid={Boolean(errors.fullName)}
                                aria-describedby={
                                    errors.fullName
                                        ? "address-fullname-error"
                                        : undefined
                                }
                                error={errors.fullName?.message}
                                {...register("fullName")}
                            />

                            <div id="address-fullname-error">
                                <FieldError message={errors.fullName?.message} />
                            </div>
                        </div>

                        <div>
                            <FloatingInput
                                label="Phone Number"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                maxLength={10}
                                required
                                aria-invalid={Boolean(errors.phone)}
                                aria-describedby={
                                    errors.phone
                                        ? "address-phone-error"
                                        : undefined
                                }
                                error={errors.phone?.message}
                                {...register("phone")}
                            />

                            <div id="address-phone-error">
                                <FieldError message={errors.phone?.message} />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <FloatingInput
                                label="Alternate Phone (Optional)"
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                aria-invalid={Boolean(errors.alternatePhone)}
                                error={errors.alternatePhone?.message}
                                {...register("alternatePhone")}
                            />

                            <FieldError
                                message={errors.alternatePhone?.message}
                            />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard
                    icon={<MapPin size={14} aria-hidden="true" />}
                    label="Address Details"
                >
                    <div className="space-y-4">
                        <div>
                            <FloatingInput
                                label="Flat / House / Building / Apartment"
                                autoComplete="address-line1"
                                maxLength={200}
                                required
                                aria-invalid={Boolean(errors.addressLine1)}
                                error={errors.addressLine1?.message}
                                {...register("addressLine1")}
                            />

                            <FieldError
                                message={errors.addressLine1?.message}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <FloatingInput
                                    label="Area / Street / Locality"
                                    autoComplete="address-line2"
                                    maxLength={200}
                                    error={errors.addressLine2?.message}
                                    {...register("addressLine2")}
                                />

                                <FieldError
                                    message={errors.addressLine2?.message}
                                />
                            </div>

                            <div>
                                <FloatingInput
                                    label="Landmark (Optional)"
                                    maxLength={100}
                                    error={errors.landmark?.message}
                                    {...register("landmark")}
                                />

                                <FieldError
                                    message={errors.landmark?.message}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <FloatingInput
                                    label="PIN Code"
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                    maxLength={6}
                                    required
                                    aria-invalid={Boolean(errors.pincode)}
                                    error={errors.pincode?.message}
                                    {...register("pincode")}
                                />

                                <FieldError
                                    message={errors.pincode?.message}
                                />
                            </div>

                            <div>
                                <FloatingInput
                                    label="City"
                                    autoComplete="address-level2"
                                    maxLength={80}
                                    required
                                    error={errors.city?.message}
                                    {...register("city")}
                                />

                                <FieldError message={errors.city?.message} />
                            </div>

                            <div>
                                <FloatingInput
                                    label="State"
                                    autoComplete="address-level1"
                                    maxLength={80}
                                    required
                                    error={errors.state?.message}
                                    {...register("state")}
                                />

                                <FieldError message={errors.state?.message} />
                            </div>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard
                    icon={<Building size={14} aria-hidden="true" />}
                    label="Address Type"
                >
                    <div
                        className="grid grid-cols-3 gap-2.5 sm:gap-3"
                        role="group"
                        aria-label="Choose address type"
                    >
                        {typeOptions.map(
                            ({ value, icon: Icon, color }) => {
                                const isSelected = selectedType === value;

                                return (
                                    <motion.button
                                        key={value}
                                        type="button"
                                        aria-pressed={isSelected}
                                        disabled={isSubmitting}
                                        onClick={() =>
                                            setValue("type", value, {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                                shouldValidate: true,
                                            })
                                        }
                                        whileHover={{ y: -2, scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        className={`relative overflow-hidden rounded-2xl border-2 p-3 text-center transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 sm:p-4 ${isSelected
                                            ? "border-foreground bg-foreground text-background shadow-lg"
                                            : "border-border bg-card text-muted-foreground hover:border-foreground hover:shadow-md"
                                            }`}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                layoutId="address-type-background"
                                                className="absolute inset-0 bg-foreground"
                                                initial={false}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30,
                                                }}
                                            />
                                        )}

                                        <div className="relative z-10 flex flex-col items-center gap-2">
                                            <div
                                                className={`rounded-xl p-2 ${isSelected
                                                    ? "bg-background/15"
                                                    : "bg-muted"
                                                    }`}
                                            >
                                                <Icon
                                                    size={18}
                                                    aria-hidden="true"
                                                />
                                            </div>

                                            <span className="text-body-sm font-semibold">
                                                {value}
                                            </span>
                                        </div>
                                    </motion.button>
                                );
                            }
                        )}
                    </div>

                    {selectedOption && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-3 flex items-center gap-2 rounded-xl bg-muted px-4 py-3"
                        >
                            <div
                                className={`rounded-lg p-1.5 ${selectedOption.color}`}
                            >
                                <selectedOption.icon
                                    size={14}
                                    aria-hidden="true"
                                />
                            </div>

                            <span className="text-body-sm text-muted-foreground">
                                {selectedOption.desc}
                            </span>
                        </motion.div>
                    )}
                </SectionCard>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between gap-3 border-t border-border pt-6"
            >
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-xl"
                    leftIcon={<ArrowLeft size={16} />}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    loading={isSubmitting}
                    loadingText="Saving..."
                    disabled={isSubmitting}
                    className="rounded-xl px-5 shadow-lg shadow-foreground/20 sm:px-7"
                    rightIcon={<ArrowRight size={16} />}
                >
                    {initialData ? "Save Changes" : "Save Address"}
                </Button>
            </motion.div>
        </motion.form>
    );
}