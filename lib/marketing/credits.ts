import {
  documentStore,
  DocumentID,
  DocumentQuery,
  isDocumentStoreConfigured,
} from "@/lib/document-store";
import {
  getWalletBalance,
  makeReferralCode,
  fetchReferralsByUser,
} from "./data";
import type { Referral, WalletBalance } from "./types";

export const REFERRAL_REWARD = 100;

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  if (!isDocumentStoreConfigured) {
    return makeReferralCode(userId);
  }

  try {
    const { documents } = await documentStore.listDocuments(
      "thriftx",
      "referrals",
      [DocumentQuery.equal("referrerUserId", userId), DocumentQuery.limit(1)],
    );

    if (documents.length > 0) {
      return String(documents[0].code ?? makeReferralCode(userId));
    }

    const code = makeReferralCode(userId);
    let created = false;
    let attempt = 0;
    while (!created && attempt < 5) {
      try {
        await documentStore.createDocument(
          "thriftx",
          "referrals",
          DocumentID.unique(),
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
        attempt++;
        const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
        const regenerated = `THRIFTX-${suffix}`;
        void regenerated;
        void err;
      }
    }
    return code;
  } catch (error) {
    console.error("getOrCreateReferralCode fallback:", error);
    return makeReferralCode(userId);
  }
}

export async function recordReferralRegistration(
  code: string,
  newUserId: string,
  email: string,
) {
  if (!isDocumentStoreConfigured) return;

  try {
    const { documents } = await documentStore.listDocuments(
      "thriftx",
      "referrals",
      [
        DocumentQuery.equal("code", code.trim().toUpperCase()),
        DocumentQuery.equal("status", "pending"),
        DocumentQuery.limit(1),
      ],
    );

    if (documents.length === 0) return;

    const referralDoc = documents[0];
    await documentStore.updateDocument(
      "thriftx",
      "referrals",
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

export async function completeReferral(referralId: string) {
  if (!isDocumentStoreConfigured) return;

  try {
    const referral = await documentStore.getDocument(
      "thriftx",
      "referrals",
      referralId,
    );

    if (referral.status === "completed") return;

    const reward = Number(referral.rewardAmount || REFERRAL_REWARD);

    await documentStore.updateDocument("thriftx", "referrals", referralId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });

    await addCredit(
      String(referral.referrerUserId ?? ""),
      reward,
      `Referral reward (${referral.code})`,
    );
  } catch (error) {
    console.error("completeReferral:", error);
  }
}

export async function addCredit(
  userId: string,
  amount: number,
  reason: string,
  orderId?: string,
) {
  if (!isDocumentStoreConfigured || !userId || amount <= 0) return;

  try {
    await documentStore.createDocument(
      "thriftx",
      "credits",
      DocumentID.unique(),
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

export async function debitCredit(
  userId: string,
  amount: number,
  reason: string,
  orderId?: string,
) {
  if (!isDocumentStoreConfigured || !userId || amount <= 0) return;

  try {
    const wallet = await getWalletBalance(userId);
    const usable = Math.min(amount, wallet.balance);
    if (usable <= 0) return;

    await documentStore.createDocument(
      "thriftx",
      "credits",
      DocumentID.unique(),
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
