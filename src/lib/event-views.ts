import { prisma } from "@/lib/prisma";

// Global persistent state across hot reloads in dev / runtime
declare global {
  // eslint-disable-next-line no-var
  var __eventflow_active_viewers: Map<string, Map<string, number>> | undefined;
  // eslint-disable-next-line no-var
  var __eventflow_view_dedup: Map<string, number> | undefined;
}

const activeViewers = globalThis.__eventflow_active_viewers ?? new Map<string, Map<string, number>>();
globalThis.__eventflow_active_viewers = activeViewers;

// Session-based deduplication for permanent view increments (30 minutes cooldown per session)
const viewDedup = globalThis.__eventflow_view_dedup ?? new Map<string, number>();
globalThis.__eventflow_view_dedup = viewDedup;

const HEARTBEAT_EXPIRY_MS = 25_000; // 25 seconds without heartbeat = disconnected
const DEDUP_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Prunes expired active sessions for a given event
 */
function pruneExpiredSessions(eventId: string): number {
  const sessions = activeViewers.get(eventId);
  if (!sessions) return 0;

  const now = Date.now();
  for (const [sessionId, lastSeen] of sessions.entries()) {
    if (now - lastSeen > HEARTBEAT_EXPIRY_MS) {
      sessions.delete(sessionId);
    }
  }

  if (sessions.size === 0) {
    activeViewers.delete(eventId);
    return 0;
  }

  return sessions.size;
}

/**
 * Records heartbeat and handles atomic real-time view counting
 */
export async function trackEventPresence(
  eventId: string,
  sessionId: string,
  recordImpression: boolean = false
): Promise<{ activeViewers: number; totalViews: number }> {
  const now = Date.now();

  // 1. Update heartbeat map
  let sessions = activeViewers.get(eventId);
  if (!sessions) {
    sessions = new Map<string, number>();
    activeViewers.set(eventId, sessions);
  }
  sessions.set(sessionId, now);

  const activeCount = pruneExpiredSessions(eventId);

  // 2. Check if we should increment permanent view counter in the database
  const dedupKey = `${eventId}:${sessionId}`;
  const lastViewedAt = viewDedup.get(dedupKey);
  const shouldIncrement = recordImpression && (!lastViewedAt || now - lastViewedAt > DEDUP_COOLDOWN_MS);

  let currentViews = 0;

  try {
    if (shouldIncrement) {
      viewDedup.set(dedupKey, now);

      // Periodically clean old dedup records
      if (viewDedup.size > 5000) {
        for (const [k, ts] of viewDedup.entries()) {
          if (now - ts > DEDUP_COOLDOWN_MS) {
            viewDedup.delete(k);
          }
        }
      }

      const updated = await prisma.event.update({
        where: { id: eventId },
        data: {
          views: { increment: 1 },
        },
        select: { views: true },
      });
      currentViews = updated.views;
    } else {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { views: true },
      });
      currentViews = event?.views ?? 0;
    }
  } catch (error) {
    console.error(`Failed to update or fetch views for event ${eventId}:`, error);
  }

  return {
    activeViewers: Math.max(1, activeCount),
    totalViews: currentViews,
  };
}

/**
 * Removes session immediately on unload or tab close
 */
export function removeEventPresence(eventId: string, sessionId: string): number {
  const sessions = activeViewers.get(eventId);
  if (!sessions) return 0;

  sessions.delete(sessionId);
  return pruneExpiredSessions(eventId);
}

/**
 * Gets the current real-time stats for an event without updating presence
 */
export async function getEventPresenceStats(eventId: string): Promise<{ activeViewers: number; totalViews: number }> {
  const activeCount = pruneExpiredSessions(eventId);
  
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { views: true },
    });
    return {
      activeViewers: activeCount,
      totalViews: event?.views ?? 0,
    };
  } catch (error) {
    return {
      activeViewers: activeCount,
      totalViews: 0,
    };
  }
}
