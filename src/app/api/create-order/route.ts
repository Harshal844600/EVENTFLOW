import { NextResponse } from "next/server";
import { getRazorpayCredentials, getRazorpayClient } from "@/lib/razorpay";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { key_id, key_secret } = getRazorpayCredentials();

    if (!key_secret || !key_id) {
      logger.error("Razorpay API keys are not configured in environment");
      return NextResponse.json(
        { error: "Payment gateway credentials not configured on server" },
        { status: 500 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { amount, currency = "INR", receipt, notes } = body;

    // Validation: amount must be a number and at least 100 paise (₹1)
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount < 100) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum amount is 100 paise (₹1.00)." },
        { status: 400 }
      );
    }

    const orderReceipt = receipt || `rcpt_${Date.now()}`;

    // Call Razorpay API to create standard order
    const client = getRazorpayClient();
    const order = await client.orders.create({
      amount: Math.round(numericAmount),
      currency: currency || "INR",
      receipt: String(orderReceipt).substring(0, 40),
      notes: notes || undefined,
    });

    logger.info("Created Razorpay standard order", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });

    return NextResponse.json(
      {
        order_id: order.id,
        id: order.id,
        key_id: key_id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error("POST /api/create-order error", error);

    // Check for Razorpay authentication error
    if (error?.statusCode === 401 || error?.error?.code === "BAD_REQUEST_ERROR") {
      return NextResponse.json(
        { error: error?.error?.description || "Razorpay authentication failed" },
        { status: error?.statusCode || 401 }
      );
    }

    return NextResponse.json(
      {
        error: error?.error?.description || error?.message || "Failed to create Razorpay order",
      },
      { status: 500 }
    );
  }
}
