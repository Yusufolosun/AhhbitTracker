import { createAnalyticsClient } from './client';
import { anonymizeAddress } from './privacy';
import type { AnalyticsEventName, AnalyticsEventPayload } from './events';

const analyticsEnv = import.meta.env as Record<string, string | undefined>;
const analyticsEndpoint = analyticsEnv.VITE_ANALYTICS_ENDPOINT?.trim();
const analyticsWriteKey = analyticsEnv.VITE_ANALYTICS_WRITE_KEY?.trim();
const analyticsEnabled = analyticsEnv.VITE_ANALYTICS_ENABLED !== 'false';
const dntEnabled = typeof navigator !== 'undefined' && navigator.doNotTrack === '1';

const analyticsClient = createAnalyticsClient({
  endpoint: analyticsEndpoint,
  writeKey: analyticsWriteKey,
  enabled: analyticsEnabled && !dntEnabled,
  stage: analyticsEnv.VITE_APP_STAGE ?? (import.meta.env.DEV ? 'development' : 'production'),
});

analyticsClient.start();

export function trackEvent(event: AnalyticsEventName, payload?: AnalyticsEventPayload): void {
  analyticsClient.track(event, payload);
}

export function toWalletAddressHash(address: string | null | undefined): string | undefined {
  return anonymizeAddress(address);
}