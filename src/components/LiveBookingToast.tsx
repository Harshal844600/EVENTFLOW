"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, X } from "lucide-react";

interface ActivityItem {
  id: string;
  attendee: string;
  eventTitle: string;
  quantity: number;
  timeAgo: string;
}

export function LiveBookingToast() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [current, setCurrent] = useState<ActivityItem | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Fetch live feed
    const fetchFeed = async () => {
      try {
        const res = await fetch("/api/events/live-feed");
        if (res.ok) {
          const data = await res.json();
          if (data.recentActivity && data.recentActivity.length > 0) {
            setActivities(data.recentActivity);
          }
        }
      } catch (err) {
        // Silently ignore background network errors
      }
    };

    fetchFeed();
    const interval = setInterval(fetchFeed, 60_000); // lightweight sync every 60s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activities.length === 0 || dismissed) return;

    let index = 0;
    // Show first toast after 4 seconds of page load
    const initialTimer = setTimeout(() => {
      setCurrent(activities[0]);
    }, 4000);

    // Cycle through activities every 14 seconds
    const cycleInterval = setInterval(() => {
      index = (index + 1) % activities.length;
      setCurrent(activities[index]);
    }, 14_000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleInterval);
    };
  }, [activities, dismissed]);

  // Hide toast 6 seconds after displaying
  useEffect(() => {
    if (!current) return;
    const hideTimer = setTimeout(() => {
      setCurrent(null);
    }, 6000);
    return () => clearTimeout(hideTimer);
  }, [current]);

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:right-auto sm:bottom-6 sm:left-6 z-50 pointer-events-none max-w-[calc(100vw-24px)] sm:max-w-sm w-full">
      <AnimatePresence>
        {current && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-auto bg-card-bg/95 backdrop-blur-xl border border-card-border p-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 relative overflow-hidden"
          >
            {/* Live Indicator Bar */}
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />

            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 text-foreground">
              <Ticket className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Live Booking</span>
                <span className="text-[10px] text-secondary">• {current.timeAgo}</span>
              </div>
              <p className="text-xs text-foreground font-semibold truncate mt-0.5">
                {current.attendee} booked {current.quantity} ticket{current.quantity > 1 ? "s" : ""}
              </p>
              <p className="text-[11px] text-secondary truncate">{current.eventTitle}</p>
            </div>

            <button
              onClick={() => {
                setCurrent(null);
                setDismissed(true);
              }}
              className="text-secondary/60 hover:text-foreground transition-colors p-1 shrink-0"
              title="Dismiss notifications"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
