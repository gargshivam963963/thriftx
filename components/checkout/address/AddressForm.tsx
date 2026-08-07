"use client";

import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
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
    Phone,
    MapPin,
    Hash,
    Building,
    MapPinned,
    Smartphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/ui/FloatingInput";
import type { Address, CreateAddressPayload } from "@/lib/types/address";

const addressSchema = z.object({
    fullName: z.string().trim().min(2, "Full name is required"),
    phone: z
        .string()
        .trim()
        .min(10, "Phone must be 10 digits")
        .max(10, "Phone must be 10 digits"),
    alternatePhone: z.string().optional(),
    addressLine1: z.string().trim().min(5, "Address is required"),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().trim().min(2, "City is required"),
    state: z.string().trim().min(2, "State is required"),
    pincode: z.string().trim().length(6, "PIN Code must be 6 digits"),
    type: z.enum(["Home", "Work", "Other"]),
});

type FormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
    initialData?: Address | null;
    onCancel: () => void;
    onSave: (data: CreateAddressPayload, addressId?: string) => void | Promise<void>;
}

const typeOptions = [
    {
        value: "Home" as const,
        icon: Home,
        color: "bg-amber-100 text-amber-700 border-amber-200",
        selectedColor: "bg-amber-500/20 text-amber-300",
        desc: "Deliver to my home address",
    },
    {
        value: "Work" as const,
        icon: BriefcaseBusiness,
        color: "bg-blue-100 text-blue-700 border-blue-200",
        selectedColor: "bg-blue-500/20 text-blue-300",
        desc: "Deliver to my workplace",
    },
    {
        value: "Other" as const,
        icon: Building2,
        color: "bg-purple-100 text-purple-700 border-purple-200",
        selectedColor: "bg-purple-500/20 text-purple-300",
        desc: "Deliver to another location",
    },
];

const stagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.05 },
    },
};

const fadeUpItem = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" as const },
    },
};

