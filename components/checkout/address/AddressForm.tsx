"use client";

import { useEffect } from "react";
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
        .min(10, "Phone number must be 10 digits")
        .max(10, "Phone number must be 10 digits"),
    alternatePhone: z.string().optional(),
    addressLine1: z.string().trim().min(5, "Address is required"),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().trim().min(2, "City is required"),
    state: z.string().trim().min(2, "State is required"),
    pincode: z.string().trim().length(6, "PIN code must be 6 digits"),
    type: z.enum(["Home", "Work", "Other"]),
});

type FormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
    initialData?: Address | null;
    onCancel: () => void;
    onSave: (data: CreateAddressPayload, addressId?: string) => void | Promise<void>;
}

const typeOptions = [
    { value: "Home" as const, icon: Home, color: "bg-amber-100 text-amber-700 border-amber-200" },
    { value: "Work" as const, icon: BriefcaseBusiness, color: "bg-blue-100 text-blue-700 border-blue-200" },
    { value: "Other" as const, icon: Building2, color: "bg-purple-100 text-purple-700 border-purple-200" },
];

export default function AddressForm({ initialData, onCancel, onSave }: AddressFormProps) {
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

    const submit = async (values: FormValues) => {
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
            initialData?.$id
        );
        reset();
    };

    const selectedIcon = typeOptions.find((t) => t.value === selectedType);

    return (
        <motion.form
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit(submit)}
            className="space-y-6"
        >
            {/* HEADER */}
            <div>
                <h3 className="font-serif text-2xl font-semibold tracking-tight text-zinc-900">
                    {initialData ? "Edit Address" : "New Delivery Address"}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                    {initialData
                        ? "Update your delivery address details below."
                        : "Fill in the details below to add a new shipping address."}
                </p>
            </div>

            {/* SECTION: PERSONAL INFO */}
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 sm:p-5">
                <div className="flex items-center gap-2 border-b border-zinc-200/60 pb-3">
                    <div className="rounded-lg bg-zinc-900 p-1.5 text-white">
                        <User size={14} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        Personal Information
                    </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <FloatingInput
                        label="Full Name"
                        error={errors.fullName?.message}
                        {...register("fullName")}
                    />
                    <FloatingInput
                        label="Phone Number"
                        type="tel"
                        maxLength={10}
                        error={errors.phone?.message}
                        {...register("phone")}
                    />
                    <div className="sm:col-span-2">
                        <FloatingInput
                            label="Alternate Phone (Optional)"
                            type="tel"
                            error={errors.alternatePhone?.message}
                            {...register("alternatePhone")}
                        />
                    </div>
                </div>
            </div>

            {/* SECTION: ADDRESS */}
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 sm:p-5">
                <div className="flex items-center gap-2 border-b border-zinc-200/60 pb-3">
                    <div className="rounded-lg bg-zinc-900 p-1.5 text-white">
                        <MapPin size={14} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        Address Details
                    </span>
                </div>

                <div className="space-y-3">
                    <FloatingInput
                        label="Flat / House / Building"
                        error={errors.addressLine1?.message}
                        {...register("addressLine1")}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <FloatingInput
                            label="Area / Street / Locality"
                            error={errors.addressLine2?.message}
                            {...register("addressLine2")}
                        />
                        <FloatingInput
                            label="Landmark (Optional)"
                            error={errors.landmark?.message}
                            {...register("landmark")}
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <FloatingInput
                            label="PIN Code"
                            maxLength={6}
                            inputMode="numeric"
                            error={errors.pincode?.message}
                            {...register("pincode")}
                        />
                        <FloatingInput
                            label="City"
                            error={errors.city?.message}
                            {...register("city")}
                        />
                        <FloatingInput
                            label="State"
                            error={errors.state?.message}
                            {...register("state")}
                        />
                    </div>
                </div>
            </div>

            {/* SECTION: ADDRESS TYPE */}
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 sm:p-5">
                <div className="flex items-center gap-2 border-b border-zinc-200/60 pb-3">
                    <div className="rounded-lg bg-zinc-900 p-1.5 text-white">
                        <Building size={14} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        Address Type
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {typeOptions.map(({ value, icon: Icon, color }) => (
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
                            className={`relative overflow-hidden rounded-2xl border-2 p-3 sm:p-4 text-center transition-all duration-200 ${selectedType === value
                                    ? "border-zinc-900 bg-zinc-900 text-white shadow-lg"
                                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:shadow-md"
                                }`}
                        >
                            {selectedType === value && (
                                <motion.div
                                    layoutId="typeBg"
                                    className="absolute inset-0 bg-zinc-900"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <div className="relative z-10 flex flex-col items-center gap-1.5 sm:gap-2">
                                <div
                                    className={`rounded-xl p-1.5 sm:p-2 transition-colors ${selectedType === value ? "bg-white/15" : "bg-zinc-100"
                                        }`}
                                >
                                    <Icon size={16} className="sm:h-[18px] sm:w-[18px]" />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold">{value}</span>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {selectedIcon && (
                    <div className="flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5">
                        <div className={`rounded-lg p-1 ${selectedIcon.color}`}>
                            <selectedIcon.icon size={14} />
                        </div>
                        <span className="text-xs sm:text-sm text-zinc-600">
                            {selectedType === "Home"
                                ? "Deliver to my home address"
                                : selectedType === "Work"
                                    ? "Deliver to my workplace"
                                    : "Deliver to another location"}
                        </span>
                    </div>
                )}
            </div>

            {/* ACTIONS */}
            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-6">
                <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl">
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Cancel
                </Button>

                <Button
                    type="submit"
                    loading={isSubmitting}
                    className="rounded-xl px-7 shadow-lg shadow-zinc-900/20"
                >
                    {isSubmitting ? "Saving..." : "Save & Continue"}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
            </div>
        </motion.form>
    );
}

