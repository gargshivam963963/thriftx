import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { setDefaultAddress } from "@/lib/services/address/setDefault";

type RouteContext = { params: Promise<{ addressId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { addressId } = await context.params;
    const address = await setDefaultAddress({
      userId: user.id,
      addressId,
    });
    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("POST /api/addresses/[addressId]/default error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to set default address" },
      { status: 500 },
    );
  }
}
