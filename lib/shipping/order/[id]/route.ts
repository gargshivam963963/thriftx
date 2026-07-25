import { NextRequest, NextResponse } from "next/server";

import { createShipmentFromOrder } from "@/lib/shipping/createShipmentFromOrder";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const result = await createShipmentFromOrder(params.id);

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
