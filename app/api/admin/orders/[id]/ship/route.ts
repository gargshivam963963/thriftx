import { NextRequest, NextResponse } from "next/server";

import { createShipmentFromOrder } from "@/lib/shipping/createShipmentFromOrder";
import { adminAuthErrorResponse } from "@/lib/auth-guard";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const { id } = await params;

    const result = await createShipmentFromOrder(id);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
