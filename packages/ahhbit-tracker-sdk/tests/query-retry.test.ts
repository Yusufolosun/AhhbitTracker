import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_RETRY_OPTIONS,
  computeRetryDelay,
  mergeRetryOptions,
  sleep,
} from '../src/query-retry';

describe('mergeRetryOptions', () => {
  it('uses defaults when options are omitted', () => {
    expect(mergeRetryOptions()).toEqual(DEFAULT_RETRY_OPTIONS);
  });

  it('overrides only the provided values', () => {
    expect(mergeRetryOptions({ maxRetries: 6 })).toEqual({
      ...DEFAULT_RETRY_OPTIONS,
      maxRetries: 6,
    });
  });
});

describe('computeRetryDelay', () => {
  it('applies exponential backoff', () => {
    const options = { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 2_000 };
    expect(computeRetryDelay(1, options)).toBe(100);
    expect(computeRetryDelay(2, options)).toBe(200);
    expect(computeRetryDelay(3, options)).toBe(400);
  });

  it('respects max delay cap', () => {
    const options = { maxRetries: 5, baseDelayMs: 1_000, maxDelayMs: 1_500 };
    expect(computeRetryDelay(4, options)).toBe(1_500);
  });
});

describe('sleep', () => {
  it('resolves after timeout', async () => {
    vi.useFakeTimers();
    const promise = sleep(25);
    await vi.advanceTimersByTimeAsync(25);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});
