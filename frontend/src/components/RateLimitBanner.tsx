import { useState, useEffect, useCallback } from 'react';

/**
 * Banner displayed when Hiro API returns 429 (Too Many Requests).
 * Automatically counts down to the next retry attempt and disappears once
 * the rate limit window has passed.
 */
export function RateLimitBanner() {
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  const handleRateLimit = useCallback((event: CustomEvent<{ retryAfter: number }>) => {
    const seconds = event.detail.retryAfter || 30;
    setRetryAfter(seconds);
    setCountdown(seconds);
  }, []);

  useEffect(() => {
    window.addEventListener('hiro-rate-limit', handleRateLimit as EventListener);
    return () => window.removeEventListener('hiro-rate-limit', handleRateLimit as EventListener);
  }, [handleRateLimit]);

  useEffect(() => {
    if (countdown <= 0) {
      setRetryAfter(null);
      return;
    }
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (retryAfter === null) return null;

  return (
    <div
      role="alert"
      className="fixed top-16 inset-x-0 z-50 flex items-center justify-center px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-800 animate-fade-in"
    >
      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        API rate limit reached — retrying in <strong>{countdown}s</strong>
      </span>
    </div>
  );
}

/**
 * Dispatch a custom event when 429 is detected. Call this from fetch wrappers
 * or React Query's `onError` / `queryFn` catch blocks.
 */
export function emitRateLimitEvent(retryAfter = 30): void {
  window.dispatchEvent(
    new CustomEvent('hiro-rate-limit', { detail: { retryAfter } }),
  );
}
