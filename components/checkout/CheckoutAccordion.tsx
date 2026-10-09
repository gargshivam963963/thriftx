"use client";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
    CreditCard,
    MapPin,
    Truck,
} from "lucide-react";

import type {
    Address,
    CreateAddressPayload,
} from "@/lib/types/address";

import type { PaymentMethod } from "@/lib/types/order";

import { detectDeliveryZone } from "@/lib/delivery";

import {
    getCheckoutShippingOptions,
    isLocalDelivery,
    type ShippingMethod,
} from "@/lib/shipping/checkout-options";

import { getShippingRates } from "@/lib/shipping/api";

import CheckoutProgress from "./CheckoutProgress";
import AddressSection from "./address/AddressSection";
import ShippingSection from "./shipping/ShippingSection";
import PaymentSection from "./payment/PaymentSection";

export type CheckoutStep =
    | "address"
    | "shipping"
    | "payment";

interface CheckoutAccordionProps {
    activeStep: CheckoutStep;
    onStepChange: (step: CheckoutStep) => void;

    addresses: Address[];
    addressesLoading: boolean;

    selectedAddressId: string | null;

    onAddressSelect: (
        addressId: string | null,
    ) => void;

    onAddressSave: (
        data: CreateAddressPayload,
        addressId?: string,
    ) => Promise<void>;

    onAddressDelete: (
        address: Address,
    ) => Promise<void>;

    shippingMethod: ShippingMethod | null;

    onShippingSelect: (
        method: ShippingMethod,
    ) => void;

    paymentLoading: boolean;
    canPay: boolean;

    paymentMethod: PaymentMethod | null;

    onPaymentMethodChange: (
        method: PaymentMethod,
    ) => void;

    subtotal: number;
}

const STEPS = [
    {
        key: "address" as const,
        label: "Address",
        description: "Delivery location",
        icon: MapPin,
    },
    {
        key: "shipping" as const,
        label: "Shipping",
        description: "Delivery method",
        icon: Truck,
    },
    {
        key: "payment" as const,
        label: "Payment",
        description: "Payment method",
        icon: CreditCard,
    },
];

type StepStatus =
    | "complete"
    | "current"
    | "pending";

type StepState = Record<
    CheckoutStep,
    StepStatus
>;

function getStepIndex(step: CheckoutStep) {
    return STEPS.findIndex(
        (item) => item.key === step,
    );
}

/**
 * Fetch shipping rates and apply the existing checkout
 * shipping rules, including configured local delivery.
 *
 * Pricing and eligibility remain owned by the shipping
 * configuration rather than the UI.
 */
export async function getShippingOptionsForCity(
    city?: string,
    pincode?: string,
    orderSubtotal?: number,
): Promise<ShippingMethod[]> {
    const subtotal = orderSubtotal ?? 0;

    if (isLocalDelivery(city, pincode)) {
        return getCheckoutShippingOptions(
            city,
            pincode,
            subtotal,
            [],
        );
    }

    try {
        const response = await getShippingRates(
            pincode ?? "",
        );

        return getCheckoutShippingOptions(
            city,
            pincode,
            subtotal,
            response.rates ?? [],
        );
    } catch {
        return getCheckoutShippingOptions(
            city,
            pincode,
            subtotal,
            [],
        );
    }
}

/* -------------------------------------------------------------------------- */
/* Step indicator                                                             */
/* -------------------------------------------------------------------------- */

function StepIndicator({
    activeStep,
    stepStatus,
}: {
    activeStep: CheckoutStep;
    stepStatus: StepState;
}) {
    const activeIndex = getStepIndex(activeStep);

    const statuses = STEPS.map((step) => stepStatus[step.key]);

    return (
        <nav
            aria-label="Checkout progress"
            className="glass-liquid rounded-2xl p-4 sm:rounded-3xl sm:p-5"
        >
            <CheckoutProgress
                currentStep={activeIndex + 1}
                totalSteps={STEPS.length}
                statuses={statuses}
                labels={STEPS.map((step) => step.label)}
            />
        </nav>
    );
}

/* -------------------------------------------------------------------------- */
/* Loading state                                                              */
/* -------------------------------------------------------------------------- */

