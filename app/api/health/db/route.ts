import { NextResponse } from "next/server";

import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function GET() {
  if (!isDatabaseConfigured || !prisma) {
    return NextResponse.json(
      {
        ok: false,
        database: "not_configured",
        message: "DATABASE_URL is not configured.",
      },
      { status: 503 },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      database: "connected",
      provider: "postgresql",
    });
  } catch (error) {
    console.error("[db-health]", error);

    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: "Database connection failed.",
      },
      { status: 503 },
    );
  }
}
