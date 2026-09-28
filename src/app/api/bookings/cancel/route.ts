import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { invalidateLiveFeedCache } from "@/lib/live-feed-cache";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const body = await req.json();
    const { bookingId, reason } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }

    // 1. Fetch booking with event details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    // 2. Validate ownership (or admin role)
    if (booking.userId !== dbUser.id && dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. You cannot cancel this booking." }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "This booking has already been cancelled." }, { status: 400 });
    }

    // 3. Process atomic cancellation
    const isPaid = Number(booking.totalAmount) > 0;
    const refundStatus = isPaid ? "PENDING" : "NONE";

    const result = await prisma.$transaction(async (tx) => {
      // Mark booking as cancelled
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancellationReason: reason || "Attendee requested cancellation",
          cancelledAt: new Date(),
          refundStatus,
          refundAmount: booking.totalAmount,
        },
      });

      // Release seats back to the event inventory
      await tx.event.update({
        where: { id: booking.eventId },
        data: {
          seatsBooked: {
            decrement: Math.min(booking.quantity, booking.event.seatsBooked),
          },
        },
      });

      // Check if there is a waiting queue for this event
      const topWaitlist = await tx.waitlist.findFirst({
        where: {
          eventId: booking.eventId,
          status: "WAITING",
        },
        orderBy: { position: "asc" },
        include: { user: true },
      });

      // If someone is waiting, promote them to OFFERED
      if (topWaitlist) {
        await tx.waitlist.update({
          where: { id: topWaitlist.id },
          data: { status: "OFFERED" },
        });

        logger.info("Promoted waitlist user due to ticket cancellation", {
          waitlistId: topWaitlist.id,
          userId: topWaitlist.userId,
          eventId: booking.eventId,
        });
      }

      // Record administrative activity log
      await tx.adminLog.create({
        data: {
          adminId: dbUser.id,
          action: "CANCEL_BOOKING",
          targetType: "BOOKING",
          targetId: bookingId,
        },
      });

      return { updatedBooking, promotedWaitlistUser: topWaitlist?.user?.email || null };
    });

    // Invalidate live seat cache immediately for real-time accuracy across all active browser sessions
    invalidateLiveFeedCache(booking.eventId);

    logger.info("Booking cancelled successfully", {
      bookingId,
      eventId: booking.eventId,
      userId: dbUser.id,
      refundStatus,
    });

    return NextResponse.json({
      success: true,
      message: isPaid
        ? "Booking cancelled successfully. Your refund has been initiated and will reflect within 5-7 business days."
        : "Free pass cancelled and your seat has been released.",
      booking: result.updatedBooking,
      refundStatus,
      promotedWaitlist: !!result.promotedWaitlistUser,
    });
  } catch (error: any) {
    logger.error("POST /api/bookings/cancel error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to cancel booking. Please contact support." },
      { status: 500 }
    );
  }
}
