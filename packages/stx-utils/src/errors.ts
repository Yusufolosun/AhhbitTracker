/**
 * Clarity smart-contract error code helpers.
 *
 * Stacks contracts return numeric error codes (e.g. `u100`). This module
 * provides a registry and lookup function so dApp frontends can translate
 * raw codes into user-friendly messages.
 */

/**
 * Built-in error code map covering the most common AhhbitTracker contract
 * errors. Consumers can extend this with `registerErrors()`.
 */
const registry = new Map<number, string>([
  [100, 'Not authorized'],
  [101, 'Stake amount too low (minimum 0.02 STX)'],
  [102, 'Invalid name (max 50 characters)'],
  [103, 'Item not found'],
  [104, 'Not the owner'],
  [105, 'Already checked in today'],
  [106, 'Check-in window expired — stake forfeited'],
  [107, 'Need 7+ consecutive days to withdraw'],
  [108, 'Already completed'],
  [109, 'Insufficient pool balance'],
  [110, 'Transfer failed'],
  [111, 'Bonus already claimed'],
  [112, 'Maximum number of habits reached'],
  [113, 'Stake amount exceeds the maximum allowed'],
]);

/**
 * Look up a human-readable message for a Clarity error code.
 *
 * @param code - The numeric error code (e.g. `100`).
 * @returns The registered message, or a generic fallback.
 */
export function decodeError(code: number): string {
  return registry.get(code) ?? `Unknown error (u${code})`;
}

/**
 * Register additional error codes (or override existing ones).
 *
 * @param errors - A record mapping numeric codes to messages.
 *
 * @example
 * ```ts
 * registerErrors({ 200: 'Custom error from my contract' });
 * ```
 */
export function registerErrors(errors: Record<number, string>): void {
  for (const [code, message] of Object.entries(errors)) {
    registry.set(Number(code), message);
  }
}

/**
 * Return the full current error registry as a plain object.
 */
export function getErrorRegistry(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const [code, message] of registry) {
    out[code] = message;
  }
  return out;
}
