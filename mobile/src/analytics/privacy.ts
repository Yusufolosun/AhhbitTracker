import type { MobileAnalyticsPayload } from './events';

function stableHash(input: string): string {
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function anonymizeAddress(address: string | null | undefined): string | undefined {
  if (!address) {
    return undefined;
  }

  return stableHash(address.toLowerCase());
}

export function sanitizePayload(payload?: MobileAnalyticsPayload): MobileAnalyticsPayload | undefined {
  if (!payload) {
    return undefined;
  }

  return {
    ...payload,
    errorMessage:
      payload.errorMessage && payload.errorMessage.length > 160
        ? `${payload.errorMessage.slice(0, 157)}...`
        : payload.errorMessage,
  };
}