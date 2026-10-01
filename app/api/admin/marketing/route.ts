import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminAuthErrorResponse } from "@/lib/auth-guard";
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  listSales,
  createSale,
  updateSale,
  deleteSale,
} from "@/lib/marketing/server";

// Single admin marketing endpoint handling CRUD for all promo types.
// Pass `type` in the body: coupon | offer | announcement | sale
// and `action`: list | create | update | delete

export async function POST(req: NextRequest) {
  const authError = await adminAuthErrorResponse();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { type, action, id, data } = body;

    switch (`${type}:${action}`) {
      // ─── Coupons ───
      case "coupon:list":
        return NextResponse.json({ success: true, items: await listCoupons() });
      case "coupon:create":
        return NextResponse.json({
          success: true,
          item: await createCoupon(data),
        });
      case "coupon:update":
        return NextResponse.json({
          success: true,
          item: await updateCoupon(id, data),
        });
      case "coupon:delete":
        await deleteCoupon(id);
        return NextResponse.json({ success: true });

      // ─── Offers ───
      case "offer:list":
        return NextResponse.json({ success: true, items: await listOffers() });
      case "offer:create":
        return NextResponse.json({
          success: true,
          item: await createOffer(data),
        });
      case "offer:update":
        return NextResponse.json({
          success: true,
          item: await updateOffer(id, data),
        });
      case "offer:delete":
        await deleteOffer(id);
        return NextResponse.json({ success: true });

      // ─── Announcements ───
      case "announcement:list":
        return NextResponse.json({
          success: true,
          items: await listAnnouncements(),
        });
      case "announcement:create": {
        const item = await createAnnouncement(data);
        revalidatePath("/api/marketing/announcements");
        return NextResponse.json({ success: true, item });
      }
      case "announcement:update": {
        const item = await updateAnnouncement(id, data);
        revalidatePath("/api/marketing/announcements");
        return NextResponse.json({ success: true, item });
      }
      case "announcement:delete":
        await deleteAnnouncement(id);
        revalidatePath("/api/marketing/announcements");
        return NextResponse.json({ success: true });

      // ─── Sales ───
      case "sale:list":
        return NextResponse.json({ success: true, items: await listSales() });
      case "sale:create":
        return NextResponse.json({
          success: true,
          item: await createSale(data),
        });
      case "sale:update":
        return NextResponse.json({
          success: true,
          item: await updateSale(id, data),
        });
      case "sale:delete":
        await deleteSale(id);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { success: false, message: `Unknown action: ${type}:${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("POST /api/admin/marketing error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process marketing request" },
      { status: 500 },
    );
  }
}
