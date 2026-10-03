"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { toast } from "sonner";

interface CreditUsageProps {
  onApplyCredit: (amount: number) => void;
  onRemoveCredit: () => void;
  appliedCredit: number;
  subtotal: number;
  discount: number;
}

export default function CreditUsage({
  onApplyCredit,
  onRemoveCredit,
  appliedCredit,
  subtotal,
  discount,
}: CreditUsageProps) {
  const [walletBalance, setWalletBalance] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const response = await fetch("/api/marketing/credits/wallet");
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance);
      }
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  const maxApplicableCredit = walletBalance;
  const availableForCheckout = Math.max(
    0,
    subtotal + discount - appliedCredit,
  );
  const maxCreditToApply = Math.min(maxApplicableCredit, availableForCheckout);

  const handleApplyFull = () => {
    onApplyCredit(maxCreditToApply);
    setCustomAmount("");
  };

  const handleApplyCustom = () => {
    const amount = parseInt(customAmount) || 0;
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > maxCreditToApply) {
      toast.error(
        `You can only apply up to ₹${maxCreditToApply} credit`,
      );
      return;
    }
    onApplyCredit(amount);
    setCustomAmount("");
  };

  const handleRemoveCredit = () => {
    onRemoveCredit();
    setCustomAmount("");
  };

  if (loading) {
    return null;
  }

  if (walletBalance === 0) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-primary" />
          <span className="font-semibold">Store Credit</span>
        </div>
        <span className="text-sm font-medium">
          Balance: ₹{walletBalance}
        </span>
      </div>

      {appliedCredit > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
            <span className="text-sm">Applied credit</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              −₹{appliedCredit}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRemoveCredit}
            className="w-full text-red-600 hover:text-red-700"
          >
            Remove Credit
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {maxCreditToApply > 0 ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleApplyFull}
                className="w-full flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Apply Full Credit (₹{maxCreditToApply})
              </Button>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleApplyCustom}
                  disabled={!customAmount}
                >
                  Apply
                </Button>
              </div>

              <p className="text-xs text-muted-foreground flex gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                You can apply up to ₹{maxCreditToApply} credit to this order
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              ℹ️ Your wallet balance is not enough to cover this order
            </p>
          )}
        </div>
      )}
    </div>
  );
}
