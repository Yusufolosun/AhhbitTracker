import { STACKS_API_URL } from '../utils/constants';
import { emitRateLimitEvent } from '../utils/rateLimitEvents';
import { invalidateReadCache, readThroughCache } from './readCache';

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;

export class HiroApiError extends Error {
  status?: number;
  headers?: Headers;

  constructor(message: string, status?: number, headers?: Headers) {
    super(message);
    this.name = 'HiroApiError';
    this.status = status;
    this.headers = headers;
  }
}

export interface HiroApiRequestOptions {
  ttlMs?: number;
  timeoutMs?: number;
  bypassCache?: boolean;
  retries?: number;
}

function resolveHiroBaseUrl(): string {
  const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
  return isDev
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/stacks`
    : STACKS_API_URL;
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function shouldRetryStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

async function fetchJson<T>(path: string, timeoutMs: number, retries: number): Promise<T> {
  const url = `${resolveHiroBaseUrl()}${normalizePath(path)}`;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') ?? '30', 10);
        emitRateLimitEvent(Number.isFinite(retryAfter) ? retryAfter : 30);
      }

      if (!response.ok) {
        const message = `Hiro API request failed (${response.status}) for ${path}`;

        if (attempt < retries && shouldRetryStatus(response.status)) {
          const backoff = 1_000 * (attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        throw new HiroApiError(message, response.status, response.headers);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (attempt < retries) {
        const status = error instanceof HiroApiError ? error.status : undefined;
        if (status === undefined || shouldRetryStatus(status)) {
          const backoff = 1_000 * (attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
      }

      if (error instanceof HiroApiError) {
        throw error;
      }

      throw new HiroApiError(
        `Hiro API request error for ${path}: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new HiroApiError(`Hiro API request failed after retries for ${path}`);
}

export async function fetchHiroApiJson<T>(
  path: string,
  options: HiroApiRequestOptions = {},
): Promise<T> {
  const ttlMs = options.ttlMs ?? 0;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const cacheKey = `hiro:${resolveHiroBaseUrl()}${normalizePath(path)}`;

  const requester = () => fetchJson<T>(path, timeoutMs, retries);

  if (options.bypassCache || ttlMs <= 0) {
    return requester();
  }

  return readThroughCache(cacheKey, requester, {
    ttlMs,
    forceRefresh: options.bypassCache,
  });
}

export function invalidateHiroApiCache(pathPrefix = '/'): void {
  const fullPrefix = `hiro:${resolveHiroBaseUrl()}${normalizePath(pathPrefix)}`;
  invalidateReadCache(fullPrefix);
}
