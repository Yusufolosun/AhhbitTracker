/**
 * Yield / interest rate conversions.
 */

/**
 * Convert APR to APY given a compounding frequency.
 * APY = (1 + APR/n)^n - 1
 *
 * @param apr — Annual Percentage Rate as a percentage (e.g. 10 for 10%)
 * @param compoundsPerYear — Number of compounding periods (365 for daily, 12 for monthly)
 * @returns APY as a percentage
 *
 * Example: aprToApy(10, 365) → ~10.5156
 */
export function aprToApy(apr: number, compoundsPerYear: number): number {
  const rate = apr / 100;
  return ((1 + rate / compoundsPerYear) ** compoundsPerYear - 1) * 100;
}

/**
 * Convert APY to APR given a compounding frequency.
 * APR = n * ((1 + APY)^(1/n) - 1)
 *
 * @param apy — Annual Percentage Yield as a percentage (e.g. 10.5 for 10.5%)
 * @param compoundsPerYear — Number of compounding periods
 * @returns APR as a percentage
 */
export function apyToApr(apy: number, compoundsPerYear: number): number {
  const rate = apy / 100;
  return compoundsPerYear * ((1 + rate) ** (1 / compoundsPerYear) - 1) * 100;
}

/**
 * Convert an annual rate to a daily rate.
 * @param annualRate — Annual rate as a percentage
 * @returns Daily rate as a percentage
 */
export function dailyRate(annualRate: number): number {
  return annualRate / 365;
}

/**
 * Calculate the compounded return on a principal.
 *
 * @param principal — Starting amount
 * @param apr — Annual rate as a percentage
 * @param compoundsPerYear — Compounding frequency
 * @param years — Duration
 * @returns Final amount after compounding
 */
export function compoundedReturn(
  principal: number,
  apr: number,
  compoundsPerYear: number,
  years: number,
): number {
  const rate = apr / 100;
  return principal * (1 + rate / compoundsPerYear) ** (compoundsPerYear * years);
}
