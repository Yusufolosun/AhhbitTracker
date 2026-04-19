import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearReadCache,
  invalidateReadCache,
  readThroughCache,
} from '../mobile/src/core/data/readCache';

describe('mobile read cache', () => {
  beforeEach(() => {
    clearReadCache();
  });

  it('returns cached values while ttl is active', async () => {
    const fetcher = vi.fn().mockResolvedValue('cached-value');

    const first = await readThroughCache('mobile:test', fetcher, { ttlMs: 5_000 });
    const second = await readThroughCache('mobile:test', fetcher, { ttlMs: 5_000 });

    expect(first).toBe('cached-value');
    expect(second).toBe('cached-value');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('deduplicates in-flight requests for the same key', async () => {
    const fetcher = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 99;
    });

    const [a, b] = await Promise.all([
      readThroughCache('mobile:inflight', fetcher, { ttlMs: 5_000 }),
      readThroughCache('mobile:inflight', fetcher, { ttlMs: 5_000 }),
    ]);

    expect(a).toBe(99);
    expect(b).toBe(99);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('invalidates keys by prefix', async () => {
    let value = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      value += 1;
      return value;
    });

    await readThroughCache('mobile:address:SP123', fetcher, { ttlMs: 5_000 });
    invalidateReadCache('mobile:address');
    const next = await readThroughCache('mobile:address:SP123', fetcher, { ttlMs: 5_000 });

    expect(next).toBe(2);
  });
});
