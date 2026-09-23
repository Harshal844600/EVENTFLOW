import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedEvents } from "@/components/landing/FeaturedEvents";
import { BentoGrid } from "@/components/landing/BentoGrid";

export default async function LandingPage() {
  // Fetch the next 5 upcoming events for the carousel
  const upcomingEvents = await prisma.event.findMany({
    where: { status: "PUBLISHED", startTime: { gte: new Date() } },
    orderBy: { startTime: "asc" },
    take: 5,
  });

  const serializedEvents = upcomingEvents.map(event => ({
    ...event,
    price: Number(event.price),
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    createdAt: event.createdAt.toISOString(),
  }));

  return (
    <div className="overflow-hidden">
      <HeroSection />
      
      {serializedEvents.length > 0 && (
        <FeaturedEvents events={serializedEvents} />
      )}
      
      <BentoGrid />
    </div>
  );
}
