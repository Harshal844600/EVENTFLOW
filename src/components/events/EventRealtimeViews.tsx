"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Users, Radio } from "lucide-react";

interface EventRealtimeViewsProps {
  eventId: string;
  initialViews?: number;
  className?: string;
  compact?: boolean;
}

export function EventRealtimeViews({
  eventId,
  initialViews = 0,
  className = "",
  compact = false,
}: EventRealtimeViewsProps) {
  const [activeViewers, setActiveViewers] = useState<number>(1);
  const [totalViews, setTotalViews] = useState<number>(initialViews);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    // Generate or retrieve persistent browser session ID for deduplication
    let sessionId = "";
    if (typeof window !== "undefined") {
      try {
        sessionId = sessionStorage.getItem("ef_session_id") || "";
        if (!sessionId) {
          sessionId = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
          sessionStorage.setItem("ef_session_id", sessionId);
        }
      } catch {
        sessionId = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      }
    }
    sessionIdRef.current = sessionId;

    let isSubscribed = true;

    // Send heartbeat to track presence and record initial impression
    const sendHeartbeat = async (isInitial = false) => {
      if (typeof document !== "undefined" && document.hidden && !isInitial) {
        return; // Don't heartbeat when tab is in background
      }

      try {
        const res = await fetch(`/api/events/${eventId}/views`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            isInitial,
          }),
        });

        if (res.ok && isSubscribed) {
          const data = await res.json();
          if (data.success) {
            setActiveViewers(data.activeViewers ?? 1);
            if (typeof data.totalViews === "number" && data.totalViews > 0) {
              setTotalViews(data.totalViews);
            }
            setIsConnected(true);
          }
        }
      } catch (err) {
        if (isSubscribed) setIsConnected(false);
      }
    };

    // First visit impression & immediate presence
    sendHeartbeat(true);

    // Regular heartbeat every 12 seconds
    const interval = setInterval(() => {
      sendHeartbeat(false);
    }, 12_000);

    // Visibility & focus listeners for accurate presence
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        sendHeartbeat(false);
      }
    };

    const handleFocus = () => {
      sendHeartbeat(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Immediate disconnect beacon when closing tab or navigating away
    const handleBeforeUnload = () => {
      if (navigator.sendBeacon) {
        const payload = JSON.stringify({ sessionId: sessionIdRef.current });
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(`/api/events/${eventId}/views`, blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Best effort cleanup on unmount
      if (sessionIdRef.current) {
        fetch(`/api/events/${eventId}/views`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionIdRef.current }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [eventId]);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs font-medium ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-secondary font-mono">
          {activeViewers} active {activeViewers === 1 ? "viewer" : "viewers"}
        </span>
        {totalViews > 0 && (
          <>
            <span className="text-secondary/40">•</span>
            <span className="text-secondary/80 font-mono">{totalViews} views</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl bg-card-bg/60 border border-card-border/80 backdrop-blur-md p-3.5 sm:p-4 shadow-sm transition-all duration-300 hover:border-primary/30 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Real-time Live Active Viewers */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400/50" />
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 font-mono">
                Live Now
              </span>
              <span className="w-1 h-1 rounded-full bg-card-border" />
              <span className="text-[10px] text-secondary font-mono">
                {isConnected ? "Real-time" : "Syncing"}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-0.5">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeViewers}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className="font-anton text-base sm:text-lg text-foreground tracking-wide leading-none"
                >
                  {activeViewers}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs text-secondary font-medium">
                {activeViewers === 1 ? "person exploring this right now" : "people exploring this right now"}
              </span>
            </div>
          </div>
        </div>

        {/* Verified Total Views Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground/5 border border-card-border/60 text-secondary text-xs shrink-0 self-center">
          <Eye className="w-3.5 h-3.5 text-secondary/70" />
          <span className="font-mono font-semibold text-foreground/90">
            {totalViews.toLocaleString()}
          </span>
          <span className="text-[11px] text-secondary/70 font-sans">total views</span>
        </div>
      </div>
    </div>
  );
}
