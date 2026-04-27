import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchHiroJson, invalidateHiroApiCache } from '../mobile/src/core/network/hiroApiClient';

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
});
