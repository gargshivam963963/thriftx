"use client";

import { AlertCircle, Gift, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

interface PromotionBanner {
  type: "welcome" | "referral" | "coupon";
  message: string;
  savings: number;
}

interface PromotionBannersProps {
  discount: number;
  discountReason?: string;
  appliedPromotion?: string;
  referralCode?: string;
}

export default function PromotionBanners({
  discount,
  discountReason,
  appliedPromotion,
  referralCode,
}: PromotionBannersProps) {
  const [banners, setBanners] = useState<PromotionBanner[]>([]);

  useEffect(() => {
    const newBanners: PromotionBanner[] = [];

    if (discount > 0 && discountReason) {
      if (discountReason.includes("welcome")) {
        newBanners.push({
          type: "welcome",
          message: "🎉 Welcome offer applied! Get 50% off your first order",
          savings: discount,
        });
      } else if (discountReason.includes("referral")) {
        newBanners.push({
          type: "referral",
          message: "🎁 Referral discount applied! Your friend referred you",
          savings: discount,
        });
      } else if (discountReason.includes("coupon")) {
        newBanners.push({
          type: "coupon",
          message: `✓ Coupon applied: ${appliedPromotion}`,
          savings: discount,
        });
      }
    }

    setBanners(newBanners);
  }, [discount, discountReason, appliedPromotion]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {banners.map((banner, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
        >
          {banner.type === "welcome" && (
            <Gift size={18} className="text-green-600 dark:text-green-400 shrink-0" />
          )}
          {banner.type === "referral" && (
            <TrendingDown
              size={18}
              className="text-green-600 dark:text-green-400 shrink-0"
            />
          )}
          {banner.type === "coupon" && (
            <AlertCircle
              size={18}
              className="text-green-600 dark:text-green-400 shrink-0"
            />
          )}

          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              {banner.message}
            </p>
            {banner.savings > 0 && (
              <p className="text-xs text-green-800 dark:text-green-200">
                You save ₹{banner.savings}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
