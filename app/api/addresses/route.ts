import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { createAddress } from "@/lib/services/address/create";
import { getAddresses } from "@/lib/services/address/get";
import type { CreateAddressPayload } from "@/lib/types/address";

function isCreateAddressPayload(value: unknown): value is CreateAddressPayload {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  const requiredFields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode",
  ];

  return (
    requiredFields.every(
      (field) => typeof data[field] === "string" && data[field].trim(),
    ) &&
    ["Home", "Work", "Other"].includes(String(data.type))
  );
}

export async function GET() {
  try {
    const user = await requireUser();
    const addresses = await getAddresses(user.id);
    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("GET /api/addresses error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load addresses" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const data: unknown = await request.json();
    if (!isCreateAddressPayload(data)) {
      return NextResponse.json(
        { success: false, message: "Invalid address details" },
        { status: 400 },
      );
    }

    const address = await createAddress({ userId: user.id, data });
    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("POST /api/addresses error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create address" },
      { status: 500 },
    );
  }
}
