import { prisma } from "@/lib/prisma";
import { EventList } from "./EventList";

export default async function PublicEventsPage() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      venue: true,
      startTime: true,
      endTime: true,
      bannerUrl: true,
      price: true,
      capacity: true,
      seatsBooked: true,
      views: true,
      createdAt: true,
    },
  });

  const serializedEvents = events.map(event => ({
    ...event,
    price: Number(event.price),
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    createdAt: event.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="font-anton text-6xl md:text-8xl uppercase tracking-tight">
          Upcoming <span className="relative inline-block">
            <span className="relative z-10">Events</span>
            <span className="absolute bottom-1 left-0 w-full h-4 bg-primary -rotate-2 -z-10"></span>
          </span>
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
          Discover and book the best events in town. AI-curated and effortlessly organized.
        </p>
      </div>

      <EventList events={serializedEvents} />
    </div>
  );
}
