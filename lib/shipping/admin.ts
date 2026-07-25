export async function shipOrder(orderId: string) {
  const response = await fetch(`/api/admin/orders/${orderId}/ship`, {
    method: "POST",
  });

  return response.json();
}
