/**
 * Protocol fee calculations.
 * Supports fee-on-input, fee-on-output, and tiered fee schedules.
 */

export interface FeeResult {
  /** Fee amount */
  fee: bigint;
  /** Amount after fee deduction */
  net: bigint;
}

export interface GrossFeeResult {
  /** Fee amount */
  fee: bigint;
  /** Total amount including fee */
  gross: bigint;
}

export interface FeeTier {
  /** Upper bound of this tier (exclusive). Use 0n for unlimited. */
  threshold: bigint;
  /** Fee rate in basis points for this tier */
  bps: number;
}

const BPS_DIVISOR = 10_000n;

/**
 * Fee-on-input: fee is deducted from the input amount.
 * net = amount - fee, where fee = floor(amount * bps / 10000)
 *
 * Example: onInput(1_000_000n, 30) → { fee: 3_000n, net: 997_000n }
 */
export function onInput(amount: bigint, bps: number): FeeResult {
  const fee = (amount * BigInt(bps)) / BPS_DIVISOR;
  return { fee, net: amount - fee };
}

/**
 * Fee-on-output: determines the gross amount a user must provide
 * so that after fee deduction, `amount` remains.
 * gross = ceil(amount * 10000 / (10000 - bps))
 *
 * Example: onOutput(997_000n, 30) → { fee: 3_009n, gross: 1_000_009n }
 */
export function onOutput(amount: bigint, bps: number): GrossFeeResult {
  const denom = BPS_DIVISOR - BigInt(bps);
  // ceiling division: (a + b - 1) / b
  const gross = (amount * BPS_DIVISOR + denom - 1n) / denom;
  const fee = gross - amount;
  return { fee, gross };
}

/**
 * Tiered fee schedule. Each tier defines a bps rate up to a threshold.
 * Amounts are split across tiers and each portion is charged its tier's rate.
 *
 * Tiers must be sorted by threshold ascending. The last tier's threshold
 * should be 0n (meaning unlimited / catch-all).
 *
 * Example:
 *   tiered(1_500_000n, [
 *     { threshold: 1_000_000n, bps: 50 },
 *     { threshold: 0n, bps: 30 },
 *   ])
 *   → first 1M charged at 50 bps, remaining 500K charged at 30 bps
 */
export function tiered(amount: bigint, tiers: FeeTier[]): FeeResult {
  let remaining = amount;
  let totalFee = 0n;
  let prev = 0n;

  for (const tier of tiers) {
    if (remaining <= 0n) break;

    const isUnlimited = tier.threshold === 0n;
    const tierSize = isUnlimited ? remaining : tier.threshold - prev;
    const taxable = remaining < tierSize ? remaining : tierSize;

    totalFee += (taxable * BigInt(tier.bps)) / BPS_DIVISOR;
    remaining -= taxable;
    prev = tier.threshold;
  }

  return { fee: totalFee, net: amount - totalFee };
}