function CheckoutLoading() {
    return (
        <div
            className="space-y-4"
            aria-label="Loading checkout"
            aria-busy="true"
        >
            <div className="rounded-2xl border border-border bg-card p-4 sm:rounded-3xl sm:p-6">
                <div className="mb-5 h-4 w-36 animate-pulse rounded bg-muted" />

                <div className="h-2 animate-pulse rounded-full bg-muted" />

                <div className="mt-5 grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 p-3"
                        >
                            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />

                            <div className="h-3 w-14 animate-pulse rounded bg-muted" />
                        </div>
                    ))}
                </div>
            </div>

            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="h-24 animate-pulse rounded-2xl border border-border bg-muted/50 sm:rounded-3xl"
                />
            ))}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

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
    paymentMethod,
    onPaymentMethodChange,

    subtotal,
}: CheckoutAccordionProps) {
    const sectionRef =
        useRef<HTMLDivElement>(null);

    const [shippingOptions, setShippingOptions] =
        useState<ShippingMethod[]>([]);

    const [shippingLoading, setShippingLoading] =
        useState(false);

    const [shippingError, setShippingError] =
        useState<string | null>(null);

    const selectedAddress = useMemo<Address | null>(() => {
        if (!addresses.length) {
            return null;
        }

        if (selectedAddressId) {
            return (
                addresses.find(
                    (address) =>
                        address.$id === selectedAddressId,
                ) ?? null
            );
        }

        return (
            addresses.find(
                (address) => address.isDefault,
            ) ?? addresses[0]
        );
    }, [addresses, selectedAddressId]);

    const localDelivery = useMemo(() => {
        if (!selectedAddress) {
            return false;
        }

        return (
            detectDeliveryZone(
                selectedAddress.city,
                selectedAddress.pincode,
            ) === "local"
        );
    }, [selectedAddress]);

    /*
     * Scroll to the checkout section when the active step
     * changes. A small top offset keeps the heading visible
     * beneath sticky site navigation.
     */
    useEffect(() => {
        if (!sectionRef.current) {
            return;
        }

        sectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, [activeStep]);

    /*
     * Fetch rates whenever the delivery destination or
     * subtotal changes. Cancellation prevents stale requests
     * from replacing newer shipping options.
     */
    useEffect(() => {
        let cancelled = false;

        async function fetchRates() {
            if (!selectedAddress) {
                setShippingOptions([]);
                setShippingLoading(false);
                setShippingError(null);
                return;
            }

            setShippingLoading(true);
            setShippingError(null);

            try {
                const options =
                    await getShippingOptionsForCity(
                        selectedAddress.city,
                        selectedAddress.pincode,
                        subtotal,
                    );

                if (cancelled) {
                    return;
                }

                setShippingOptions(options);

                if (options.length === 0) {
                    setShippingError(
                        "No delivery methods are currently available for this address.",
                    );
                }
            } catch {
                if (cancelled) {
                    return;
                }

                setShippingOptions([]);
                setShippingError(
                    "We couldn't load delivery options. Please try again.",
                );
            } finally {
                if (!cancelled) {
                    setShippingLoading(false);
                }
            }
        }

        void fetchRates();

        return () => {
            cancelled = true;
        };
    }, [
        selectedAddress,
        subtotal,
    ]);

    const stepStatus = useMemo<StepState>(() => {
        return {
            address: selectedAddress
                ? "complete"
                : activeStep === "address"
                    ? "current"
                    : "pending",

            shipping: shippingMethod
                ? "complete"
                : activeStep === "shipping"
                    ? "current"
                    : "pending",

            payment:
                activeStep === "payment"
                    ? "current"
                    : "pending",
        };
    }, [
        activeStep,
        selectedAddress,
        shippingMethod,
    ]);

    const handleAddressSave = useCallback(
        async (
            data: CreateAddressPayload,
            addressId?: string,
        ) => {
            await onAddressSave(data, addressId);
            // Smart defaults (effects below) move the customer forward —
            // no forced step click required.
        },
        [onAddressSave],
    );

    // Smart defaults: address + delivery auto-resolve. An existing address
    // stays selected, delivery derives from the address zone, and the
    // customer lands on payment. "Change" buttons remain for multi-address
    // cases, but no step is ever a forced click.
    useEffect(() => {
        if (addressesLoading || addresses.length === 0) return;
        if (!selectedAddress) {
            const fallback =
                addresses.find((a) => a.isDefault) ?? addresses[0];
            if (fallback) onAddressSelect(fallback.$id);
        }
    }, [addressesLoading, addresses, selectedAddress, onAddressSelect]);

    useEffect(() => {
        if (shippingLoading || shippingMethod) return;
        if (shippingOptions.length > 0 && selectedAddress) {
            onShippingSelect(shippingOptions[0]);
        }
    }, [
        shippingLoading,
        shippingMethod,
        shippingOptions,
        selectedAddress,
        onShippingSelect,
    ]);

    // Auto-advance to payment ONLY the first time an address + shipping combo
    // resolves — never when the customer deliberately returns to the address
    // step to change it. The previous version bounced "Change" straight back
    // to payment, which made editing the delivery address impossible.
    const autoAdvancedKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!selectedAddress || !shippingMethod) return;

        const key = `${selectedAddress.$id}:${shippingMethod.name}`;

        // Remember the combo we've already advanced past so returning to the
        // address step later does not re-trigger the jump.
        if (activeStep === "payment") {
            autoAdvancedKeyRef.current = key;
            return;
        }

        // Already auto-advanced for this exact combo → respect the customer's
        // current position (they are editing the address on purpose).
        if (autoAdvancedKeyRef.current === key) return;

        autoAdvancedKeyRef.current = key;
        onStepChange("payment");
    }, [selectedAddress, shippingMethod, activeStep, onStepChange]);

    const handleAddressSelect = useCallback(
        (address: Address) => {
            onAddressSelect(address.$id);
        },
        [onAddressSelect],
    );

    const handleShippingSelect = useCallback(
        (method: ShippingMethod) => {
            onShippingSelect(method);
            onStepChange("payment");
        },
        [
            onShippingSelect,
            onStepChange,
        ],
    );

    if (addressesLoading) {
        return <CheckoutLoading />;
    }

    return (
        <div
            ref={sectionRef}
            className="min-w-0 scroll-mt-24 space-y-4 sm:space-y-5"
        >
            <StepIndicator
                activeStep={activeStep}
                stepStatus={stepStatus}
            />

            <motion.div
                layout
                className="space-y-4 sm:space-y-5"
            >
                <AddressSection
                    open={activeStep === "address"}
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    onSave={handleAddressSave}
                    onSelect={handleAddressSelect}
                    onDelete={onAddressDelete}
                    onOpen={() =>
                        onStepChange("address")
                    }
                    onContinue={() =>
                        onStepChange(localDelivery ? "payment" : "shipping")
                    }
                />

                {/* Shipping step is only a real choice for non-local zones
                    with 2+ courier options. Panipat self-delivery and single
                    courier options auto-resolve — shown as a compact
                    confirmation line instead of a forced click-step. */}
                {(!localDelivery && shippingOptions.length > 1) ? (
                <ShippingSection
                    open={activeStep === "shipping"}
                    methods={shippingOptions}
                    selectedMethod={shippingMethod}
                    onSelect={handleShippingSelect}
                    onOpen={() =>
                        onStepChange("shipping")
                    }
                    disabled={!selectedAddress}
                    loading={shippingLoading}
                    isLocalDelivery={localDelivery}
                />
                ) : (
                selectedAddress && shippingMethod && (
                <div className="rounded-2xl border border-border bg-card px-4 py-3.5 sm:rounded-3xl sm:px-6 sm:py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-success-bg text-success-foreground">
                            <Truck className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-small font-semibold text-foreground">
                                {shippingMethod.name}
                            </p>
                            <p className="mt-0.5 truncate text-small text-muted-foreground">
                                {shippingMethod.eta}
                                {shippingMethod.price === 0
                                    ? " · Free"
                                    : ` · ₹${shippingMethod.price.toLocaleString("en-IN")}`}
                                {localDelivery ? " · Delivered by THRIFTX" : ""}
                            </p>
                        </div>
                    </div>
                </div>
                )
                )}

                <PaymentSection
                    open={activeStep === "payment"}
                    onOpen={() =>
                        onStepChange("payment")
                    }
                    onPaymentMethodChange={onPaymentMethodChange}
                    paymentLoading={paymentLoading}
                    canPay={canPay}
                    disabled={
                        !selectedAddress ||
                        !shippingMethod
                    }
                    selectedMethod={paymentMethod}
                />

                <AnimatePresence>
                    {shippingError && (
                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 5,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -5,
                            }}
                            role="status"
                            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
                        >
                            {shippingError}
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}