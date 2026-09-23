import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const event = await prisma.event.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!event) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const data = await req.json();

    const updatedEvent = await prisma.event.update({
      where: { id: resolvedParams.id },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        description: data.description !== undefined ? data.description : undefined,
        category: data.category !== undefined ? data.category : undefined,
        venue: data.venue !== undefined ? data.venue : undefined,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        price: data.price !== undefined ? data.price : undefined,
        capacity: data.capacity !== undefined ? data.capacity : undefined,
        status: data.status !== undefined ? data.status : undefined,
        bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : undefined,
      },
    });

    // Write to AdminLog
    await prisma.adminLog.create({
      data: {
        adminId: dbUser.id,
        action: "UPDATE_EVENT",
        targetType: "EVENT",
        targetId: updatedEvent.id,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("PUT /api/events/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;

    // Check for existing bookings to prevent database constraint failure
    const bookingsCount = await prisma.booking.count({
      where: { eventId: resolvedParams.id },
    });

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete this event because it already has active bookings." },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: { id: resolvedParams.id },
    });

    // Write to AdminLog
    await prisma.adminLog.create({
      data: {
        adminId: dbUser.id,
        action: "DELETE_EVENT",
        targetType: "EVENT",
        targetId: resolvedParams.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
