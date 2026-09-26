import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { razorpay } from "@/lib/razorpay";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Protection (Max 15 booking attempts / min per IP)
    const clientIp = getClientIp(req);
    const limitCheck = rateLimit(`booking:${clientIp}`, { limit: 15, windowMs: 60_000 });
    if (!limitCheck.success) {
      logger.warn("Rate limit exceeded on bookings API", { ip: clientIp });
      return NextResponse.json(
        { error: "Too many booking attempts. Please wait a moment." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limitCheck.reset),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 2. Authentication
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);
    if (!dbUser) {
      return NextResponse.json({ error: "User account could not be found" }, { status: 401 });
    }

    const { eventId, quantity } = await req.json();
    if (!eventId || !quantity || typeof quantity !== "number" || quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: "Invalid request parameters. Quantity must be between 1 and 10." },
        { status: 400 }
      );
    }

    // 3. Atomically check availability and create booking
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error("EVENT_NOT_FOUND");
      }

      if (event.status !== "PUBLISHED") {
        throw new Error("EVENT_NOT_AVAILABLE");
      }

      const availableSeats = event.capacity - event.seatsBooked;
      if (availableSeats < quantity) {
        throw new Error("NOT_ENOUGH_SEATS");
      }

      const price = Number(event.price);
      const totalAmount = price * quantity;

      if (totalAmount === 0) {
        // Free event: Immediately allocate seats and confirm booking atomically
        const [booking] = await Promise.all([
          tx.booking.create({
            data: {
              eventId,
              userId: dbUser.id,
              quantity,
              totalAmount: 0,
              status: "CONFIRMED",
            },
          }),
          tx.event.update({
            where: { id: eventId },
            data: {
              seatsBooked: { increment: quantity },
            },
          }),
        ]);

        return { type: "FREE" as const, booking, event };
      }

      // Paid event: Create pending booking
      const booking = await tx.booking.create({
        data: {
          eventId,
          userId: dbUser.id,
          quantity,
          totalAmount,
          status: "PENDING",
        },
      });

      return { type: "PAID" as const, booking, event, totalAmount };
    });

    if (result.type === "FREE") {
      logger.info("Free ticket booked successfully", {
        bookingId: result.booking.id,
        eventId,
        userId: dbUser.id,
      });
      return NextResponse.json({ booking: result.booking, type: "FREE" }, { status: 201 });
    }

    // 4. Razorpay Order Creation for Paid Ticket
    const orderOptions = {
      amount: Math.round(result.totalAmount * 100), // paise
      currency: "INR",
      receipt: result.booking.id,
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Save payment record
    await prisma.payment.create({
      data: {
        bookingId: result.booking.id,
        razorpayOrderId: razorpayOrder.id,
        amount: result.totalAmount,
        status: "CREATED",
      },
    });

    logger.info("Paid order created successfully", {
      bookingId: result.booking.id,
      orderId: razorpayOrder.id,
      amount: result.totalAmount,
    });

    return NextResponse.json(
      {
        booking: result.booking,
        razorpayOrderId: razorpayOrder.id,
        amount: orderOptions.amount,
        currency: orderOptions.currency,
        type: "PAID",
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "EVENT_NOT_FOUND") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (error.message === "EVENT_NOT_AVAILABLE") {
      return NextResponse.json({ error: "Event is not open for registration" }, { status: 400 });
    }
    if (error.message === "NOT_ENOUGH_SEATS") {
      return NextResponse.json(
        { error: "Insufficient seats available for this quantity" },
        { status: 400 }
      );
    }

    logger.error("POST /api/bookings unexpected error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
