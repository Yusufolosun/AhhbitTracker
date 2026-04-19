import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReadCache } from '../frontend/src/services/readCache';
import { fetchHiroApiJson, HiroApiError } from '../frontend/src/services/hiroApiClient';

const originalFetch = globalThis.fetch;

describe('frontend hiro api client', () => {
  beforeEach(() => {
    clearReadCache();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('caches GET responses by path and ttl', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ stacks_tip_height: 123 }),
    } as Response);
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const first = await fetchHiroApiJson<{ stacks_tip_height: number }>('/v2/info', { ttlMs: 5_000 });
    const second = await fetchHiroApiJson<{ stacks_tip_height: number }>('/v2/info', { ttlMs: 5_000 });

    expect(first.stacks_tip_height).toBe(123);
    expect(second.stacks_tip_height).toBe(123);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries transient server failures', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ value: 'ok' }),
      } as Response);

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const payload = await fetchHiroApiJson<{ value: string }>('/health', {
      ttlMs: 0,
      retries: 1,
    });

    expect(payload.value).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws typed error for non-retryable statuses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers(),
    } as Response);

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      fetchHiroApiJson('/extended/v1/tx/0xabc', {
        ttlMs: 0,
        retries: 0,
      }),
    ).rejects.toBeInstanceOf(HiroApiError);
  });
});
