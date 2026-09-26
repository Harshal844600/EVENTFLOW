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

    const parsedStartTime = data.startTime ? new Date(data.startTime) : new Date();
    const parsedEndTime = data.endTime ? new Date(data.endTime) : new Date(Date.now() + 2 * 60 * 60 * 1000);

    const price = isNaN(Number(data.price)) ? 0 : Number(data.price);
    const capacity = isNaN(parseInt(String(data.capacity), 10)) ? 100 : parseInt(String(data.capacity), 10);

    const newEvent = await prisma.event.create({
      data: {
        title: data.title || "Untitled Event",
        description: data.description || "",
        category: data.category || "Technology",
        venue: data.venue || "Virtual",
        startTime: isNaN(parsedStartTime.getTime()) ? new Date() : parsedStartTime,
        endTime: isNaN(parsedEndTime.getTime()) ? new Date(Date.now() + 2 * 60 * 60 * 1000) : parsedEndTime,
        price,
        capacity,
        status: data.status || "DRAFT",
        bannerUrl: data.bannerUrl || null,
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
  } catch (error: any) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
