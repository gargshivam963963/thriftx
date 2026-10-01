import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { deleteAddress } from "@/lib/services/address/delete";
import { updateAddress } from "@/lib/services/address/update";
import type { UpdateAddressPayload } from "@/lib/types/address";

const addressFields = new Set([
  "fullName",
  "phone",
  "alternatePhone",
  "addressLine1",
  "addressLine2",
  "landmark",
  "city",
  "state",
  "pincode",
  "type",
  "isDefault",
]);

function isUpdateAddressPayload(value: unknown): value is UpdateAddressPayload {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  const entries = Object.entries(data);

  return (
    entries.length > 0 &&
    entries.every(([key, fieldValue]) => {
      if (!addressFields.has(key)) return false;
      if (key === "type") {
        return ["Home", "Work", "Other"].includes(String(fieldValue));
      }
      if (key === "isDefault") return typeof fieldValue === "boolean";
      return typeof fieldValue === "string";
    })
  );
}

type RouteContext = { params: Promise<{ addressId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { addressId } = await context.params;
    const data: unknown = await request.json();
    if (!isUpdateAddressPayload(data)) {
      return NextResponse.json(
        { success: false, message: "Invalid address details" },
        { status: 400 },
      );
    }

    const address = await updateAddress({
      userId: user.id,
      addressId,
      data,
    });
    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("PATCH /api/addresses/[addressId] error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update address" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser();
    const { addressId } = await context.params;
    await deleteAddress(user.id, addressId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/addresses/[addressId] error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete address" },
      { status: 500 },
    );
  }
}
