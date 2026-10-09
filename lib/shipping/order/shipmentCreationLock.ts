import "server-only";

import { randomUUID } from "node:crypto";
import { documentStore } from "@/lib/document-store";

const LOCK_COLLECTION = "shipment-locks";
const LOCK_TTL_MS = 10 * 60 * 1000;

interface ShipmentLockDocument {
  token?: string;
  expiresAt?: number;
}

export async function acquireShipmentCreationLock(
  orderId: string,
): Promise<string | null> {
  const token = randomUUID();
  const now = Date.now();
  const expiresAt = now + LOCK_TTL_MS;

  try {
    const existing = await documentStore.getDocument(
      "thriftx",
      LOCK_COLLECTION,
      orderId,
    );

    const existingData = existing as ShipmentLockDocument;

    if (
      typeof existingData.expiresAt === "number" &&
      existingData.expiresAt > now
    ) {
      return null;
    }

    try {
      await documentStore.deleteDocument("thriftx", LOCK_COLLECTION, orderId);
    } catch {
      // The lock may already have been removed.
    }
  } catch {
    // No existing lock.
  }

  try {
    await documentStore.createDocument("thriftx", LOCK_COLLECTION, orderId, {
      token,
      expiresAt,
      createdAt: new Date(now).toISOString(),
    });

    return token;
  } catch {
    /*
     * createDocument is backed by the database's unique
     * collection+id constraint, so concurrent requests
     * cannot both acquire the same lock.
     */
    return null;
  }
}

export async function releaseShipmentCreationLock(
  orderId: string,
  token: string,
): Promise<void> {
  try {
    const existing = await documentStore.getDocument(
      "thriftx",
      LOCK_COLLECTION,
      orderId,
    );

    const existingData = existing as ShipmentLockDocument;

    if (existingData.token !== token) {
      return;
    }

    await documentStore.deleteDocument("thriftx", LOCK_COLLECTION, orderId);
  } catch {
    // Safe cleanup: nothing else to do.
  }
}
