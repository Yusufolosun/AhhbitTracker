import { describe, expect, it, vi } from 'vitest';
import { resolveTimeoutMs, withTimeout } from '../src/query-timeout';

describe('resolveTimeoutMs', () => {
  it('returns default when input is invalid', () => {
    expect(resolveTimeoutMs(undefined)).toBe(12_000);
    expect(resolveTimeoutMs(NaN)).toBe(12_000);
    expect(resolveTimeoutMs(0)).toBe(12_000);
  });

  it('returns floored positive timeout values', () => {
    expect(resolveTimeoutMs(3_001.9)).toBe(3_001);
  });
});

describe('withTimeout', () => {
  it('resolves when promise completes before timeout', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 50)).resolves.toBe('ok');
  });

  it('rejects when timeout elapses first', async () => {
    vi.useFakeTimers();

    const pending = withTimeout(
      new Promise<string>(() => {
        // intentionally unresolved
      }),
      10,
    );

    const expectation = expect(pending).rejects.toThrow('timed out after 10ms');
    await vi.advanceTimersByTimeAsync(11);
    await expectation;

    vi.useRealTimers();
  });
});
