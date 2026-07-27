"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Truck, CreditCard, Check } from "lucide-react";

import type { Address, CreateAddressPayload } from "@/lib/types/address";
import type { PaymentMethod } from "@/lib/types/order";
import { detectDeliveryZone } from "@/lib/delivery";
import { SHIPPING_DEFAULTS } from "@/lib/shipping/constants";
import { getShippingRates } from "@/lib/shipping/api";

import AddressSection from "./address/AddressSection";
import ShippingSection from "./shipping/ShippingSection";
import PaymentSection from "./payment/PaymentSection";

export type CheckoutStep = "address" | "shipping" | "payment";

export interface ShippingMethod {
    id: string;
    name: string;
    subtitle: string;
    price: number;
    eta: string;
}

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
    // Local delivery (Panipat) — always free same-day, no courier needed
    if (city && pincode && detectDeliveryZone(city, pincode) === "local") {
        return [
            {
                id: "standard",
                name: "Panipat Same-Day Delivery",
                subtitle: "FREE delivery in 30–60 mins",
                price: 0,
                eta: "30–60 min",
            },
        ];
    }

    const freeShipping = (orderSubtotal ?? 0) >= SHIPPING_DEFAULTS.freeShippingAmount;

    try {
        // Call Shiprocket API via our backend route to get real courier rates
        const response = await getShippingRates(pincode ?? "");
        const rates = response.rates;

        if (rates && rates.length > 0) {
            // Sort by amount (cheapest first)
            const sorted = [...rates].sort((a, b) => a.amount - b.amount);

            // Cheapest courier = standard
            const cheapest = sorted[0];
            const standardPrice = freeShipping ? 0 : cheapest.amount;

            const methods: ShippingMethod[] = [
                {
                    id: "standard",
                    name: `${cheapest.courierName} — Standard`,
                    subtitle: freeShipping ? "FREE on this order" : `Cheapest courier — ₹${cheapest.amount}`,
                    price: standardPrice,
                    eta: `${cheapest.estimatedDays} Day${cheapest.estimatedDays !== 1 ? "s" : ""}`,
                },
            ];

            // If there's a second cheapest, offer it as express
            if (sorted.length > 1) {
                const faster = sorted[1];
                methods.push({
                    id: "express",
                    name: `${faster.courierName} — Express`,
                    subtitle: `Faster — ₹${faster.amount}`,
                    price: faster.amount,
                    eta: `${faster.estimatedDays} Day${faster.estimatedDays !== 1 ? "s" : ""}`,
                });
            }

            return methods;
        }

        throw new Error("No courier rates returned from Shiprocket");
    } catch {
        // Fallback to preset rates if Shiprocket API fails
        const standardPrice = freeShipping ? 0 : 49;

        return [
            {
                id: "standard",
                name: "Standard Delivery",
                subtitle: freeShipping ? "FREE on this order" : "Best Value",
                price: standardPrice,
                eta: "4–6 Days",
            },
            {
                id: "express",
                name: "Express Delivery",
                subtitle: "Faster Shipping",
                price: 99,
                eta: "2–3 Days",
            },
        ];
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
                            <button
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
                                            ? "bg-neutral-900 text-white ring-4 ring-neutral-900/10"
                                            : "bg-neutral-200 text-neutral-500"
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
                                    className={`text-sm font-medium ${isActive ? "text-neutral-900" : "text-neutral-500"
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </button>

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
                                        ? "bg-neutral-900 text-white ring-4 ring-neutral-900/10"
                                        : "bg-neutral-200 text-neutral-400"
                                    }`}
                            >
                                {status === "complete" ? (
                                    <Check size={12} />
                                ) : (
                                    <StepIcon size={12} />
                                )}
                            </motion.div>
                            <span
                                className={`text-[10px] font-medium ${isActive ? "text-neutral-900" : "text-neutral-400"
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
                    className="h-24 animate-pulse rounded-2xl bg-neutral-100 sm:rounded-3xl"
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
    }, [selectedAddress?.city, selectedAddress?.pincode, subtotal]);

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
