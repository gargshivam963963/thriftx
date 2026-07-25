"use client";

import { useState } from "react";
import { shipOrder } from "@/lib/shipping/admin";

interface Props {
    orderId: string;
}

export default function ShipButton({
    orderId,
}: Props) {
    const [loading, setLoading] = useState(false);

    async function handleShip() {
        try {
            setLoading(true);

            await shipOrder(orderId);

            alert("Shipment created successfully.");
        } catch (error) {
            console.error(error);

            alert("Shipment failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            disabled={loading}
            onClick={handleShip}
        >
            {loading ? "Creating..." : "Create Shipment"}
        </button>
    );
}