import EventForm from "../components/EventForm";
import Link from "next/link";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/events" className="text-secondary hover:text-foreground transition-colors">
          ← Back to Events
        </Link>
        <h2 className="font-anton text-4xl uppercase">Create Event</h2>
      </div>
      <EventForm />
    </div>
  );
}
