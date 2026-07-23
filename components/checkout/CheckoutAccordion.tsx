"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import type { Address, CreateAddressPayload } from "@/lib/types/address";

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

export const shippingOptions: ShippingMethod[] = [
    {
        id: "standard",
        name: "Standard Delivery",
        subtitle: "Best Value",
        price: 0,
        eta: "4–6 Days",
    },
    {
        id: "express",
        name: "Express Delivery",
        subtitle: "Most Popular",
        price: 99,
        eta: "2–3 Days",
    },
];

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
    onPay: () => void;
}

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
}: CheckoutAccordionProps) {
    const selectedAddress = useMemo<Address | null>(() => {
        if (!addresses.length) {
            return null;
        }

        if (selectedAddressId) {
            return (
                addresses.find((address) => address.$id === selectedAddressId) ??
                null
            );
        }

        return addresses.find((address) => address.isDefault) ?? addresses[0];
    }, [addresses, selectedAddressId]);

    const handleAddressSave = async (data: CreateAddressPayload, addressId?: string) => {
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
        return (
            <div className="space-y-4">
                <div className="h-36 animate-pulse rounded-3xl bg-neutral-100" />
                <div className="h-36 animate-pulse rounded-3xl bg-neutral-100" />
                <div className="h-36 animate-pulse rounded-3xl bg-neutral-100" />
            </div>
        );
    }

    return (
        <motion.div layout className="space-y-4">
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
            />

            <PaymentSection
                open={activeStep === "payment"}
                onOpen={() => onStepChange("payment")}
                onPay={onPay}
                paymentLoading={paymentLoading}
                canPay={canPay}
                disabled={!selectedAddress || !shippingMethod}
            />
        </motion.div>
    );
}
