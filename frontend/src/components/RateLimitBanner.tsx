import { useState, useEffect, useCallback } from 'react';
import {
  HIRO_RATE_LIMIT_EVENT,
  HiroRateLimitDetail,
} from '../utils/rateLimitEvents';
import { CalloutCard } from './ui';

/**
 * Banner displayed when Hiro API returns 429 (Too Many Requests).
 * Automatically counts down to the next retry attempt and disappears once
 * the rate limit window has passed.
 * @component
 */
export function RateLimitBanner() {
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  const handleRateLimit = useCallback((event: CustomEvent<HiroRateLimitDetail>) => {
    const seconds = event.detail.retryAfter || 30;
    setRetryAfter(seconds);
    setCountdown(seconds);
  }, []);

  useEffect(() => {
    window.addEventListener(HIRO_RATE_LIMIT_EVENT, handleRateLimit as EventListener);
    return () => window.removeEventListener(HIRO_RATE_LIMIT_EVENT, handleRateLimit as EventListener);
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
    <div className="fixed top-16 inset-x-0 z-50 px-4 py-2 animate-fade-in">
      <CalloutCard
        title="API rate limit reached"
        tone="warning"
        description={
          <span>
            retrying in <strong>{countdown}s</strong>
          </span>
        }
        icon={
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
}
