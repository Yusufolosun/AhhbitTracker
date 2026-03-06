/**
 * Slippage tolerance calculations.
 */

const BPS_DIVISOR = 10_000n;

/**
 * Calculate minimum acceptable output given a slippage tolerance.
 * minOutput = expectedOutput * (10000 - toleranceBps) / 10000
 *
 * Example: minOutput(1_000_000n, 50) → 995_000n (0.5% slippage)
 */
export function minOutput(expectedOutput: bigint, toleranceBps: number): bigint {
  return (expectedOutput * (BPS_DIVISOR - BigInt(toleranceBps))) / BPS_DIVISOR;
}

/**
 * Calculate maximum acceptable input for a given slippage tolerance.
 * maxInput = expectedInput * (10000 + toleranceBps) / 10000
 */
export function maxInput(expectedInput: bigint, toleranceBps: number): bigint {
  return (expectedInput * (BPS_DIVISOR + BigInt(toleranceBps))) / BPS_DIVISOR;
}

/**
 * Check whether the actual output exceeds the slippage tolerance
 * relative to the expected output. Returns true if slippage is excessive.
 */
export function isExcessive(
  expected: bigint,
  actual: bigint,
  toleranceBps: number,
): boolean {
  if (expected === 0n) return actual === 0n ? false : true;
  const min = minOutput(expected, toleranceBps);
  return actual < min;
}

/**
 * Measure the realized slippage between expected and actual amounts.
 * Returns slippage in basis points (positive = unfavorable).
 *
 * Example: fromAmounts(1_000n, 995n) → 50 (0.5%)
 */
export function fromAmounts(expected: bigint, actual: bigint): number {
  if (expected === 0n) return 0;
  const diff = expected - actual;
  // Convert to number only at the end for precision
  return Number((diff * BPS_DIVISOR) / expected);
}
