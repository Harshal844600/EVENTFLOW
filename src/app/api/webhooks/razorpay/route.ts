import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.error("RAZORPAY_WEBHOOK_SECRET is not configured on the server");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    if (!signature) {
      logger.warn("Razorpay webhook received without signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature !== signature) {
      logger.warn("Razorpay webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);
    logger.info(`Received Razorpay webhook event: ${event.event}`);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // Find payment record
      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
        include: { booking: true },
      });

      if (!payment) {
        logger.warn(`No payment record found for Razorpay order ID: ${orderId}`);
        return NextResponse.json({ success: true, message: "Ignored unknown order" });
      }

      // Idempotency: If already processed, return early to prevent duplicate seat increments
      if (payment.status === "PAID") {
        logger.info(`Payment already marked PAID for order: ${orderId}, skipping duplicate webhook.`);
        return NextResponse.json({ success: true, message: "Already processed" });
      }

      // Atomic Transaction: Execute Payment, Booking, and Seat updates together
      await prisma.$transaction(async (tx) => {
        // 1. Update Payment status
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            razorpayPaymentId: paymentId,
            razorpaySignature: signature,
          },
        });

        // 2. Confirm Booking
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CONFIRMED" },
        });

        // 3. Atomically increment event seatsBooked
        await tx.event.update({
          where: { id: payment.booking.eventId },
          data: { seatsBooked: { increment: payment.booking.quantity } },
        });
      });

      logger.info(`Payment and booking successfully confirmed for order: ${orderId}`, {
        bookingId: payment.bookingId,
        paymentId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("POST /api/webhooks/razorpay unexpected error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
