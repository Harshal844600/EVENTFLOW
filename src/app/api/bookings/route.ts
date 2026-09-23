import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, quantity } = await req.json();
    if (!eventId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Event is not available for booking" }, { status: 400 });
    }

    if (event.capacity - event.seatsBooked < quantity) {
      return NextResponse.json({ error: "Not enough seats available" }, { status: 400 });
    }

    const price = Number(event.price);
    const totalAmount = price * quantity;

    // Create Booking
    const booking = await prisma.booking.create({
      data: {
        eventId,
        userId: dbUser.id,
        quantity,
        totalAmount,
        status: "PENDING",
      },
    });

    if (totalAmount === 0) {
      // Free event, auto-confirm
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" },
      });
      // Also update seats
      await prisma.event.update({
        where: { id: eventId },
        data: { seatsBooked: { increment: quantity } },
      });
      return NextResponse.json({ booking, type: "FREE" }, { status: 201 });
    }

    // Razorpay Order Creation
    const orderOptions = {
      amount: Math.round(totalAmount * 100), // Razorpay accepts smallest currency unit (paise)
      currency: "INR",
      receipt: booking.id,
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Create Payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        status: "CREATED",
      },
    });

    return NextResponse.json({
      booking,
      razorpayOrderId: razorpayOrder.id,
      amount: orderOptions.amount,
      currency: orderOptions.currency,
      type: "PAID"
    }, { status: 201 });

  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
