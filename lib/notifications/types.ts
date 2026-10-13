export type NotificationType =
  | "order_placed"
  | "order_processing"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "tracking_ready"
  | "return_update"
  | "refund_update";

export interface UserNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href?: string;
  createdAt: string;
  read: boolean;
}

export type NotificationChannel = "inapp" | "whatsapp" | "sms";

export interface NotificationPreferences {
  inapp: boolean;
  whatsapp: boolean;
  sms: boolean;
  orderUpdates: boolean;
  shippingUpdates: boolean;
  returnsRefunds: boolean;
  offersAnnouncements: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  inapp: true,
  whatsapp: true,
  sms: false,
  orderUpdates: true,
  shippingUpdates: true,
  returnsRefunds: true,
  offersAnnouncements: true,
};

const STORAGE_KEY = "thriftx:notification-preferences:v1";

function sanitize(value: unknown): NotificationPreferences {
  if (!value || typeof value !== "object") return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  const record = value as Record<string, unknown>;
  const pick = (key: keyof NotificationPreferences) =>
    typeof record[key] === "boolean"
      ? (record[key] as boolean)
      : DEFAULT_NOTIFICATION_PREFERENCES[key];
  return {
    inapp: pick("inapp"),
    whatsapp: pick("whatsapp"),
    sms: pick("sms"),
    orderUpdates: pick("orderUpdates"),
    shippingUpdates: pick("shippingUpdates"),
    returnsRefunds: pick("returnsRefunds"),
    offersAnnouncements: pick("offersAnnouncements"),
  };
}

export function loadNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    return sanitize(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

export function saveNotificationPreferences(prefs: NotificationPreferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // storage unavailable — preferences simply won't persist
  }
  // Fire-and-forget sync so a future backend can honour SMS/WhatsApp.
  try {
    void fetch("/api/notifications/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // never break the UI for a preferences sync
  }
}

