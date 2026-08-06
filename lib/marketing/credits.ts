"use client";

import {
  databases,
  AppwriteQuery,
  AppwriteID,
  APPWRITE_DATABASE_ID,
  APPWRITE_REFERRALS_COLLECTION_ID,
  APPWRITE_CREDITS_COLLECTION_ID,
  isAppwriteDataConfigured,
} from "@/lib/appwrite";
import {
  getWalletBalance,
  makeReferralCode,
  fetchReferralsByUser,
} from "./data";
import type { Referral, WalletBalance } from "./types";

export const REFERRAL_REWARD = 100;

/**
 * Get the current user's referral code (create a referral row if needed).
 * Uses the client SDK so it must run in a client/browser context or be called
 * from a server route that has a user session cookie.
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  if (!isAppwriteDataConfigured || !APPWRITE_REFERRALS_COLLECTION_ID) {
    return makeReferralCode(userId);
  }

  try {
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_REFERRALS_COLLECTION_ID,
      [AppwriteQuery.equal("referrerUserId", userId), AppwriteQuery.limit(1)],
    );

    if (existing.documents.length > 0) {
      return (existing.documents[0].code as string) ?? makeReferralCode(userId);
    }

    const code = makeReferralCode(userId);
    // Ensure uniqueness by retrying a few times if a code collision happens
    let created = false;
    let attempt = 0;
    while (!created && attempt < 5) {
      try {
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_REFERRALS_COLLECTION_ID,
          AppwriteID.unique(),
          {
            referrerUserId: userId,
            code,
            rewardAmount: REFERRAL_REWARD,
            status: "pending",
            referredEmail: "",
            referredUserId: "",
            orderId: "",
            completedAt: "",
          },
        );
        created = true;
      } catch (err) {
        // code collision — regenerate
        attempt++;
        const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
        (code as string) = `THRIFTX-${suffix}`;
        void err;
      }
    }
    return code;
  } catch (error) {
    console.error("getOrCreateReferralCode fallback:", error);
    return makeReferralCode(userId);
  }
}

/**
 * Record a referral registration when a new user signs up using a code.
 * Called during signup flow.
 */
export async function recordReferralRegistration(
  code: string,
  newUserId: string,
  email: string,
) {
  if (!isAppwriteDataConfigured || !APPWRITE_REFERRALS_COLLECTION_ID) return;

  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_REFERRALS_COLLECTION_ID,
      [
        AppwriteQuery.equal("code", code.trim().toUpperCase()),
        AppwriteQuery.equal("status", "pending"),
        AppwriteQuery.limit(1),
      ],
    );

    if (res.documents.length === 0) return;

    const referralDoc = res.documents[0];
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_REFERRALS_COLLECTION_ID,
      referralDoc.$id,
      {
        referredUserId: newUserId,
        referredEmail: email,
      },
    );
  } catch (error) {
    console.error("recordReferralRegistration:", error);
  }
}

/**
 * Mark a referral as completed once the referred friend's order is delivered.
 * Credits the referrer's wallet.
 */
export async function completeReferral(referralId: string) {
  if (!isAppwriteDataConfigured) return;

  try {
    const referral = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_REFERRALS_COLLECTION_ID,
      referralId,
    );

    if (referral.status === "completed") return;

    const reward = Number(referral.rewardAmount || REFERRAL_REWARD);

    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_REFERRALS_COLLECTION_ID,
      referralId,
      { status: "completed", completedAt: new Date().toISOString() },
    );

    // Credit the referrer's wallet
    await addCredit(
      referral.referrerUserId,
      reward,
      `Referral reward (${referral.code})`,
    );
  } catch (error) {
    console.error("completeReferral:", error);
  }
}

/**
 * Add a credit entry to a user's wallet.
 */
export async function addCredit(
  userId: string,
  amount: number,
  reason: string,
  orderId?: string,
) {
  if (!isAppwriteDataConfigured || !APPWRITE_CREDITS_COLLECTION_ID) return;
  if (!userId || amount <= 0) return;

  try {
    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_CREDITS_COLLECTION_ID,
      AppwriteID.unique(),
      {
        userId,
        amount,
        reason,
        orderId: orderId ?? "",
      },
    );
  } catch (error) {
    console.error("addCredit:", error);
  }
}

/**
 * Apply wallet credits toward an order (debit the wallet).
 */
export async function debitCredit(
  userId: string,
  amount: number,
  reason: string,
  orderId?: string,
) {
  if (!isAppwriteDataConfigured || !APPWRITE_CREDITS_COLLECTION_ID) return;
  if (!userId || amount <= 0) return;

  try {
    const wallet = await getWalletBalance(userId);
    const usable = Math.min(amount, wallet.balance);
    if (usable <= 0) return;

    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_CREDITS_COLLECTION_ID,
      AppwriteID.unique(),
      {
        userId,
        amount: -usable,
        reason,
        orderId: orderId ?? "",
      },
    );
  } catch (error) {
    console.error("debitCredit:", error);
  }
}

export { getWalletBalance, fetchReferralsByUser };
export type { Referral, WalletBalance };
