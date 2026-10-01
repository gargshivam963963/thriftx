import "server-only";

import { getCartProductsForUser } from "./cartProducts.server";
import { getAddresses } from "./address";
import { getCachedShippingRates } from "@/lib/shipping/cachedRates";
import {
  getCheckoutShippingOptions,
  isLocalDelivery,
} from "@/lib/shipping/checkout-options";
import { SHIPPING_DEFAULTS } from "@/lib/shipping/constants";
import type { ShippingRate } from "@/lib/shipping/types";

export class CheckoutPricingError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 409,
  ) {
    super(message);
  }
}

export async function getCheckoutPricing(
  userId: string,
  addressId: string,
  deliveryMethod: string,
) {
  if (!addressId.trim() || !deliveryMethod.trim()) {
    throw new CheckoutPricingError("Invalid delivery details.", 400);
  }

  const addresses = await getAddresses(userId);
  const address = addresses.find((item) => item.$id === addressId);
  if (!address) {
    throw new CheckoutPricingError("Select a valid saved address.", 409);
  }

  const city = address.city;
  const pincode = address.pincode;
  if (!city.trim() || !/^\d{6}$/.test(pincode)) {
    throw new CheckoutPricingError("The selected address is incomplete.", 409);
  }

  const cartItems = await getCartProductsForUser(userId);
  if (cartItems.length === 0) {
    throw new CheckoutPricingError("Your cart is empty.", 409);
  }

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const products = JSON.stringify(
    cartItems.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.primaryImage,
      size: item.size,
    })),
  );

  let rates: ShippingRate[] = [];
  if (!isLocalDelivery(city, pincode)) {
    try {
      rates = await getCachedShippingRates(
        pincode,
        SHIPPING_DEFAULTS.defaultWeight,
      );
    } catch {
      rates = [];
    }
  }

  const shippingMethod = getCheckoutShippingOptions(
    city,
    pincode,
    subtotal,
    rates,
  ).find((option) => option.name === deliveryMethod);

  if (!shippingMethod) {
    throw new CheckoutPricingError(
      "The selected shipping method is no longer available.",
      409,
    );
  }

  const shipping = shippingMethod.price;
  const nameParts = address.fullName.trim().split(/\s+/);

  return {
    addressId,
    firstName: nameParts[0] ?? "",
    lastName: nameParts.slice(1).join(" "),
    phone: address.phone,
    address: [address.addressLine1, address.addressLine2, address.landmark]
      .filter(Boolean)
      .join(", "),
    city,
    postalCode: pincode,
    country: "India",
    deliveryMethod: shippingMethod.name,
    subtotal,
    products,
    shipping,
    total: subtotal + shipping,
  };
}
