const DEFAULT_TIMEOUT_MS = 12_000;

export function resolveTimeoutMs(value?: number): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.floor(value);
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs?: number): Promise<T> {
  const effectiveTimeout = resolveTimeoutMs(timeoutMs);

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Read-only query timed out after ${effectiveTimeout}ms`));
        }, effectiveTimeout);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}