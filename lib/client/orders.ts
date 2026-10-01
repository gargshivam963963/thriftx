import type { OrderData } from "@/lib/services/orderService";
import type { Order } from "@/lib/types/order";

export async function getUserOrders(): Promise<Order[]> {
  const response = await fetch("/api/orders", { cache: "no-store" });
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
    orders?: Order[];
  };

  if (!response.ok || !result.success || !Array.isArray(result.orders)) {
    throw new Error(result.message || "Unable to load orders");
  }

  return result.orders;
}

export async function createOrder(data: OrderData) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = (await response.json()) as {
    success?: boolean;
    message?: string;
  };

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to create order");
  }

  return result;
}
