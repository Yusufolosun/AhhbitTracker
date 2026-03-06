/**
 * Precision-safe token amount conversions.
 * Handles human-readable ↔ raw integer conversions without floating-point errors.
 */

/**
 * Convert a human-readable amount string to raw integer (bigint).
 * Avoids floating-point by parsing the string directly.
 *
 * Example: fromHuman('1.5', 6) → 1_500_000n
 */
export function fromHuman(amount: string, decimals: number): bigint {
  const trimmed = amount.trim();
  if (trimmed === '' || trimmed === '.') return 0n;

  const negative = trimmed.startsWith('-');
  const abs = negative ? trimmed.slice(1) : trimmed;

  const [intPart = '0', fracPart = ''] = abs.split('.');
  const paddedFrac = fracPart.padEnd(decimals, '0').slice(0, decimals);
  const raw = BigInt(intPart + paddedFrac);
  return negative ? -raw : raw;
}

/**
 * Convert a raw integer amount to a human-readable string.
 *
 * Example: toHuman(1_500_000n, 6) → '1.5'
 */
export function toHuman(amount: bigint, decimals: number): string {
  if (decimals === 0) return amount.toString();

  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const str = abs.toString().padStart(decimals + 1, '0');
  const intPart = str.slice(0, str.length - decimals);
  const fracPart = str.slice(str.length - decimals).replace(/0+$/, '');
  const result = fracPart ? `${intPart}.${fracPart}` : intPart;
  return negative ? `-${result}` : result;
}

/**
 * Format a raw integer with a fixed number of display decimals.
 *
 * Example: format(1_500_000n, 6, 2) → '1.50'
 */
export function format(
  amount: bigint,
  decimals: number,
  displayDecimals?: number,
): string {
  if (decimals === 0) return amount.toString();

  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const str = abs.toString().padStart(decimals + 1, '0');
  const intPart = str.slice(0, str.length - decimals);
  let fracPart = str.slice(str.length - decimals);

  if (displayDecimals !== undefined) {
    fracPart = fracPart.slice(0, displayDecimals).padEnd(displayDecimals, '0');
  } else {
    fracPart = fracPart.replace(/0+$/, '');
  }

  const result = fracPart ? `${intPart}.${fracPart}` : intPart;
  return negative ? `-${result}` : result;
}

/**
 * Re-scale a token amount between different decimal precisions.
 *
 * Example: scale(1_500_000n, 6, 18) → 1_500_000_000_000_000_000n
 */
export function scale(
  amount: bigint,
  fromDecimals: number,
  toDecimals: number,
): bigint {
  const diff = toDecimals - fromDecimals;
  if (diff > 0) return amount * 10n ** BigInt(diff);
  if (diff < 0) return amount / 10n ** BigInt(-diff);
  return amount;
}
