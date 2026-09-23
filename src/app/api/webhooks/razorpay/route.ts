import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // Find the payment record
      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
        include: { booking: true },
      });

      if (payment && payment.status !== "PAID") {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            razorpayPaymentId: paymentId,
            razorpaySignature: signature, // For webhook, this is the webhook signature, but usually we just want to save it as proof
          },
        });

        // Update booking status
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CONFIRMED" },
        });

        // Increment event seats
        await prisma.event.update({
          where: { id: payment.booking.eventId },
          data: { seatsBooked: { increment: payment.booking.quantity } },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/webhooks/razorpay error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
