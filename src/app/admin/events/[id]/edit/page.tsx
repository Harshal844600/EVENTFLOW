import EventForm from "../../components/EventForm";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!event) {
    notFound();
  }

  // Need to parse Decimal to number for the client component
  const eventData = {
    ...event,
    price: Number(event.price),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/events" className="text-secondary hover:text-foreground transition-colors">
          ← Back to Events
        </Link>
        <h2 className="font-anton text-4xl uppercase">Edit Event</h2>
      </div>
      <EventForm initialData={eventData} />
    </div>
  );
}
