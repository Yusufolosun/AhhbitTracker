/**
 * Basis point conversions.
 * 1 basis point = 0.01% = 0.0001
 */

const BPS_DIVISOR = 10_000;

/** Maximum basis points (100%) */
export const MAX = BPS_DIVISOR;

/** Convert basis points to a percentage. 30 bps → 0.3% */
export function toPercent(basisPoints: number): number {
  return basisPoints / 100;
}

/** Convert basis points to a decimal multiplier. 30 bps → 0.003 */
export function toDecimal(basisPoints: number): number {
  return basisPoints / BPS_DIVISOR;
}

/** Convert a percentage to basis points. 0.3% → 30 bps */
export function fromPercent(percent: number): number {
  return Math.round(percent * 100);
}

/** Convert a decimal multiplier to basis points. 0.003 → 30 bps */
export function fromDecimal(decimal: number): number {
  return Math.round(decimal * BPS_DIVISOR);
}

/** Apply basis points to an amount (bigint). Returns floored result. */
export function apply(amount: bigint, basisPoints: number): bigint {
  return (amount * BigInt(basisPoints)) / BigInt(BPS_DIVISOR);
}

/** Return the complement: amount minus bps fraction. */
export function complement(amount: bigint, basisPoints: number): bigint {
  return amount - apply(amount, basisPoints);
}
