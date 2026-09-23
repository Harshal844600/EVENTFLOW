"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Event deleted successfully");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to delete event");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
      title="Delete Event"
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
