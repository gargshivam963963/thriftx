"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { shipOrder } from "@/lib/shipping/admin";

interface Props {
    orderId: string;
}

export default function ShipButton({
    orderId,
}: Props) {
    const [loading, setLoading] =
        useState(false);

    async function handleShip() {
        try {
            setLoading(true);

            const result =
                await shipOrder(orderId);

            alert(
                result?.message ||
                "Shipment created successfully.",
            );
        } catch (error) {
            console.error(
                "[ShipButton] Shipment failed:",
                error,
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Shipment failed.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            disabled={loading}
            onClick={handleShip}
        >
            {loading
                ? "Creating..."
                : "Create Shipment"}
        </Button>
    );
}