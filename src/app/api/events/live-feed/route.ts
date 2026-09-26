import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    // 1. Fetch current live seat counts for events
    const events = await prisma.event.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        capacity: true,
        seatsBooked: true,
        price: true,
      },
    });

    const seatMap: Record<
      string,
      {
        capacity: number;
        seatsBooked: number;
        seatsAvailable: number;
        percentBooked: number;
        isSoldOut: boolean;
      }
    > = {};

    events.forEach((ev) => {
      const seatsAvailable = Math.max(0, ev.capacity - ev.seatsBooked);
      const percentBooked = Math.min(100, Math.round((ev.seatsBooked / ev.capacity) * 100));
      seatMap[ev.id] = {
        capacity: ev.capacity,
        seatsBooked: ev.seatsBooked,
        seatsAvailable,
        percentBooked,
        isSoldOut: seatsAvailable <= 0,
      };
    });

    // 2. Fetch recent bookings for real-time social proof
    const recentBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        ...(eventId ? { eventId } : {}),
      },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        event: { select: { title: true } },
      },
    });

    const recentActivity = recentBookings.map((b) => {
      const rawName = b.user?.name?.trim();
      let maskedName = "Event Attendee";
      if (rawName && rawName !== "Event Attendee") {
        const parts = rawName.split(/\s+/);
        maskedName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
      }

      return {
        id: b.id,
        attendee: maskedName,
        eventTitle: b.event.title,
        quantity: b.quantity,
        timeAgo: getTimeAgo(new Date(b.createdAt)),
        createdAt: b.createdAt.toISOString(),
      };
    });

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        seats: seatMap,
        recentActivity,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/events/live-feed error:", error);
    return NextResponse.json({ error: "Failed to fetch live feed" }, { status: 500 });
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
