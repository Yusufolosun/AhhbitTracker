export const HIRO_RATE_LIMIT_EVENT = 'hiro-rate-limit';

export interface HiroRateLimitDetail {
  retryAfter: number;
}

/**
 * Dispatch a custom event when 429 is detected.
 */
export function emitRateLimitEvent(retryAfter = 30): void {
  window.dispatchEvent(
    new CustomEvent<HiroRateLimitDetail>(HIRO_RATE_LIMIT_EVENT, { detail: { retryAfter } }),
  );
}
