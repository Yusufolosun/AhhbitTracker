import { formatSTX, shortenAddress, toMicroSTX } from '@yusufolosun/stx-utils';

/**
 * Formats a micro-STX amount into a human-readable STX string.
 *
 * @param microStx - The amount in micro-STX.
 * @returns A formatted string such as "1.5 STX".
 */
export function formatMicroStx(microStx: number): string {
  return `${formatSTX(microStx)} STX`;
}

/**
 * Formats a streak count with correct pluralisation.
 *
 * @param value - The number of streak days.
 * @returns A formatted string such as "3 days".
 */
export function formatStreakDays(value: number): string {
  return `${value} day${value === 1 ? '' : 's'}`;
}

/**
 * Shortens a Stacks address for display.
 *
 * @param value - The full Stacks address.
 * @returns A shortened address string.
 */
export function formatAddress(value: string): string {
  return shortenAddress(value);
}

export { toMicroSTX };
