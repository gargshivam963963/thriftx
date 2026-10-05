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
