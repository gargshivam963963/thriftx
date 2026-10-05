import { NextRequest, NextResponse } from "next/server";
import { AuthGuardError, requireUser } from "@/lib/auth-guard";
import {
  listUserNotifications,
  markNotificationsRead,
} from "@/lib/notifications/server";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

function failure(error: unknown) {
  if (error instanceof AuthGuardError) {
    return NextResponse.json(
      { success: false, message: "Authentication required." },
      { status: error.status, headers: NO_STORE },
    );
  }
  console.error("/api/notifications failed:", error);
  return NextResponse.json(
    { success: false, message: "Unable to load notifications." },
    { status: 500, headers: NO_STORE },
  );
}

export async function GET() {
  try {
    const user = await requireUser();
    const data = await listUserNotifications(user.id);
    return NextResponse.json({ success: true, ...data }, { headers: NO_STORE });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body: unknown = await request.json().catch(() => null);
    const record =
      body && typeof body === "object" ? (body as Record<string, unknown>) : {};

    let ids: string[] | "all";
    if (record.all === true) {
      ids = "all";
    } else if (
      Array.isArray(record.ids) &&
      record.ids.every((id) => typeof id === "string" && id.length <= 64)
    ) {
      ids = record.ids as string[];
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid request." },
        { status: 400, headers: NO_STORE },
      );
    }

    await markNotificationsRead(user.id, ids);
    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch (error) {
    return failure(error);
  }
}
