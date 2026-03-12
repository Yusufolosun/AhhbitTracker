/**
 * STX / microSTX conversion and display formatting.
 *
 * All on-chain STX values are stored as unsigned integers in microSTX
 * (1 STX = 1 000 000 microSTX). These helpers convert between the two
 * representations and produce human-readable display strings.
 */

/** Number of microSTX per 1 STX. */
export const MICRO_PER_STX = 1_000_000;

/**
 * Convert microSTX to STX and return a fixed-decimal string.
 *
 * @param microSTX - Amount in microSTX (unsigned integer).
 * @param decimals - Decimal places in the output (default: 2).
 * @returns Formatted string, e.g. `"1.50"`.
 */
export function formatSTX(microSTX: number, decimals = 2): string {
  return (microSTX / MICRO_PER_STX).toFixed(decimals);
}

/**
 * Convert an STX amount to microSTX.
 *
 * The result is floored to the nearest integer because on-chain values
 * cannot have fractional microSTX.
 *
 * @param stx - Amount in STX.
 * @returns Whole-number microSTX value.
 */
export function toMicroSTX(stx: number): number {
  return Math.floor(stx * MICRO_PER_STX);
}

/**
 * Convert microSTX back to a numeric STX value.
 *
 * @param microSTX - Amount in microSTX.
 * @returns Floating-point STX value.
 */
export function toSTX(microSTX: number): number {
  return microSTX / MICRO_PER_STX;
}

/**
 * Format microSTX as a display string with a unit suffix.
 *
 * Values < 1 STX are shown as microSTX (e.g. `"500 uSTX"`), while larger
 * values are shown in STX (e.g. `"2.50 STX"`).
 *
 * @param microSTX - Amount in microSTX.
 * @returns Human-readable string with unit.
 */
export function formatSTXWithUnit(microSTX: number): string {
  if (microSTX < MICRO_PER_STX) {
    return `${microSTX} uSTX`;
  }
  return `${formatSTX(microSTX)} STX`;
}

/**
 * Format microSTX as a compact display string with K/M/B suffixes.
 *
 * @param microSTX - Amount in microSTX.
 * @returns Compact string, e.g. `"1.0K STX"`, `"2.5M STX"`.
 */
export function formatSTXCompact(microSTX: number): string {
  const stx = microSTX / MICRO_PER_STX;
  if (stx >= 1_000_000_000) return `${(stx / 1_000_000_000).toFixed(1)}B STX`;
  if (stx >= 1_000_000) return `${(stx / 1_000_000).toFixed(1)}M STX`;
  if (stx >= 1_000) return `${(stx / 1_000).toFixed(1)}K STX`;
  return `${stx.toFixed(2)} STX`;
}
