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

  const existing = inFlightCache.get(key);
  if (existing) {
    return existing as Promise<T>;
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

export function invalidateReadCache(keyPrefix: string): void {
  for (const key of valueCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      valueCache.delete(key);
    }
  }

  for (const key of inFlightCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      inFlightCache.delete(key);
    }
  }
}

export function clearReadCache(): void {
  valueCache.clear();
  inFlightCache.clear();
}
