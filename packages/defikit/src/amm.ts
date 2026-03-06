/**
 * Automated Market Maker (AMM) math.
 * Implements constant-product (x*y=k) formulas used by Uniswap V2, SushiSwap,
 * PancakeSwap, and most DEXs.
 */

const BPS_DIVISOR = 10_000n;

export const constantProduct = {
  /**
   * Calculate output amount for a given input (x*y=k).
   * Optionally applies a swap fee in basis points.
   *
   * Formula: amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
   * With fee: amountIn is reduced by feeBps first.
   */
  getOutputAmount(
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    feeBps = 0,
  ): bigint {
    if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) return 0n;

    const effectiveIn =
      feeBps > 0
        ? (amountIn * (BPS_DIVISOR - BigInt(feeBps))) / BPS_DIVISOR
        : amountIn;

    const numerator = effectiveIn * reserveOut;
    const denominator = reserveIn + effectiveIn;
    return numerator / denominator;
  },

  /**
   * Calculate required input amount for a desired output (x*y=k).
   * Optionally includes a swap fee.
   *
   * Returns ceiling value (round up to ensure sufficient input).
   */
  getInputAmount(
    amountOut: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    feeBps = 0,
  ): bigint {
    if (amountOut <= 0n || reserveIn <= 0n || reserveOut <= amountOut) return 0n;

    const numerator = reserveIn * amountOut;
    const denominator = reserveOut - amountOut;
    // ceiling division
    const rawInput = (numerator + denominator - 1n) / denominator;

    if (feeBps > 0) {
      // Reverse the fee: rawInput / (1 - fee) = rawInput * 10000 / (10000 - fee)
      const denom = BPS_DIVISOR - BigInt(feeBps);
      return (rawInput * BPS_DIVISOR + denom - 1n) / denom;
    }
    return rawInput;
  },

  /**
   * Calculate price impact in basis points for a constant-product swap.
   * Price impact measures how much the effective price deviates from the
   * spot price due to trade size.
   *
   * Returns a positive number (higher = worse).
   */
  priceImpact(
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
  ): number {
    if (reserveIn <= 0n || reserveOut <= 0n || amountIn <= 0n) return 0;

    // Spot price output: amountIn * reserveOut / reserveIn (no curve effect)
    const spotOut = (amountIn * reserveOut) / reserveIn;
    // Actual output through the curve
    const actualOut = (amountIn * reserveOut) / (reserveIn + amountIn);

    if (spotOut === 0n) return 0;
    return Number(((spotOut - actualOut) * BPS_DIVISOR) / spotOut);
  },

  /**
   * Spot price of token-out in terms of token-in, adjusted for decimals.
   * Returns a human-readable floating-point price.
   */
  spotPrice(
    reserveIn: bigint,
    reserveOut: bigint,
    decimalsIn: number,
    decimalsOut: number,
  ): number {
    if (reserveIn === 0n) return 0;
    const scale = 10 ** (decimalsOut - decimalsIn);
    return (Number(reserveOut) / Number(reserveIn)) * scale;
  },
};

/**
 * Calculate impermanent loss for a constant-product LP position.
 * @param priceRatio — current price / entry price (e.g. 2.0 means price doubled)
 * @returns Loss as a negative decimal (e.g. -0.0566 for ~5.7% loss at 2x price)
 */
export function impermanentLoss(priceRatio: number): number {
  if (priceRatio <= 0) return 0;
  return (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
}
