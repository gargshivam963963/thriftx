import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userImage, productImage } = body as {
      userImage?: string;
      productImage?: string;
    };

    console.log(
      "[api/ai/try-on] request received",
      !!userImage,
      !!productImage,
    );

    if (!userImage || !productImage) {
      return NextResponse.json(
        { error: "userImage and productImage required" },
        { status: 400 },
      );
    }

    // Placeholder behavior: echo back productImage as "result".
    // Replace this block with real AI processing integration.
  
    return NextResponse.json(
      {
        error: "AI Try-On backend is not implemented yet.",
      },
      { status: 501 },
    );
  } catch (e) {
    console.error("[api/ai/try-on] error", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
