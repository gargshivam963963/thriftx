"use client";


import { Button } from '@/components/ui/button'; import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Truck, CreditCard, Check } from "lucide-react";

import type { Address, CreateAddressPayload } from "@/lib/types/address";
import type { PaymentMethod } from "@/lib/types/order";
import { detectDeliveryZone } from "@/lib/delivery";
import {
    getCheckoutShippingOptions,
    isLocalDelivery,
    type ShippingMethod,
} from "@/lib/shipping/checkout-options";
import { getShippingRates } from "@/lib/shipping/api";

import AddressSection from "./address/AddressSection";
import ShippingSection from "./shipping/ShippingSection";
import PaymentSection from "./payment/PaymentSection";

export type CheckoutStep = "address" | "shipping" | "payment";

/**
 * Fetch REAL shipping rates from Shiprocket API.
 * Returns cheapest courier options sorted by price (lowest first).
 * Falls back to preset rates if API is unavailable or returns no results.
 */
export async function getShippingOptionsForCity(
    city?: string,
    pincode?: string,
    orderSubtotal?: number,
): Promise<ShippingMethod[]> {
    const subtotal = orderSubtotal ?? 0;
    if (isLocalDelivery(city, pincode)) {
        return getCheckoutShippingOptions(city, pincode, subtotal, []);
    }

    try {
        const response = await getShippingRates(pincode ?? "");
        return getCheckoutShippingOptions(
            city,
            pincode,
            subtotal,
            response.rates ?? [],
        );
    } catch {
        return getCheckoutShippingOptions(city, pincode, subtotal, []);
    }
}

interface CheckoutAccordionProps {
    activeStep: CheckoutStep;
    onStepChange: (step: CheckoutStep) => void;
    addresses: Address[];
    addressesLoading: boolean;
    selectedAddressId: string | null;
    onAddressSelect: (addressId: string | null) => void;
    onAddressSave: (data: CreateAddressPayload, addressId?: string) => Promise<void>;
    onAddressDelete: (address: Address) => Promise<void>;
    shippingMethod: ShippingMethod | null;
    onShippingSelect: (method: ShippingMethod) => void;
    paymentLoading: boolean;
    canPay: boolean;
    onPay: (method: PaymentMethod) => void;
    paymentMethod: PaymentMethod | null;
    onPaymentMethodChange: (method: PaymentMethod) => void;
    subtotal: number;
}

