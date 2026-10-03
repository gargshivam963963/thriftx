"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { toast } from "sonner";

interface PromotionSettings {
  welcomeOffer: {
    enabled: boolean;
    discountPercent: number;
    maxSubtotal: number;
    maxDiscount?: number;
    minOrderValue?: number;
  };
  referralProgram: {
    enabled: boolean;
    rewardAmount: number;
    minOrderValue: number;
    perCustomerLimit: number;
    rewardDelayDays: number;
  };
  stackingRules: {
    allowStacking: boolean;
  };
}

export default function PromotionSettingsAdmin() {
  const [settings, setSettings] = useState<PromotionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/promotion-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch promotion settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/promotion-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Promotion settings updated");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return <div>Failed to load settings</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} />
        <h2 className="text-2xl font-bold">Promotion Settings</h2>
      </div>

      {/* Welcome Offer Settings */}
      <div className="space-y-4 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.welcomeOffer.enabled}
            onChange={(e) =>
              setSettings({
                ...settings,
                welcomeOffer: {
                  ...settings.welcomeOffer,
                  enabled: e.target.checked,
                },
              })
            }
            className="w-4 h-4"
          />
          Welcome Offer
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Discount %</label>
            <Input
              type="number"
              value={settings.welcomeOffer.discountPercent}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  welcomeOffer: {
                    ...settings.welcomeOffer,
                    discountPercent: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Max Subtotal (₹)</label>
            <Input
              type="number"
              value={settings.welcomeOffer.maxSubtotal}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  welcomeOffer: {
                    ...settings.welcomeOffer,
                    maxSubtotal: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Referral Program Settings */}
      <div className="space-y-4 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.referralProgram.enabled}
            onChange={(e) =>
              setSettings({
                ...settings,
                referralProgram: {
                  ...settings.referralProgram,
                  enabled: e.target.checked,
                },
              })
            }
            className="w-4 h-4"
          />
          Referral Program
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Reward Amount (₹)</label>
            <Input
              type="number"
              value={settings.referralProgram.rewardAmount}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  referralProgram: {
                    ...settings.referralProgram,
                    rewardAmount: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Min Order Value (₹)</label>
            <Input
              type="number"
              value={settings.referralProgram.minOrderValue}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  referralProgram: {
                    ...settings.referralProgram,
                    minOrderValue: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Per Customer Limit</label>
            <Input
              type="number"
              value={settings.referralProgram.perCustomerLimit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  referralProgram: {
                    ...settings.referralProgram,
                    perCustomerLimit: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Reward Delay (days)</label>
            <Input
              type="number"
              value={settings.referralProgram.rewardDelayDays}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  referralProgram: {
                    ...settings.referralProgram,
                    rewardDelayDays: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={saveSettings}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save size={16} />
            Save Settings
          </>
        )}
      </Button>
    </div>
  );
}
