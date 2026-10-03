"use client";

import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { Loader2, Copy, Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Referral {
  $id: string;
  code?: string;
  referredEmail?: string;
  referredUserId?: string;
  orderId?: string;
  status?: string;
  completedAt?: string;
}

interface WalletInfo {
  balance: number;
  totalEarned: number;
}

export default function ReferPage() {
  const { user, loading } = useAuth();

  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReferralData = useCallback(async () => {
    try {
      setLoadingData(true);

      const [codeResponse, walletResponse] = await Promise.all([
        fetch("/api/marketing/referrals"),
        fetch("/api/marketing/credits/wallet"),
      ]);

      if (codeResponse.ok) {
        const codeData = await codeResponse.json();
        if (codeData.code) {
          setReferralCode(codeData.code);
        }
        if (codeData.referrals) {
          setReferrals(codeData.referrals || []);
        }
      }

      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setWallet(walletData);
      }
    } catch (error) {
      console.error("Failed to fetch referral data:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      return;
    }

    fetchReferralData();
  }, [user, loading, fetchReferralData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateShareLink = () => {
    if (!referralCode) return "";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/signup?ref=${referralCode}`;
  };

  const shareLink = generateShareLink();

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  const completedReferrals = referrals.filter((r) => r.status === "completed" || r.status === "reward-issued");
  const pendingReferrals = referrals.filter((r) => r.status === "first-order-placed");

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Wallet Card */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Your Wallet Balance</p>
              <h2 className="text-4xl font-bold text-primary">₹{wallet?.balance || 0}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Total Earned: ₹{wallet?.totalEarned || 0}
              </p>
            </div>
            <TrendingUp className="text-primary/50" size={32} />
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Your Referral Code</h3>

          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : referralCode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <code className="font-mono text-lg font-semibold flex-1">
                  {referralCode}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(referralCode)}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              {shareLink && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">Share this link with friends:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-muted border border-border rounded text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(shareLink)}
                      className="flex items-center gap-2"
                    >
                      <Copy size={16} />
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                💡 Share your code with friends. They&apos;ll get ₹100 off their first order, and you&apos;ll get ₹100 credit when they complete their purchase.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Unable to load your referral code.</p>
          )}
        </div>

        {/* Referrals Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Pending Referrals</p>
            <p className="text-3xl font-bold">{pendingReferrals.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Completed Referrals</p>
            <p className="text-3xl font-bold">{completedReferrals.length}</p>
          </div>
        </div>

        {/* Pending Referrals */}
        {pendingReferrals.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">
              Pending Referrals ({pendingReferrals.length})
            </h3>
            <div className="space-y-3">
              {pendingReferrals.map((referral) => (
                <div
                  key={referral.$id}
                  className="flex items-center justify-between p-3 bg-muted rounded"
                >
                  <div>
                    <p className="font-medium">{referral.referredEmail}</p>
                    <p className="text-sm text-muted-foreground">
                      Order placed • Awaiting delivery
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-warning">Pending</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Referrals */}
        {completedReferrals.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Completed Referrals ({completedReferrals.length})
            </h3>
            <div className="space-y-3">
              {completedReferrals.map((referral) => (
                <div
                  key={referral.$id}
                  className="flex items-center justify-between p-3 bg-muted rounded"
                >
                  <div>
                    <p className="font-medium">{referral.referredEmail}</p>
                    <p className="text-sm text-muted-foreground">
                      ✓ Reward earned
                      {referral.completedAt && (
                        <span>
                          {" "}
                          on{" "}
                          {new Date(referral.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    +₹100
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {referrals.length === 0 && !loadingData && (
          <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">No referrals yet</p>
            <p className="text-sm text-muted-foreground">
              Share your code to start earning rewards!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
