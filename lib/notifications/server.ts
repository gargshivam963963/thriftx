import "server-only";

import { createHash } from "node:crypto";
import {
  documentStore,
  DocumentQuery,
  isDocumentStoreConfigured,
} from "@/lib/document-store";
import type { NotificationType, UserNotification } from "./types";

const COLLECTION = "notifications";
const LIST_LIMIT = 30;
const MAX_IDS_PER_REQUEST = 50;

interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string;
  /** Same key never creates a second notification (retries, double clicks). */
  dedupeKey: string;
}

function idFromKey(key: string) {
  return createHash("sha256").update(key).digest("hex").slice(0, 32);
}

/** Never throws: a notification failure must not break order flows. */
export async function createNotification(input: NotificationInput) {
  if (!isDocumentStoreConfigured || !input.userId) return;
  try {
    await documentStore.createDocument(
      "thriftx",
      COLLECTION,
      idFromKey(`${input.userId}:${input.dedupeKey}`),
      {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        href: input.href ?? "",
        read: false,
      },
    );
  } catch (error) {
    // A duplicate dedupe key is expected and silent.
    const message = error instanceof Error ? error.message : "";
    if (!/unique|constraint|already/i.test(message)) {
      console.error("createNotification failed:", error);
    }
  }
}

export async function listUserNotifications(userId: string): Promise<{
  notifications: UserNotification[];
  unreadCount: number;
}> {
  if (!isDocumentStoreConfigured) return { notifications: [], unreadCount: 0 };
  const { documents } = await documentStore.listDocuments("thriftx", COLLECTION, [
    DocumentQuery.equal("userId", userId),
    DocumentQuery.orderDesc("$createdAt"),
    DocumentQuery.limit(LIST_LIMIT),
  ]);
  const notifications = documents.map((doc) => ({
    id: doc.$id,
    type: doc.type as NotificationType,
    title: String(doc.title ?? ""),
    message: String(doc.message ?? ""),
    href: typeof doc.href === "string" && doc.href ? doc.href : undefined,
    createdAt: doc.$createdAt,
    read: doc.read === true,
  }));
  return {
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
  };
}

export async function markNotificationsRead(
  userId: string,
  ids: string[] | "all",
) {
  if (!isDocumentStoreConfigured) return;
  const { documents } = await documentStore.listDocuments("thriftx", COLLECTION, [
    DocumentQuery.equal("userId", userId),
    DocumentQuery.orderDesc("$createdAt"),
    DocumentQuery.limit(LIST_LIMIT),
  ]);
  const wanted = ids === "all" ? null : new Set(ids.slice(0, MAX_IDS_PER_REQUEST));
  await Promise.all(
    documents
      .filter((doc) => doc.read !== true && (!wanted || wanted.has(doc.$id)))
      .map((doc) =>
        documentStore.updateDocument("thriftx", COLLECTION, doc.$id, {
          read: true,
        }),
      ),
  );
}
