import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearReadCache,
  readThroughCache,
} from '../mobile/src/core/data/readCache';

describe('mobile read cache advanced behavior', () => {
  beforeEach(() => {
    clearReadCache();
    vi.useRealTimers();
  });

  it('refreshes data when ttl expires', async () => {
    vi.useFakeTimers();
    let value = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      value += 1;
      return value;
    });

    const first = await readThroughCache('mobile:ttl', fetcher, { ttlMs: 100 });
    await vi.advanceTimersByTimeAsync(101);
    const second = await readThroughCache('mobile:ttl', fetcher, { ttlMs: 100 });

    expect(first).toBe(1);
    expect(second).toBe(2);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('forces a refresh even while ttl is active', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');

    const cached = await readThroughCache('mobile:force-refresh', fetcher, { ttlMs: 5_000 });
    const refreshed = await readThroughCache('mobile:force-refresh', fetcher, {
      ttlMs: 5_000,
      forceRefresh: true,
    });

    expect(cached).toBe('first');
    expect(refreshed).toBe('second');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('keeps cache entries isolated by key', async () => {
    const fetcher = vi.fn().mockImplementation(async () => ({ timestamp: Date.now() }));

    const first = await readThroughCache('mobile:key:a', fetcher, { ttlMs: 5_000 });
    const second = await readThroughCache('mobile:key:b', fetcher, { ttlMs: 5_000 });

    expect(first).toEqual(first);
    expect(second).toEqual(second);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
