import { getOrder, updateShipment } from "@/lib/services/orderService";
import { shipmentService } from "./services/shipment";
import { getBestCourier } from "./services/courier";
import { generateAwb } from "./services/awb";
import { requestPickup } from "./services/pickupScheduler";

export async function createShipmentFromOrder(orderId: string) {
  const order = await getOrder(orderId);

  const result = await shipmentService.createShipment({
    orderId: order.orderId,
    customerName: `${order.firstName} ${order.lastName}`,
    email: "",
    phone: order.phone,
    address: order.address,
    city: order.city,
    state: "Haryana",
    country: order.country,
    pincode: order.postalCode,
    amount: order.total,
    cod: order.paymentMethod === "cod",
    weight: 0.5,
    length: 25,
    width: 20,
    height: 5,
  });

  if (!result.success || !result.shipment) {
    return result;
  }

  const bestCourier = await getBestCourier(
    "132103", // Replace with your warehouse pincode
    order.postalCode,
    order.paymentMethod === "cod",
    0.5,
  );

  const awb = await generateAwb(
    result.shipment.shipmentId ?? "",
    bestCourier.courierCompanyId,
  );

  const pickup = await requestPickup(result.shipment.shipmentId ?? "");

  await updateShipment(order.$id, {
    shippingProvider: "shiprocket",

    shipmentStatus: "ready_to_ship",

    pickupStatus: pickup?.pickup_status === 1 ? "scheduled" : "pending",

    shipmentId: result.shipment.shipmentId,

    courier: bestCourier.courierName,

    courierId: String(bestCourier.courierCompanyId),

    awbNumber: awb?.awb_code,

    trackingNumber: awb?.awb_code,

    trackingUrl: result.trackingUrl,

    labelUrl: result.labelUrl,

    invoiceUrl: result.invoiceUrl,

    estimatedDelivery: result.estimatedDelivery,
  });

  return {
    ...result,
    courier: bestCourier,
    awb,
    pickup,
  };
}
