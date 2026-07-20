"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
    title: string;
    price: number;
}

export default function ShareButton({
    title,
    price,
}: ShareButtonProps) {
    async function handleShare() {
        const url = window.location.href;

        const shareData = {
            title,
            text: `${title}

₹${price.toLocaleString(
                "en-IN"
            )}

🔥 Only 1 Piece Available

Shop now on THRIFTX`,
            url,
        };

        try {
            if (navigator.share) {
                await navigator.share(
                    shareData
                );

                return;
            }

            await navigator.clipboard.writeText(
                url
            );

            toast.success(
                "Product link copied."
            );
        } catch {
            toast.error(
                "Unable to share product."
            );
        }
    }

    return (
        <Button
            variant="outline"
            size="iconMd"
            aria-label="Share Product"
            onClick={handleShare}
        >
            <Share2 className="h-5 w-5" />
        </Button>
    );
}