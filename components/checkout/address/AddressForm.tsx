"use client";

import { useEffect } from "react";

import {
    useForm,
    type UseFormRegisterReturn,
} from "react-hook-form";

import { motion } from "framer-motion";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    ArrowLeft,
    ArrowRight,
    Home,
    BriefcaseBusiness,
    Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import type {
    Address,
    CreateAddressPayload,
} from "@/lib/types/address";

const addressSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name is required"),

    phone: z
        .string()
        .trim()
        .min(10, "Phone number is invalid")
        .max(10, "Phone number is invalid"),

    alternatePhone: z.string().optional(),

    addressLine1: z
        .string()
        .trim()
        .min(5, "Address is required"),

    addressLine2: z.string().optional(),

    landmark: z.string().optional(),

    city: z
        .string()
        .trim()
        .min(2, "City is required"),

    state: z
        .string()
        .trim()
        .min(2, "State is required"),

    pincode: z
        .string()
        .trim()
        .length(6, "Invalid PIN code"),

    type: z.enum([
        "Home",
        "Work",
        "Other",
    ]),
});

type FormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
    initialData?: Address | null;

    onCancel: () => void;

    onSave: (
        data: CreateAddressPayload,
        addressId?: string,
    ) => void | Promise<void>;
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
        trigger,
        formState: {
            errors,
            isSubmitting,
        },
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
            alternatePhone:
                initialData.alternatePhone ?? "",
            addressLine1:
                initialData.addressLine1,
            addressLine2:
                initialData.addressLine2 ?? "",
            landmark:
                initialData.landmark ?? "",
            city: initialData.city,
            state: initialData.state,
            pincode: initialData.pincode,
            type: initialData.type,
        });
    }, [initialData, reset]);

    const selectedType = watch("type");

    const submit = async (
        values: FormValues,
    ) => {
        console.log(values);

        await onSave({
            fullName: values.fullName.trim(),
            phone: values.phone.trim(),
            alternatePhone:
                values.alternatePhone?.trim() || "",
            addressLine1:
                values.addressLine1.trim(),
            addressLine2:
                values.addressLine2?.trim() || "",
            landmark:
                values.landmark?.trim() || "",
            city: values.city.trim(),
            state: values.state.trim(),
            pincode: values.pincode.trim(),
            type: values.type,
        }, initialData?.$id);

        reset();
    };

    return (
        <motion.form
            layout
            initial={{
                opacity: 0,
                y: 20,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            exit={{
                opacity: 0,
            }}
            transition={{
                duration: 0.3,
            }}
            onSubmit={handleSubmit(submit)}
            className="space-y-8"
        >
            <div>
                <h3 className="text-xl font-semibold text-zinc-900">
                    Delivery Address
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                    This address will be used for shipping.
                </p>
            </div>

            {/* PERSONAL */}

            <section className="space-y-5 rounded-3xl border border-zinc-200 p-6">
                <h4 className="font-semibold text-zinc-900">
                    Personal Information
                </h4>

                <div className="grid gap-5 md:grid-cols-2">
                    <Input
                        label="Full Name"
                        error={errors.fullName?.message}
                        register={register("fullName")}
                    />

                    <Input
                        label="Phone Number"
                        error={errors.phone?.message}
                        register={register("phone")}
                    />

                    <Input
                        label="Alternate Phone"
                        error={errors.alternatePhone?.message}
                        register={register("alternatePhone")}
                    />
                </div>
            </section>

            {/* LOCATION */}

            <section className="space-y-5 rounded-3xl border border-zinc-200 p-6">
                <h4 className="font-semibold text-zinc-900">
                    Delivery Location
                </h4>

                <Input
                    label="House / Flat / Building"
                    error={errors.addressLine1?.message}
                    register={register("addressLine1")}
                />

                <div className="mt-5">
                    <Input
                        label="Area / Street"
                        error={errors.addressLine2?.message}
                        register={register("addressLine2")}
                    />
                </div>

                <div className="mt-5">
                    <Input
                        label="Landmark"
                        error={errors.landmark?.message}
                        register={register("landmark")}
                    />
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <Input
                        label="PIN Code"
                        error={errors.pincode?.message}
                        register={register("pincode")}
                    />

                    <Input
                        label="City"
                        error={errors.city?.message}
                        register={register("city")}
                    />

                    <Input
                        label="State"
                        error={errors.state?.message}
                        register={register("state")}
                    />
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-3">
                    <AddressTypeCard
                        icon={<Home size={18} />}
                        title="Home"
                        selected={selectedType === "Home"}
                        onClick={() =>
                            setValue("type", "Home", {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                            })
                        }
                    />

                    <AddressTypeCard
                        icon={<BriefcaseBusiness size={18} />}
                        title="Work"
                        selected={selectedType === "Work"}
                        onClick={() =>
                            setValue("type", "Work", {
                                shouldValidate: true,
                            })
                        }
                    />

                    <AddressTypeCard
                        icon={<Building2 size={18} />}
                        title="Other"
                        selected={selectedType === "Other"}
                        onClick={() =>
                            setValue("type", "Other", {
                                shouldValidate: true,
                            })
                        }
                    />
                </div>
            </section>

            <div className="flex items-center justify-between border-t border-zinc-200 pt-6">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="rounded-2xl"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-2xl px-8"
                >
                    {isSubmitting
                        ? "Saving..."
                        : "Save & Continue"}

                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </motion.form>
    );
}

interface InputProps {
    label: string;
    error?: string;
    register: UseFormRegisterReturn;
}

function Input({
    label,
    error,
    register,
}: InputProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
                {label}
            </label>

            <input
                {...register}
                autoComplete="off"
                spellCheck={false}
                className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition-all duration-200 ${error
                    ? "border-red-400 focus:border-red-500"
                    : "border-zinc-200 focus:border-black"
                    }`}
            />

            {error && (
                <p className="mt-2 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

interface AddressTypeCardProps {
    icon: React.ReactNode;
    title: "Home" | "Work" | "Other";
    selected: boolean;
    onClick: () => void;
}

function AddressTypeCard({
    icon,
    title,
    selected,
    onClick,
}: AddressTypeCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-2xl border p-5 transition-all duration-200 ${selected
                ? "border-black bg-black text-white"
                : "border-zinc-200 hover:border-zinc-900"
                }`}
        >
            <div className="flex flex-col items-center gap-3">
                {icon}

                <span className="text-sm font-medium">
                    {title}
                </span>
            </div>
        </button>
    );
}