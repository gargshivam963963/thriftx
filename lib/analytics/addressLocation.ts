import "server-only";

import {
  DOCUMENT_COLLECTIONS,
  DOCUMENT_DATABASE_ID,
  DocumentQuery,
  documentStore,
} from "@/lib/document-store";

export interface SavedAddressLocation {
  city: string | null;
  state: string | null;
}

/**
 * Resolve saved-address city/state for a set of user IDs.
 *
 * Addresses live in the document store (`addresses` collection), NOT the
 * Prisma `Address` table — that model is declared in the schema but has no
 * matching table in the live database, so querying `prisma.address` throws
 * and used to blank out whole admin pages. Always read locations through here.
 *
 * The default address wins; otherwise the most recently updated one is used.
 * Users without a saved address are simply absent from the returned map.
 */
export async function getAddressLocationsForUsers(
  userIds: readonly string[],
): Promise<Map<string, SavedAddressLocation>> {
  const locations = new Map<string, SavedAddressLocation>();
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) return locations;

  try {
    const response = await documentStore.listDocuments(
      DOCUMENT_DATABASE_ID,
      DOCUMENT_COLLECTIONS.addresses,
      [DocumentQuery.equal("userId", uniqueIds)],
    );

    // Pick the best address per user: default wins, otherwise most recently
    // updated (documents are not ordered by isDefault at the query layer).
    const best = new Map<
      string,
      { value: SavedAddressLocation; isDefault: boolean; updatedAt: string }
    >();
    for (const doc of response.documents) {
      const userId = String(doc.userId || "");
      if (!userId) continue;
      const city = doc.city ? String(doc.city) : null;
      const state = doc.state ? String(doc.state) : null;
      if (!city && !state) continue;
      const isDefault = Boolean(doc.isDefault);
      const updatedAt = String(doc.$updatedAt || "");
      const existing = best.get(userId);
      if (
        !existing ||
        (isDefault && !existing.isDefault) ||
        (isDefault === existing.isDefault && updatedAt > existing.updatedAt)
      ) {
        best.set(userId, { value: { city, state }, isDefault, updatedAt });
      }
    }

    for (const [userId, entry] of best) {
      locations.set(userId, entry.value);
    }
  } catch (error) {
    console.warn("getAddressLocationsForUsers failed:", error);
  }

  return locations;
}