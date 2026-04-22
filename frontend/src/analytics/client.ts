import type { AnalyticsEvent, AnalyticsEventPayload } from './events';
import { sanitizePayload } from './privacy';

interface AnalyticsEnvelope {
  event: AnalyticsEvent['event'];
  payload?: AnalyticsEventPayload;
  timestamp: string;
  platform: 'web';
  stage: string;
  sessionId: string;
}

interface AnalyticsClientOptions {
  endpoint?: string;
  writeKey?: string;
  enabled: boolean;
  stage: string;
  flushIntervalMs?: number;
  maxQueueSize?: number;
}

const DEFAULT_FLUSH_INTERVAL_MS = 5_000;
const DEFAULT_MAX_QUEUE_SIZE = 100;

function createSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createAnalyticsClient(options: AnalyticsClientOptions) {
  const queue: AnalyticsEnvelope[] = [];
  const flushIntervalMs = options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;
  const maxQueueSize = options.maxQueueSize ?? DEFAULT_MAX_QUEUE_SIZE;
  const sessionId = createSessionId();
  let timerId: ReturnType<typeof setInterval> | null = null;
  let isFlushing = false;

  const shouldSend = options.enabled && Boolean(options.endpoint);

  const flush = async () => {
    if (!shouldSend || isFlushing || !queue.length) {
      return;
    }

    isFlushing = true;
    const batch = queue.splice(0, queue.length);

    const body = JSON.stringify({
      app: 'ahhbittracker-web',
      events: batch,
    });

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        const ok = navigator.sendBeacon(options.endpoint!, blob);
        if (!ok) {
          throw new Error('sendBeacon rejected payload');
        }
      } else {
        await fetch(options.endpoint!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(options.writeKey ? { 'X-Analytics-Key': options.writeKey } : {}),
          },
          body,
          keepalive: true,
        });
      }
    } catch {
      queue.unshift(...batch.slice(0, maxQueueSize));
    } finally {
      isFlushing = false;
    }
  };

  const enqueue = (event: AnalyticsEvent['event'], payload?: AnalyticsEventPayload) => {
    const sanitizedPayload = sanitizePayload(payload);

    queue.push({
      event,
      payload: sanitizedPayload,
      timestamp: new Date().toISOString(),
      platform: 'web',
      stage: options.stage,
      sessionId,
    });

    if (queue.length > maxQueueSize) {
      queue.splice(0, queue.length - maxQueueSize);
    }
  };

  const start = () => {
    if (timerId !== null) {
      return;
    }

    timerId = setInterval(() => {
      void flush();
    }, flushIntervalMs);

    window.addEventListener('beforeunload', () => {
      void flush();
    });
  };

  const stop = async () => {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }

    await flush();
  };

  return {
    track: enqueue,
    flush,
    start,
    stop,
  };
}