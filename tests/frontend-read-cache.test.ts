import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReadCache, invalidateReadCache, readThroughCache } from '../frontend/src/services/readCache';

describe('frontend read cache', () => {
  beforeEach(() => {
    clearReadCache();
  });

  it('returns cached values within ttl', async () => {
    const fetcher = vi.fn().mockResolvedValue('ok');

    const first = await readThroughCache('test:key', fetcher, { ttlMs: 5_000 });
    const second = await readThroughCache('test:key', fetcher, { ttlMs: 5_000 });

    expect(first).toBe('ok');
    expect(second).toBe('ok');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('deduplicates in-flight requests for the same key', async () => {
    const fetcher = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 42;
    });

    const [a, b] = await Promise.all([
      readThroughCache('test:inflight', fetcher, { ttlMs: 5_000 }),
      readThroughCache('test:inflight', fetcher, { ttlMs: 5_000 }),
    ]);

    expect(a).toBe(42);
    expect(b).toBe(42);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('invalidates by prefix and fetches fresh data', async () => {
    let call = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      call += 1;
      return call;
    });

    const first = await readThroughCache('contract-read:user-habits:SP1', fetcher, { ttlMs: 5_000 });
    invalidateReadCache('contract-read:user-habits');
    const second = await readThroughCache('contract-read:user-habits:SP1', fetcher, { ttlMs: 5_000 });

    expect(first).toBe(1);
    expect(second).toBe(2);
  });
});
