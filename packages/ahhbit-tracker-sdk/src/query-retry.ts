import type { RetryOptions } from './query-types';

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 750,
  maxDelayMs: 8_000,
};

export function mergeRetryOptions(overrides?: Partial<RetryOptions>): RetryOptions {
  return {
    maxRetries: overrides?.maxRetries ?? DEFAULT_RETRY_OPTIONS.maxRetries,
    baseDelayMs: overrides?.baseDelayMs ?? DEFAULT_RETRY_OPTIONS.baseDelayMs,
    maxDelayMs: overrides?.maxDelayMs ?? DEFAULT_RETRY_OPTIONS.maxDelayMs,
  };
}

export function computeRetryDelay(attempt: number, options: RetryOptions): number {
  const exponent = Math.max(0, attempt - 1);
  const rawDelay = options.baseDelayMs * 2 ** exponent;
  return Math.min(rawDelay, options.maxDelayMs);
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}