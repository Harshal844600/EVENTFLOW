"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EventStatusToggle({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Event status changed to ${newStatus}`);
        router.refresh();
      } else {
        const text = await res.text();
        toast.error(`Error: ${text}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={loading}
      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
        currentStatus === "PUBLISHED"
          ? "border-card-border hover:bg-foreground/5 text-foreground/80"
          : "border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : currentStatus === "PUBLISHED" ? (
        "Revoke"
      ) : (
        "Publish"
      )}
    </button>
  );
}
