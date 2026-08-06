"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Gift, Sparkles, Tag } from "lucide-react";
import type { OfferResult } from "@/lib/marketing/offers";
import type { Offer } from "@/lib/marketing/types";

interface CartOffersProps {
    items: { id: string; title: string; price: number; quantity: number; category?: string; brand?: string }[];
}

export default function CartOffers({ items }: CartOffersProps) {
    const [applied, setApplied] = useState<OfferResult[]>([]);
    const [pending, setPending] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!items || items.length === 0) {
            setApplied([]);
            setPending([]);
            setLoading(false);
            return;
        }

        let active = true;
        (async () => {
            try {
                const res = await fetch("/api/marketing/offers/active", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items }),
                });
                const data = await res.json();
                if (active && data.success) {
                    setApplied(data.applied || []);
                    setPending(data.pending || []);
                }
            } catch (error) {
                console.error("Failed to load offers:", error);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [items]);

    if (loading) return null;
    if (applied.length === 0 && pending.length === 0) return null;

    return (
        <div className="space-y-3">
            {applied.map((offer) => (
                <div
                    key={offer.offerId}
                    className="flex items-start gap-3 rounded-2xl border border-success-bg bg-success-bg/70 p-4"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success text-white shadow-sm">
                        <CheckCircle2 size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-body font-bold text-success-foreground">
                            {offer.title}
                        </p>
                        <p className="text-small text-success-foreground">
                            You&apos;re saving ₹{offer.discount.toLocaleString("en-IN")} on this offer!
                        </p>
                    </div>
                </div>
            ))}

            {pending.map((offer) => (
                <div
                    key={offer.id}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
                        <Gift size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-body font-bold text-foreground">
                            {offer.title}
                        </p>
                        <p className="text-small text-muted-foreground">
                            {offer.description || "Add qualifying items to unlock this offer"}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
