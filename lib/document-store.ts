import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const DOCUMENT_DATABASE_ID = "thriftx";

export const DOCUMENT_COLLECTIONS = {
  products: "products",
  genders: "genders",
  categories: "categories",
  cartItems: "cart-items",
  addresses: "addresses",
  orders: "orders",
  wishlist: "wishlists",
  coupons: "coupons",
  offers: "offers",
  announcements: "announcements",
  sales: "sales",
  referrals: "referrals",
  credits: "credits",
  analyticsEvents: "analytics-events",
  analyticsSessions: "analytics-sessions",
} as const;

export type DocumentCollectionKey =
  (typeof DOCUMENT_COLLECTIONS)[keyof typeof DOCUMENT_COLLECTIONS];

type DocumentPayload = Record<string, unknown>;
type Query =
  | { kind: "equal"; attribute: string; values: unknown[] }
  | { kind: "order"; attribute: string; direction: "asc" | "desc" }
  | { kind: "limit"; value: number };

export interface StoredDocument extends DocumentPayload {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export const DocumentQuery = {
  equal(attribute: string, value: unknown | unknown[]): Query {
    return {
      kind: "equal",
      attribute,
      values: Array.isArray(value) ? value : [value],
    };
  },
  orderAsc(attribute: string): Query {
    return { kind: "order", attribute, direction: "asc" };
  },
  orderDesc(attribute: string): Query {
    return { kind: "order", attribute, direction: "desc" };
  },
  limit(value: number): Query {
    return { kind: "limit", value };
  },
};

export const DocumentID = {
  unique(): string {
    return crypto.randomUUID().replaceAll("-", "");
  },
};

function getPrisma() {
  if (!isDatabaseConfigured || !prisma) {
    throw new Error("Neon database is not configured");
  }
  return prisma;
}

function toPayload(value: unknown): Prisma.InputJsonValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Document data must be an object");
  }
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function toDocument(row: {
  id: string;
  data: unknown;
  createdAt: Date;
  updatedAt: Date;
}): StoredDocument {
  return {
    ...(toPayload(row.data) as DocumentPayload),
    $id: row.id,
    $createdAt: row.createdAt.toISOString(),
    $updatedAt: row.updatedAt.toISOString(),
  };
}

function readAttribute(document: StoredDocument, attribute: string): unknown {
  if (attribute === "$id") return document.$id;
  if (attribute === "$createdAt") return document.$createdAt;
  if (attribute === "$updatedAt") return document.$updatedAt;
  return document[attribute];
}

function compareValues(left: unknown, right: unknown): number {
  if (left == null && right == null) return 0;
  if (left == null) return -1;
  if (right == null) return 1;
  if (typeof left === "number" && typeof right === "number")
    return left - right;
  return String(left).localeCompare(String(right));
}

export const documentStore = {
  async listDocuments(
    _databaseId: string,
    collectionKey: DocumentCollectionKey | string,
    queries: Query[] = [],
  ): Promise<{ documents: StoredDocument[]; total: number }> {
    const db = getPrisma();
    const databaseFilters: Prisma.StoredDocumentWhereInput[] = [];
    const pushedEqualities = new Set<Query>();

    for (const query of queries) {
      if (
        query.kind !== "equal" ||
        query.values.length === 0 ||
        query.attribute.startsWith("$") ||
        !query.values.every(
          (value) =>
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean",
        )
      ) {
        continue;
      }

      databaseFilters.push({
        OR: query.values.map((value) => ({
          data: {
            path: [query.attribute],
            equals: value as Prisma.InputJsonValue,
          },
        })),
      });
      pushedEqualities.add(query);
    }

    const rows = await db.storedDocument.findMany({
      where: {
        collectionKey,
        ...(databaseFilters.length > 0 ? { AND: databaseFilters } : {}),
      },
    });
    let documents = rows.map(toDocument);

    for (const query of queries) {
      if (query.kind === "equal") {
        if (pushedEqualities.has(query)) continue;
        documents = documents.filter((document) =>
          query.values.some(
            (value) => readAttribute(document, query.attribute) === value,
          ),
        );
      } else if (query.kind === "order") {
        const direction = query.direction === "asc" ? 1 : -1;
        documents.sort(
          (left, right) =>
            direction *
            compareValues(
              readAttribute(left, query.attribute),
              readAttribute(right, query.attribute),
            ),
        );
      }
    }

    const total = documents.length;
    const limitQuery = queries.find((query) => query.kind === "limit");
    if (limitQuery?.kind === "limit") {
      documents = documents.slice(0, Math.max(0, limitQuery.value));
    }

    return { documents, total };
  },

  async getDocument(
    _databaseId: string,
    collectionKey: DocumentCollectionKey | string,
    id: string,
  ): Promise<StoredDocument> {
    const row = await getPrisma().storedDocument.findUnique({
      where: { collectionKey_id: { collectionKey, id } },
    });
    if (!row) throw new Error("Document not found");
    return toDocument(row);
  },

  async createDocument(
    _databaseId: string,
    collectionKey: DocumentCollectionKey | string,
    id: string,
    data: DocumentPayload,
  ): Promise<StoredDocument> {
    const row = await getPrisma().storedDocument.create({
      data: { collectionKey, id, data: toPayload(data) },
    });
    return toDocument(row);
  },

  async updateDocument(
    _databaseId: string,
    collectionKey: DocumentCollectionKey | string,
    id: string,
    data: DocumentPayload,
  ): Promise<StoredDocument> {
    const db = getPrisma();
    const existing = await this.getDocument(_databaseId, collectionKey, id);
    const { $id, $createdAt, $updatedAt, ...existingData } = existing;
    void $id;
    void $createdAt;
    void $updatedAt;

    const row = await db.storedDocument.update({
      where: { collectionKey_id: { collectionKey, id } },
      data: { data: toPayload({ ...existingData, ...data }) },
    });
    return toDocument(row);
  },

  async deleteDocument(
    _databaseId: string,
    collectionKey: DocumentCollectionKey | string,
    id: string,
  ): Promise<void> {
    await getPrisma().storedDocument.delete({
      where: { collectionKey_id: { collectionKey, id } },
    });
  },
};

export const isDocumentStoreConfigured = isDatabaseConfigured;
