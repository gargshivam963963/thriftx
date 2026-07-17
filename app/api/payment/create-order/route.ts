import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to create Razorpay order." },
      { status: 500 },
    );
  }
}
