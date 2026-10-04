import { NextRequest, NextResponse } from "next/server";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import { requestOrderReturn } from "@/lib/services/orderService";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;

    if (!id || id.length > 128) {
      return NextResponse.json(
        { success: false, message: "Invalid order reference." },
        { status: 400 },
      );
    }

    let reason = "";
    try {
      const body = await request.json();
      if (body?.reason && typeof body.reason === "string") {
        reason = body.reason.trim().slice(0, 500);
      }
    } catch {
      // Body parse error
    }

    if (!reason) {
      return NextResponse.json(
        { success: false, message: "A reason for the return is required." },
        { status: 400 },
      );
    }

    const order = await requestOrderReturn(user.id, id, reason);

    return NextResponse.json({
      success: true,
      message: "Return requested successfully. Our team will review your request.",
      order,
    });
  } catch (error) {
    if (error instanceof AuthGuardError) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to submit return request.",
      },
      { status: 400 },
    );
  }
}
