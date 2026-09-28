import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET: Check waitlist status for a specific event or get user's active waitlists
export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (eventId) {
      const waitlistEntry = await prisma.waitlist.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: dbUser.id,
          },
        },
      });

      const totalWaiting = await prisma.waitlist.count({
        where: { eventId, status: "WAITING" },
      });

      return NextResponse.json({
        isEnrolled: !!waitlistEntry,
        entry: waitlistEntry,
        totalWaiting,
      });
    }

    // If no specific eventId, return all waitlists for the current user
    const userWaitlists = await prisma.waitlist.findMany({
      where: { userId: dbUser.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            startTime: true,
            price: true,
            capacity: true,
            seatsBooked: true,
            bannerUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ waitlists: userWaitlists });
  } catch (error: any) {
    logger.error("GET /api/waitlist error", error);
    return NextResponse.json({ error: "Failed to fetch waitlist status" }, { status: 500 });
  }
}

// POST: Join the waiting queue
export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Please log in to join the waiting queue." }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const body = await req.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // Check if seats are actually full
    const isSoldOut = event.seatsBooked >= event.capacity;
    if (!isSoldOut) {
      return NextResponse.json(
        { error: "Seats are still available for this event! You can book directly without queueing." },
        { status: 400 }
      );
    }

    // Check if user already booked this event
    const existingBooking = await prisma.booking.findFirst({
      where: {
        eventId,
        userId: dbUser.id,
        status: "CONFIRMED",
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "You already have confirmed tickets for this event." },
        { status: 400 }
      );
    }

    // Check if user is already on waitlist
    const existingWaitlist = await prisma.waitlist.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: dbUser.id,
        },
      },
    });

    if (existingWaitlist) {
      return NextResponse.json({
        success: true,
        message: "You are already in the waiting queue.",
        position: existingWaitlist.position,
        entry: existingWaitlist,
      });
    }

    // Calculate queue position
    const currentQueueCount = await prisma.waitlist.count({
      where: { eventId, status: "WAITING" },
    });

    const newPosition = currentQueueCount + 1;

    const entry = await prisma.waitlist.create({
      data: {
        eventId,
        userId: dbUser.id,
        position: newPosition,
        status: "WAITING",
      },
      include: { event: true },
    });

    logger.info("User joined waitlist", {
      eventId,
      userId: dbUser.id,
      position: newPosition,
    });

    return NextResponse.json(
      {
        success: true,
        message: `You're in line! Your queue position is #${newPosition}. When a ticket opens up, you'll be allocated immediately.`,
        position: newPosition,
        entry,
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error("POST /api/waitlist error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to join waiting queue. Please try again." },
      { status: 500 }
    );
  }
}

// DELETE: Leave the waiting queue
export async function DELETE(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    await prisma.waitlist.deleteMany({
      where: {
        eventId,
        userId: dbUser.id,
      },
    });

    return NextResponse.json({ success: true, message: "Removed from waiting queue." });
  } catch (error: any) {
    logger.error("DELETE /api/waitlist error", error);
    return NextResponse.json({ error: "Failed to leave waiting queue" }, { status: 500 });
  }
}
