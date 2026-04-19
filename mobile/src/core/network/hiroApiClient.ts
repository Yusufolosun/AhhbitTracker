import { invalidateReadCache, readThroughCache } from '../data/readCache';

const CACHE_PREFIX = 'mobile-hiro-api:';
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;

export class HiroApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'HiroApiError';
    this.status = status;
  }
}

export interface HiroRequestOptions {
  ttlMs?: number;
  timeoutMs?: number;
  retries?: number;
  bypassCache?: boolean;
}

function shouldRetry(status?: number): boolean {
  return status === undefined || status === 429 || status >= 500;
}

function getHiroApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_HIRO_API_BASE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  return process.env.EXPO_PUBLIC_STACKS_NETWORK === 'testnet'
    ? 'https://api.testnet.hiro.so'
    : 'https://api.mainnet.hiro.so';
}

function makeCacheKey(path: string): string {
  return `${CACHE_PREFIX}${getHiroApiBaseUrl()}${path}`;
}

export function invalidateHiroApiCache(pathPrefix = '/'): void {
  invalidateReadCache(makeCacheKey(pathPrefix));
}

async function fetchJson<T>(path: string, timeoutMs: number, retries: number): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${getHiroApiBaseUrl()}${normalizedPath}`;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        const error = new HiroApiError(
          `Hiro API request failed (${response.status}) for ${normalizedPath}`,
          response.status,
        );

        if (attempt < retries && shouldRetry(response.status)) {
          const backoff = 1_000 * (attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        throw error;
      }

      return (await response.json()) as T;
    } catch (error) {
      const status = error instanceof HiroApiError ? error.status : undefined;

      if (attempt < retries && shouldRetry(status)) {
        const backoff = 1_000 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }

      if (error instanceof HiroApiError) {
        throw error;
      }

      throw new HiroApiError(
        `Hiro API request error for ${normalizedPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new HiroApiError(`Hiro API request failed after retries for ${path}`);
}

export async function fetchHiroJson<T>(
  path: string,
  options: HiroRequestOptions = {},
): Promise<T> {
  const ttlMs = options.ttlMs ?? 0;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const key = makeCacheKey(normalizedPath);
  const request = () => fetchJson<T>(normalizedPath, timeoutMs, retries);

  if (options.bypassCache || ttlMs <= 0) {
    return request();
  }

  return readThroughCache(key, request, {
    ttlMs,
  });
}
