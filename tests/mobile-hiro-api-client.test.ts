import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchHiroJson,
  HiroApiError,
  invalidateHiroApiCache,
} from '../mobile/src/core/network/hiroApiClient';

const originalFetch = globalThis.fetch;
const originalEnv = process.env;

describe('mobile hiro api client', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
    invalidateHiroApiCache('/');
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('normalizes paths and uses configured Hiro API base URL', async () => {
    process.env.EXPO_PUBLIC_HIRO_API_BASE_URL = 'https://api.custom.example/';

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response) as any;

    const payload = await fetchHiroJson<{ ok: boolean }>('extended/v1/block', {
      bypassCache: true,
      retries: 0,
    });

    expect(payload.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.custom.example/extended/v1/block',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('falls back to testnet Hiro API when no explicit base URL is set', async () => {
    delete process.env.EXPO_PUBLIC_HIRO_API_BASE_URL;
    process.env.EXPO_PUBLIC_STACKS_NETWORK = 'testnet';

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ network: 'testnet' }),
    } as Response) as any;

    const payload = await fetchHiroJson<{ network: string }>('/extended/v1/info', {
      bypassCache: true,
      retries: 0,
    });

    expect(payload.network).toBe('testnet');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.testnet.hiro.so/extended/v1/info',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('skips cache reads when bypassCache is true', async () => {
    process.env.EXPO_PUBLIC_HIRO_API_BASE_URL = 'https://api.mainnet.hiro.so';

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ height: 123 }),
    } as Response) as any;

    await fetchHiroJson('/extended/v1/block', {
      ttlMs: 60_000,
      bypassCache: true,
      retries: 0,
    });
    await fetchHiroJson('/extended/v1/block', {
      ttlMs: 60_000,
      bypassCache: true,
      retries: 0,
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('retries rate-limited requests and resolves on a later attempt', async () => {
    process.env.EXPO_PUBLIC_HIRO_API_BASE_URL = 'https://api.mainnet.hiro.so';
    vi.useFakeTimers();

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'rate_limited' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ tip: 500 }),
      } as Response) as any;

    const request = fetchHiroJson<{ tip: number }>('/extended/v1/block', {
      bypassCache: true,
      retries: 1,
    });

    await vi.advanceTimersByTimeAsync(1_000);
    await expect(request).resolves.toEqual({ tip: 500 });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('throws HiroApiError for non-retryable 4xx responses', async () => {
    process.env.EXPO_PUBLIC_HIRO_API_BASE_URL = 'https://api.mainnet.hiro.so';

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'bad_request' }),
    } as Response) as any;

    await expect(
      fetchHiroJson('/extended/v1/tx/example', {
        bypassCache: true,
        retries: 2,
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        name: 'HiroApiError',
        status: 400,
      }),
    );
  });

  it('wraps network failures into HiroApiError', async () => {
    process.env.EXPO_PUBLIC_HIRO_API_BASE_URL = 'https://api.mainnet.hiro.so';

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('socket hang up')) as any;

    await expect(
      fetchHiroJson('/extended/v1/tx/example', {
        bypassCache: true,
        retries: 0,
      }),
    ).rejects.toBeInstanceOf(HiroApiError);
  });

  it('serves cached responses when ttl is active', async () => {
    process.env.EXPO_PUBLIC_HIRO_API_BASE_URL = 'https://api.mainnet.hiro.so';

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ nonce: 88 }),
    } as Response) as any;

    const first = await fetchHiroJson<{ nonce: number }>('/extended/v1/address/SP123/nonces', {
      ttlMs: 10_000,
      retries: 0,
    });
    const second = await fetchHiroJson<{ nonce: number }>('/extended/v1/address/SP123/nonces', {
      ttlMs: 10_000,
      retries: 0,
    });

    expect(first).toEqual({ nonce: 88 });
    expect(second).toEqual({ nonce: 88 });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent requests for the same cache key', async () => {
    process.env.EXPO_PUBLIC_HIRO_API_BASE_URL = 'https://api.mainnet.hiro.so';

    globalThis.fetch = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return {
        ok: true,
        status: 200,
        json: async () => ({ balance: '1000000' }),
      } as Response;
    }) as any;

    const [first, second] = await Promise.all([
      fetchHiroJson<{ balance: string }>('/extended/v1/address/SP123/stx', {
        ttlMs: 5_000,
      }),
      fetchHiroJson<{ balance: string }>('/extended/v1/address/SP123/stx', {
        ttlMs: 5_000,
      }),
    ]);

    expect(first.balance).toBe('1000000');
    expect(second.balance).toBe('1000000');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