function SectionCard({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            variants={fadeUpItem}
            className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
        >
            <div className="flex items-center gap-2 border-b border-border bg-subtle/80 px-4 py-3 sm:px-5">
                <div className="rounded-lg bg-foreground p-1.5 text-white shadow-sm">
                    {icon}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
                    {label}
                </span>
            </div>
            <div className="p-4 sm:p-5">{children}</div>
        </motion.div>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-1.5 flex items-center gap-1 px-1 text-xs text-red-500"
        >
            <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
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
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
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
        },
    });

    useEffect(() => {
        register("type");
    }, [register]);

    useEffect(() => {
        if (!initialData) {
            reset({
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
            });
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

    const selectedType = watch("type");

    const submit = useCallback(
        async (values: FormValues) => {
            await onSave(
                {
                    fullName: values.fullName.trim(),
                    phone: values.phone.trim(),
                    alternatePhone: values.alternatePhone?.trim() || "",
                    addressLine1: values.addressLine1.trim(),
                    addressLine2: values.addressLine2?.trim() || "",
                    landmark: values.landmark?.trim() || "",
                    city: values.city.trim(),
                    state: values.state.trim(),
                    pincode: values.pincode.trim(),
                    type: values.type,
                },
                initialData?.$id,
            );
            reset();
        },
        [initialData?.$id, onSave, reset],
    );

    const selectedOption = typeOptions.find((t) => t.value === selectedType);

    return (
        <motion.form
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit(submit)}
            className="space-y-5"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
            >
                <h3 className="font-bold text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {initialData ? "Edit Address" : "New Delivery Address"}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
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
                {/* ── Personal Information ─────────────────────────────── */}
                <SectionCard
                    icon={<User size={14} />}
                    label="Personal Information"
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <FloatingInput
                                label="Full Name"
                                error={errors.fullName?.message}
                                {...register("fullName")}
                            />
                            <FieldError message={errors.fullName?.message} />
                        </div>
                        <div>
                            <FloatingInput
                                label="Phone Number"
                                type="tel"
                                maxLength={10}
                                error={errors.phone?.message}
                                {...register("phone")}
                            />
                            <FieldError message={errors.phone?.message} />
                        </div>
                        <div className="sm:col-span-2">
                            <FloatingInput
                                label="Alternate Phone (Optional)"
                                type="tel"
                                error={errors.alternatePhone?.message}
                                {...register("alternatePhone")}
                            />
                            <FieldError message={errors.alternatePhone?.message} />
                        </div>
                    </div>
                </SectionCard>

                {/* ── Address Details ──────────────────────────────────── */}
                <SectionCard
                    icon={<MapPin size={14} />}
                    label="Address Details"
                >
                    <div className="space-y-3">
                        <div>
                            <FloatingInput
                                label="Flat / House / Building / Apartment"
                                error={errors.addressLine1?.message}
                                {...register("addressLine1")}
                            />
                            <FieldError message={errors.addressLine1?.message} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <FloatingInput
                                    label="Area / Street / Locality"
                                    error={errors.addressLine2?.message}
                                    {...register("addressLine2")}
                                />
                                <FieldError message={errors.addressLine2?.message} />
                            </div>
                            <div>
                                <FloatingInput
                                    label="Landmark (Optional)"
                                    error={errors.landmark?.message}
                                    {...register("landmark")}
                                />
                                <FieldError message={errors.landmark?.message} />
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                                <FloatingInput
                                    label="PIN Code"
                                    maxLength={6}
                                    inputMode="numeric"
                                    error={errors.pincode?.message}
                                    {...register("pincode")}
                                />
                                <FieldError message={errors.pincode?.message} />
                            </div>
                            <div>
                                <FloatingInput
                                    label="City"
                                    error={errors.city?.message}
                                    {...register("city")}
                                />
                                <FieldError message={errors.city?.message} />
                            </div>
                            <div>
                                <FloatingInput
                                    label="State"
                                    error={errors.state?.message}
                                    {...register("state")}
                                />
                                <FieldError message={errors.state?.message} />
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* ── Address Type ─────────────────────────────────────── */}
                <SectionCard
                    icon={<Building size={14} />}
                    label="Address Type"
                >
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                        {typeOptions.map(
                            ({ value, icon: Icon, color, selectedColor }) => {
                                const isSelected = selectedType === value;
                                return (
                                    <motion.button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                            setValue("type", value, {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                                shouldValidate: true,
                                            })
                                        }
                                        whileHover={{ y: -2, scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        className={`relative overflow-hidden rounded-2xl border-2 p-3 text-center transition-all duration-200 sm:p-4 ${isSelected
                                            ? "border-foreground bg-foreground text-white shadow-lg"
                                            : "border-border bg-card text-muted-foreground hover:border-foreground hover:shadow-md"
                                            }`}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                layoutId="typeBg"
                                                className="absolute inset-0 bg-foreground"
                                                initial={false}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        <div className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-2">
                                            <div
                                                className={`rounded-xl p-1.5 transition-colors sm:p-2 ${isSelected
                                                    ? "bg-card/15"
                                                    : "bg-muted"
                                                    }`}
                                            >
                                                <Icon
                                                    size={16}
                                                    className="sm:h-[18px] sm:w-[18px]"
                                                />
                                            </div>
                                            <span className="text-xs font-semibold sm:text-sm">
                                                {value}
                                            </span>
                                        </div>
                                    </motion.button>
                                );
                            },
                        )}
                    </div>

                    {selectedOption && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-3 flex items-center gap-2 rounded-xl bg-muted px-4 py-2.5"
                        >
                            <div
                                className={`rounded-lg p-1 ${selectedOption.color}`}
                            >
                                <selectedOption.icon size={14} />
                            </div>
                            <span className="text-xs text-muted-foreground sm:text-sm">
                                {selectedOption.desc}
                            </span>
                        </motion.div>
                    )}
                </SectionCard>
            </motion.div>

            {/* ── Actions ──────────────────────────────────────────────── */}
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
                    className="rounded-xl"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Cancel
                </Button>

                <Button
                    type="submit"
                    loading={isSubmitting}
                    className="rounded-xl px-7 shadow-lg shadow-foreground/20"
                >
                    {isSubmitting ? "Saving..." : "Save & Continue"}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
            </motion.div>
        </motion.form>
    );
}

