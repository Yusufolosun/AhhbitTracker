import type { AnalyticsEventPayload } from './events';

function stableHash(input: string): string {
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

function truncateErrorMessage(message: string): string {
  return message.length > 160 ? `${message.slice(0, 157)}...` : message;
}

export function anonymizeAddress(address: string | null | undefined): string | undefined {
  if (!address) {
    return undefined;
  }

  return stableHash(address.toLowerCase());
}

export function sanitizePayload(payload?: AnalyticsEventPayload): AnalyticsEventPayload | undefined {
  if (!payload) {
    return undefined;
  }

  return {
    ...payload,
    txId: undefined,
    errorMessage: payload.errorMessage ? truncateErrorMessage(payload.errorMessage) : undefined,
  };
}