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
    Check,
    CheckCircle2,
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

    onPay: (
        method: PaymentMethod,
    ) => void;

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
    onStepChange,
}: {
    activeStep: CheckoutStep;
    stepStatus: StepState;
    onStepChange: (step: CheckoutStep) => void;
}) {
    const activeIndex = getStepIndex(activeStep);

    return (
        <nav
            aria-label="Checkout progress"
            className="mb-5 rounded-2xl border border-border bg-card p-3 shadow-sm sm:mb-6 sm:rounded-3xl sm:p-5"
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Checkout Progress
                    </p>

                    <p className="mt-1 text-sm font-semibold text-foreground">
                        Step {activeIndex + 1} of {STEPS.length}
                    </p>
                </div>

                <span className="rounded-full bg-muted px-3 py-1.5 text-[10px] font-medium text-muted-foreground sm:text-xs">
                    {Math.round(
                        ((activeIndex + 1) / STEPS.length) * 100,
                    )}
                    % complete
                </span>
            </div>

            {/* Progress track */}
            <div
                className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Checkout completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(
                    ((activeIndex + 1) / STEPS.length) * 100,
                )}
            >
                <motion.div
                    initial={false}
                    animate={{
                        width: `${((activeIndex + 1) / STEPS.length) * 100}%`,
                    }}
                    transition={{
                        duration: 0.3,
                        ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-emerald-500"
                />
            </div>

            {/* Responsive step controls */}
            <div className="grid grid-cols-3 gap-1 sm:gap-3">
                {STEPS.map((step, index) => {
                    const status = stepStatus[step.key];

                    const isActive =
                        activeStep === step.key;

                    const isComplete =
                        status === "complete";

                    const StepIcon = step.icon;

                    const canNavigate =
                        isComplete || isActive;

                    return (
                        <div
                            key={step.key}
                            className="relative min-w-0"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    if (canNavigate) {
                                        onStepChange(step.key);
                                    }
                                }}
                                disabled={!canNavigate}
                                aria-current={
                                    isActive ? "step" : undefined
                                }
                                className={[
                                    "flex min-h-[76px] w-full min-w-0 flex-col items-center justify-center gap-2 rounded-xl px-1.5 py-3 text-center transition-colors sm:min-h-[88px] sm:rounded-2xl sm:px-3",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground",
                                    isActive
                                        ? "bg-muted"
                                        : isComplete
                                            ? "hover:bg-muted/60"
                                            : "cursor-not-allowed opacity-45",
                                ].join(" ")}
                            >
                                <motion.span
                                    layout
                                    className={[
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors sm:h-9 sm:w-9",
                                        isComplete
                                            ? "bg-emerald-500 text-white"
                                            : isActive
                                                ? "bg-foreground text-background"
                                                : "bg-muted text-muted-foreground",
                                    ].join(" ")}
                                >
                                    {isComplete ? (
                                        <Check
                                            size={15}
                                            strokeWidth={2.8}
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <StepIcon
                                            size={15}
                                            aria-hidden="true"
                                        />
                                    )}
                                </motion.span>

                                <span
                                    className={[
                                        "block w-full truncate text-[11px] font-semibold sm:text-sm",
                                        isActive
                                            ? "text-foreground"
                                            : isComplete
                                                ? "text-foreground"
                                                : "text-muted-foreground",
                                    ].join(" ")}
                                >
                                    {step.label}
                                </span>

                                <span className="hidden max-w-full truncate text-[10px] text-muted-foreground sm:block">
                                    {step.description}
                                </span>
                            </button>

                            {index < STEPS.length - 1 && (
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-1.5 top-1/2 z-10 hidden h-px w-3 -translate-y-1/2 bg-border sm:block"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
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
    onPay,
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

            onStepChange("shipping");
        },
        [
            onAddressSave,
            onStepChange,
        ],
    );

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

    const handlePaymentSelect = useCallback(
        (method: PaymentMethod) => {
            onPaymentMethodChange(method);
            onPay(method);
        },
        [
            onPaymentMethodChange,
            onPay,
        ],
    );

    if (addressesLoading) {
        return <CheckoutLoading />;
    }

    return (
        <div
            ref={sectionRef}
            className="mb-6 min-w-0 scroll-mt-24 sm:mb-8"
        >
            <StepIndicator
                activeStep={activeStep}
                stepStatus={stepStatus}
                onStepChange={onStepChange}
            />

            <motion.div
                layout
                className="space-y-3 sm:space-y-4"
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
                        onStepChange("shipping")
                    }
                />

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

                <PaymentSection
                    open={activeStep === "payment"}
                    onOpen={() =>
                        onStepChange("payment")
                    }
                    onPay={handlePaymentSelect}
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