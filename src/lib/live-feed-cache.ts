// Server-side in-memory cache for live feed
interface CacheEntry {
  data: any;
  expiresAt: number;
}

const cacheStore: Map<string, CacheEntry> = new Map();

export function getCachedFeed(key: string) {
  const cached = cacheStore.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }
  return null;
}

export function setCachedFeed(key: string, data: any, ttlMs: number = 6_000) {
  cacheStore.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Invalidate the live feed cache when bookings, cancellations, or updates occur
 */
export function invalidateLiveFeedCache(eventId?: string) {
  if (eventId) {
    cacheStore.delete(eventId);
  }
  cacheStore.delete("global");
  cacheStore.clear();
}
