import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getRazorpayCredentials } from "@/lib/razorpay";
import { logger } from "@/lib/logger";
import { invalidateLiveFeedCache } from "@/app/api/events/live-feed/route";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const orderId = body.order_id || body.razorpay_order_id;
    const paymentId = body.payment_id || body.razorpay_payment_id;
    const signature = body.signature || body.razorpay_signature;
    const bookingId = body.bookingId || body.booking_id;

    // 1. Validate required fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: order_id, payment_id, and signature are required.",
        },
        { status: 400 }
      );
    }

    const { key_secret } = getRazorpayCredentials();
    if (!key_secret) {
      logger.error("RAZORPAY_KEY_SECRET is not configured on server");
      return NextResponse.json(
        { success: false, error: "Server payment configuration error" },
        { status: 500 }
      );
    }

    // 2. Generate expected signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const dataToSign = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(dataToSign)
      .digest("hex");

    // Timing-safe comparison to prevent timing attacks
    const genBuffer = Buffer.from(generatedSignature, "utf-8");
    const sigBuffer = Buffer.from(String(signature), "utf-8");

    const isMatch =
      genBuffer.length === sigBuffer.length &&
      crypto.timingSafeEqual(genBuffer, sigBuffer);

    if (!isMatch) {
      logger.warn("Razorpay signature verification failed", {
        orderId,
        paymentId,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Signature verification failed. Potential tampering detected.",
        },
        { status: 400 }
      );
    }

    logger.info("Razorpay payment signature verified successfully", {
      orderId,
      paymentId,
    });

    // 3. If connected to a booking or payment record in the database, update status atomically
    let updatedBooking = null;
    try {
      const existingPayment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
        include: { booking: true },
      });

      const targetBookingId = bookingId || existingPayment?.bookingId;

      if (targetBookingId) {
        await prisma.$transaction(async (tx) => {
          // Update Payment record
          if (existingPayment) {
            await tx.payment.update({
              where: { id: existingPayment.id },
              data: {
                status: "PAID",
                razorpayPaymentId: paymentId,
              },
            });
          }

          // Update Booking record
          const booking = await tx.booking.findUnique({
            where: { id: targetBookingId },
            include: { event: true },
          });

          if (booking && booking.status !== "CONFIRMED") {
            updatedBooking = await tx.booking.update({
              where: { id: targetBookingId },
              data: { status: "CONFIRMED" },
            });

            // Increment event seats
            await tx.event.update({
              where: { id: booking.eventId },
              data: { seatsBooked: { increment: booking.quantity } },
            });
          }
        });

        // Eagerly clear live feed cache to reflect updated seat count across all client UIs
        invalidateLiveFeedCache();
      }
    } catch (dbError) {
      // Non-fatal database update error logged, signature itself is verified
      logger.error("Error updating database after payment verification", dbError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment signature verified successfully",
        order_id: orderId,
        payment_id: paymentId,
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error("POST /api/verify-payment unexpected error", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
