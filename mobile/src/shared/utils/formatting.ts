import { formatSTX, shortenAddress, toMicroSTX } from '@yusufolosun/stx-utils';

export function formatMicroStx(microStx: number): string {
  return `${formatSTX(microStx)} STX`;
}

export function formatStreakDays(value: number): string {
  return `${value} day${value === 1 ? '' : 's'}`;
}

export function formatAddress(value: string): string {
  return shortenAddress(value);
}

export { toMicroSTX };
