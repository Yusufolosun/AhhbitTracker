import { networkConfig } from '@/core/config';
import type { MobileAnalyticsEventName, MobileAnalyticsPayload } from './events';
import { anonymizeAddress, sanitizePayload } from './privacy';

interface MobileAnalyticsEnvelope {
  event: MobileAnalyticsEventName;
  payload?: MobileAnalyticsPayload;
  timestamp: string;
  platform: 'mobile';
  stage: string;
  sessionId: string;
}

const ANALYTICS_ENDPOINT = process.env.EXPO_PUBLIC_ANALYTICS_ENDPOINT?.trim();
const ANALYTICS_WRITE_KEY = process.env.EXPO_PUBLIC_ANALYTICS_WRITE_KEY?.trim();
const ANALYTICS_ENABLED = process.env.EXPO_PUBLIC_ANALYTICS_ENABLED !== 'false';
const FLUSH_INTERVAL_MS = 5_000;
const MAX_QUEUE_SIZE = 100;
const sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const queue: MobileAnalyticsEnvelope[] = [];
let flushIntervalHandle: ReturnType<typeof setInterval> | null = null;
let isFlushing = false;

function canSend(): boolean {
  return ANALYTICS_ENABLED && Boolean(ANALYTICS_ENDPOINT);
}

async function flushAnalyticsQueue(): Promise<void> {
  if (!canSend() || !queue.length || isFlushing) {
    return;
  }

  isFlushing = true;
  const batch = queue.splice(0, queue.length);

  try {
    await fetch(ANALYTICS_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(ANALYTICS_WRITE_KEY ? { 'X-Analytics-Key': ANALYTICS_WRITE_KEY } : {}),
      },
      body: JSON.stringify({
        app: 'ahhbittracker-mobile',
        events: batch,
      }),
    });
  } catch {
    queue.unshift(...batch.slice(0, MAX_QUEUE_SIZE));
  } finally {
    isFlushing = false;
  }
}

function startAnalyticsFlushTimer(): void {
  if (flushIntervalHandle !== null) {
    return;
  }

  flushIntervalHandle = setInterval(() => {
    void flushAnalyticsQueue();
  }, FLUSH_INTERVAL_MS);
}

startAnalyticsFlushTimer();

export function trackMobileEvent(event: MobileAnalyticsEventName, payload?: MobileAnalyticsPayload): void {
  const sanitizedPayload = sanitizePayload(payload);

  queue.push({
    event,
    payload: sanitizedPayload,
    timestamp: new Date().toISOString(),
    platform: 'mobile',
    stage: networkConfig.appStage,
    sessionId,
  });

  if (queue.length > MAX_QUEUE_SIZE) {
    queue.splice(0, queue.length - MAX_QUEUE_SIZE);
  }
}

export function toWalletAddressHash(address: string | null | undefined): string | undefined {
  return anonymizeAddress(address);
}

export async function flushMobileAnalytics(): Promise<void> {
  await flushAnalyticsQueue();
}