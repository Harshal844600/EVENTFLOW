import { NextRequest, NextResponse } from "next/server";
import { trackEventPresence, removeEventPresence, getEventPresenceStats } from "@/lib/event-views";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const stats = await getEventPresenceStats(id);
    return NextResponse.json({
      success: true,
      eventId: id,
      ...stats,
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/events/[id]/views error:", error);
    return NextResponse.json({ error: "Failed to fetch event stats" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    let body: { sessionId?: string; isInitial?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      // Body can be empty for beacon requests
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip");
    const sessionId = body.sessionId || req.headers.get("x-session-id") || clientIp || "anon-client";
    const isInitial = Boolean(body.isInitial);

    const stats = await trackEventPresence(id, sessionId, isInitial);

    return NextResponse.json({
      success: true,
      eventId: id,
      ...stats,
      timestamp: Date.now(),
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("POST /api/events/[id]/views error:", error);
    return NextResponse.json({ error: "Failed to record event view" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    let sessionId = "";
    try {
      const body = await req.json();
      sessionId = body.sessionId;
    } catch {
      sessionId = req.nextUrl.searchParams.get("sessionId") || "";
    }

    if (sessionId) {
      removeEventPresence(id, sessionId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events/[id]/views error:", error);
    return NextResponse.json({ error: "Failed to remove session" }, { status: 500 });
  }
}
