interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const valueCache = new Map<string, CacheEntry<unknown>>();
const inFlightCache = new Map<string, Promise<unknown>>();

export interface ReadCacheOptions {
  ttlMs: number;
  forceRefresh?: boolean;
}

/**
 * Implements a read-through cache strategy with deduplication of in-flight requests.
 *
 * @param key - The cache key.
 * @param fetcher - The async function to call to retrieve the value.
 * @param options - Cache options (TTL, forceRefresh).
 * @returns The cached or freshly fetched value.
 */
export async function readThroughCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: ReadCacheOptions,
): Promise<T> {
  const now = Date.now();

  if (!options.forceRefresh) {
    const cached = valueCache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value as T;
    }
  }

  const inFlight = inFlightCache.get(key);
  if (inFlight) {
    return inFlight as Promise<T>;
  }

  const request = fetcher()
    .then((value) => {
      valueCache.set(key, {
        value,
        expiresAt: Date.now() + options.ttlMs,
      });
      return value;
    })
    .finally(() => {
      inFlightCache.delete(key);
    });

  inFlightCache.set(key, request);
  return request;
}

/**
 * Invalidates cache entries (both completed values and in-flight promises) matching a prefix.
 *
 * @param prefix - The cache key prefix to match and remove.
 */
export function invalidateReadCache(prefix: string): void {
  for (const key of valueCache.keys()) {
    if (key.startsWith(prefix)) {
      valueCache.delete(key);
    }
  }

  for (const key of inFlightCache.keys()) {
    if (key.startsWith(prefix)) {
      inFlightCache.delete(key);
    }
  }
}

/**
 * Completely clears all cached values and in-flight promises.
 */
export function clearReadCache(): void {
  valueCache.clear();
  inFlightCache.clear();
}
