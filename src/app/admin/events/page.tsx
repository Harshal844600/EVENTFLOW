import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EventStatusToggle from "./components/EventStatusToggle";
import DeleteEventButton from "./components/DeleteEventButton";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bookings: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-anton text-4xl uppercase">Events</h2>
        <Link 
          href="/admin/events/new" 
          className="bg-primary text-foreground px-6 py-3 font-bold uppercase text-sm hover:scale-105 transition-transform shadow-lg"
        >
          + Create Event
        </Link>
      </div>

      <div className="bg-card-bg border border-card-border rounded overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-foreground/5 border-b border-card-border text-secondary text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Event</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Capacity</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-secondary">
                  No events found. Create your first one!
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-6 py-4">
                     <p className="font-bold text-foreground">{event.title}</p>
                     <p className="text-secondary text-sm">{event.category}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      event.status === 'PUBLISHED' ? 'bg-secondary/20 text-secondary' :
                      event.status === 'DRAFT' ? 'bg-primary/20 text-primary' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{new Date(event.startTime).toLocaleDateString()}</p>
                    <p className="text-secondary text-xs">{new Date(event.startTime).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{event.seatsBooked} / {event.capacity}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3.5">
                      <EventStatusToggle eventId={event.id} currentStatus={event.status} />
                      <Link href={`/admin/events/${event.id}/edit`} className="text-foreground/75 hover:text-foreground hover:underline text-sm font-bold transition-colors">
                        Edit
                      </Link>
                      <DeleteEventButton eventId={event.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
