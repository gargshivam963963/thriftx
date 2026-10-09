export async function shipOrder(orderId: string) {
  const response = await fetch(
    `/api/admin/orders/${encodeURIComponent(orderId)}/ship`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json().catch(() => ({
    success: false,
    message: "Invalid server response.",
  }));

  if (!response.ok || data?.success !== true) {
    throw new Error(data?.message || "Shipment could not be created.");
  }

  return data;
}
