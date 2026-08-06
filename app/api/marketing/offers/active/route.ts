import { NextRequest, NextResponse } from "next/server";
import { fetchActiveOffers } from "@/lib/marketing/data";
import {
  evaluateOffers,
  type CartLine,
  type OfferResult,
} from "@/lib/marketing/offers";

export async function POST(req: NextRequest) {
  try {
    const { items } = (await req.json()) as { items?: CartLine[] };

    if (!items || items.length === 0) {
      return NextResponse.json({ success: true, offers: [], results: [] });
    }

    const activeOffers = await fetchActiveOffers();
    const results: OfferResult[] = evaluateOffers(activeOffers, items);

    // Include offers that did not apply (so the UI can show "progress toward unlock")
    const applicableIds = new Set(results.map((r) => r.offerId));
    const pendingOffers = activeOffers.filter((o) => !applicableIds.has(o.id));

    return NextResponse.json({
      success: true,
      applied: results,
      offers: activeOffers,
      pending: pendingOffers,
    });
  } catch (error) {
    console.error("POST /api/marketing/offers/active error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load offers",
        offers: [],
        applied: [],
      },
      { status: 500 },
    );
  }
}
