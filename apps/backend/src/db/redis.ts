import Redis from 'ioredis';

// Lazily-connected Redis client. `lazyConnect` avoids opening a socket at import
// time, and the error listener keeps a Redis outage from crashing the process —
// cache reads/writes degrade to no-ops instead (see cacheGet/cacheSet below).
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    })
  : null;

let warnedUnavailable = false;

if (redis) {
  redis.on('error', (err) => {
    // Log once per process to avoid flooding when Redis is down.
    if (!warnedUnavailable) {
      warnedUnavailable = true;
      console.warn('[redis] unavailable, caching disabled:', err.message);
    }
  });
}

/**
 * Reads a JSON value from the cache. Returns null on miss, on parse failure, or
 * when Redis is unavailable — callers should treat null as "not cached".
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Writes a JSON value to the cache with a TTL (seconds). Silently no-ops when
 * Redis is unavailable so a cache outage never breaks the request path.
 */
export async function cacheSet(key: string, value: unknown, ttlSec: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSec);
  } catch {
    // ignore — caching is best-effort
  }
}

export default redis;
