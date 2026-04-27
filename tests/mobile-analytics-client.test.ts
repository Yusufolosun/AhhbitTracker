import { afterEach, describe, expect, it, vi } from 'vitest';

const originalFetch = globalThis.fetch;

async function loadAnalyticsModule(options?: {
  enabled?: boolean;
  endpoint?: string;
  writeKey?: string;
  stage?: string;
}) {
  vi.resetModules();

  vi.doMock('@/core/config', () => ({
    analyticsRuntimeConfig: {
      enabled: options?.enabled ?? true,
      endpoint: options?.endpoint ?? 'https://analytics.example.com/collect',
      writeKey: options?.writeKey,
    },
    networkConfig: {
      appStage: options?.stage ?? 'production',
    },
  }));

  return import('../mobile/src/analytics');
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('mobile analytics client', () => {
  it('queues events and flushes a batched payload to analytics endpoint', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response) as any;

    const analytics = await loadAnalyticsModule({
      enabled: true,
      endpoint: 'https://analytics.example.com/collect',
      writeKey: 'test-write-key',
      stage: 'staging',
    });

    analytics.trackMobileEvent('preview_generated', {
      source: 'unit-test',
      habitId: 42,
      errorMessage: 'x'.repeat(300),
    });

    await analytics.flushMobileAnalytics();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://analytics.example.com/collect',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Analytics-Key': 'test-write-key',
        }),
      }),
    );

    const [, request] = (globalThis.fetch as any).mock.calls[0];
    const body = JSON.parse(request.body);

    expect(body.app).toBe('ahhbittracker-mobile');
    expect(body.events).toHaveLength(1);
    expect(body.events[0]).toMatchObject({
      event: 'preview_generated',
      platform: 'mobile',
      stage: 'staging',
      payload: expect.objectContaining({
        source: 'unit-test',
        habitId: 42,
      }),
    });
    expect(body.events[0].payload.errorMessage.length).toBeLessThanOrEqual(160);
  });

  it('does not send analytics when runtime config disables tracking', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response) as any;

    const analytics = await loadAnalyticsModule({
      enabled: false,
      endpoint: 'https://analytics.example.com/collect',
    });

    analytics.trackMobileEvent('app_loaded');
    await analytics.flushMobileAnalytics();

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('hashes wallet addresses consistently for privacy-safe analytics payloads', async () => {
    const analytics = await loadAnalyticsModule();
    const address = 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z';

    const first = analytics.toWalletAddressHash(address);
    const second = analytics.toWalletAddressHash(address.toLowerCase());

    expect(first).toBe(second);
    expect(first).not.toContain('SP1N3809');
  });
});
