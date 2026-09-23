import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateDbUser } from "@/lib/user";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const events = await prisma.event.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateDbUser(clerkUser);

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    const newEvent = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        venue: data.venue,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        price: data.price,
        capacity: data.capacity,
        status: data.status || "DRAFT",
        bannerUrl: data.bannerUrl,
        createdById: dbUser.id,
      },
    });

    // Write to AdminLog
    await prisma.adminLog.create({
      data: {
        adminId: dbUser.id,
        action: "CREATE_EVENT",
        targetType: "EVENT",
        targetId: newEvent.id,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