const steps = [
    { key: "address" as const, label: "Address", icon: MapPin },
    { key: "shipping" as const, label: "Shipping", icon: Truck },
    { key: "payment" as const, label: "Payment", icon: CreditCard },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({
    steps,
    stepStatus,
    activeStep,
    onStepChange,
}: {
    steps: readonly { key: CheckoutStep; label: string; icon: React.ComponentType<{ size?: number }> }[];
    stepStatus: Record<string, "complete" | "current" | "pending">;
    activeStep: string;
    onStepChange: (step: CheckoutStep) => void;
}) {
    return (
        <>
            {/* Desktop */}
            <div className="hidden sm:flex items-center gap-3 px-1 mb-6">
                {steps.map((step, index) => {
                    const status = stepStatus[step.key];
                    const isActive = activeStep === step.key;

                    return (
                        <div key={step.key} className="flex items-center gap-3">
                            <Button
                                type="button"
                                onClick={() => {
                                    if (status === "complete") {
                                        onStepChange(step.key);
                                    }
                                }}
                                disabled={status !== "complete" && !isActive}
                                className={`flex items-center gap-2.5 transition-all ${status === "complete"
                                    ? "cursor-pointer hover:opacity-80"
                                    : isActive
                                        ? "cursor-default"
                                        : "cursor-not-allowed opacity-40"
                                    }`}
                            >
                                <motion.div
                                    layout
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 25,
                                    }}
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${status === "complete"
                                        ? "bg-emerald-500 text-white"
                                        : isActive
                                            ? "bg-foreground text-white ring-4 ring-foreground/10"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {status === "complete" ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 15,
                                            }}
                                        >
                                            <Check size={14} />
                                        </motion.div>
                                    ) : (
                                        index + 1
                                    )}
                                </motion.div>
                                <span
                                    className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </Button>

                            {index < steps.length - 1 && (
                                <motion.div
                                    animate={{
                                        backgroundColor:
                                            status === "complete"
                                                ? "rgb(52 211 153)"
                                                : "rgb(228 228 231)",
                                    }}
                                    className="h-px w-8 sm:w-12"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile */}
            <div className="flex sm:hidden items-center justify-between mb-4 px-1">
                {steps.map((step, index) => {
                    const status = stepStatus[step.key];
                    const isActive = activeStep === step.key;
                    const StepIcon = step.icon;

                    return (
                        <div
                            key={step.key}
                            className={`flex flex-col items-center gap-1.5 ${index < steps.length - 1 ? "flex-1" : ""
                                }`}
                        >
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 15,
                                }}
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all ${status === "complete"
                                    ? "bg-emerald-500 text-white"
                                    : isActive
                                        ? "bg-foreground text-white ring-4 ring-foreground/10"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                {status === "complete" ? (
                                    <Check size={12} />
                                ) : (
                                    <StepIcon size={12} />
                                )}
                            </motion.div>
                            <span
                                className={`text-[10px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"
                                    }`}
                            >
                                {step.label}
                            </span>
                            {index < steps.length - 1 && (
                                <motion.div
                                    animate={{
                                        backgroundColor:
                                            status === "complete"
                                                ? "rgb(52 211 153)"
                                                : "rgb(228 228 231)",
                                    }}
                                    className="w-full h-px mt-1"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function AccordionSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="h-24 animate-pulse rounded-2xl bg-muted sm:rounded-3xl"
                />
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CheckoutAccordion({
    activeStep,
    onStepChange,
    addresses,
    addressesLoading,
    selectedAddressId,
    onAddressSelect,
    onAddressSave,
    onAddressDelete,
    shippingMethod,
    onShippingSelect,
    paymentLoading,
    canPay,
    onPay,
    paymentMethod,
    onPaymentMethodChange,
    subtotal,
}: CheckoutAccordionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [shippingOptions, setShippingOptions] = useState<ShippingMethod[]>([]);
    const [shippingLoading, setShippingLoading] = useState(false);

    const selectedAddress = useMemo<Address | null>(() => {
        if (!addresses.length) return null;
        if (selectedAddressId) {
            return (
                addresses.find((address) => address.$id === selectedAddressId) ??
                null
            );
        }
        return addresses.find((address) => address.isDefault) ?? addresses[0];
    }, [addresses, selectedAddressId]);

    useEffect(() => {
        if (sectionRef.current) {
            sectionRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [activeStep]);

    // Fetch dynamic shipping options from Shiprocket API when address changes
    useEffect(() => {
        let cancelled = false;

        async function fetchRates() {
            setShippingLoading(true);
            try {
                const options = await getShippingOptionsForCity(
                    selectedAddress?.city,
                    selectedAddress?.pincode,
                    subtotal,
                );
                if (!cancelled) {
                    setShippingOptions(options);

                    // Auto-select the cheapest (first) option if nothing is selected
                    if (options.length > 0 && !shippingMethod) {
                        onShippingSelect(options[0]);
                    }
                }
            } catch {
                if (!cancelled) {
                    setShippingOptions([]);
                }
            } finally {
                if (!cancelled) {
                    setShippingLoading(false);
                }
            }
        }

        fetchRates();

        return () => {
            cancelled = true;
        };
    }, [
        onShippingSelect,
        selectedAddress?.city,
        selectedAddress?.pincode,
        shippingMethod,
        subtotal,
    ]);

    const stepStatus = useMemo((): Record<string, "complete" | "current" | "pending"> => {
        return {
            address:
                selectedAddress
                    ? "complete" as const
                    : activeStep === "address"
                        ? "current" as const
                        : "pending" as const,
            shipping:
                shippingMethod
                    ? "complete" as const
                    : activeStep === "shipping"
                        ? "current" as const
                        : "pending" as const,
            payment:
                activeStep === "payment" ? "current" as const : "pending" as const,
        };
    }, [activeStep, selectedAddress, shippingMethod]);

    const handleAddressSave = async (
        data: CreateAddressPayload,
        addressId?: string,
    ) => {
        await onAddressSave(data, addressId);
        onStepChange("shipping");
    };

    const handleAddressSelect = async (address: Address) => {
        onAddressSelect(address.$id);
    };

    const handleShippingSelect = (method: ShippingMethod) => {
        onShippingSelect(method);
        onStepChange("payment");
    };

    if (addressesLoading) {
        return <AccordionSkeleton />;
    }

    return (
        <div ref={sectionRef} className="mb-5 space-y-1 sm:space-y-2">
            <StepIndicator
                steps={steps}
                stepStatus={stepStatus}
                activeStep={activeStep}
                onStepChange={onStepChange}
            />

            <motion.div layout className="space-y-3 sm:space-y-4">
                <AddressSection
                    open={activeStep === "address"}
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    onSave={handleAddressSave}
                    onSelect={handleAddressSelect}
                    onDelete={onAddressDelete}
                    onOpen={() => onStepChange("address")}
                    onContinue={() => onStepChange("shipping")}
                />

                <ShippingSection
                    open={activeStep === "shipping"}
                    methods={shippingOptions}
                    selectedMethod={shippingMethod}
                    onSelect={handleShippingSelect}
                    onOpen={() => onStepChange("shipping")}
                    disabled={!selectedAddress}
                    loading={shippingLoading}
                    isLocalDelivery={selectedAddress ? detectDeliveryZone(selectedAddress.city, selectedAddress.pincode) === "local" : false}
                />

                <PaymentSection
                    open={activeStep === "payment"}
                    onOpen={() => onStepChange("payment")}
                    onPay={onPay}
                    paymentLoading={paymentLoading}
                    canPay={canPay}
                    disabled={!selectedAddress || !shippingMethod}
                    selectedMethod={paymentMethod}
                />
            </motion.div>
        </div>
    );
}
