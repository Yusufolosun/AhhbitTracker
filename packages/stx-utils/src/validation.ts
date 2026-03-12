/**
 * Validation helpers for common Stacks dApp inputs.
 *
 * Each validator returns `null` when the value is valid, or a
 * human-readable error string describing the problem.
 */

import { MICRO_PER_STX } from './formatting';

/** Default minimum stake (0.1 STX in microSTX). */
export const DEFAULT_MIN_STAKE = 100_000;

/** Default maximum name length (Clarity `string-utf8` cap). */
export const DEFAULT_MAX_NAME_LENGTH = 50;

/**
 * Validate a habit / item name.
 *
 * @param name      - The name to validate.
 * @param maxLength - Maximum allowed length (default: 50).
 * @returns `null` when valid, or an error message string.
 */
export function validateName(
  name: string,
  maxLength: number = DEFAULT_MAX_NAME_LENGTH,
): string | null {
  if (!name || name.trim().length === 0) {
    return 'Name cannot be empty';
  }
  if (name.length > maxLength) {
    return `Name too long (max ${maxLength} characters)`;
  }
  return null;
}

/**
 * Validate an STX stake amount.
 *
 * @param stx         - Amount in STX (not microSTX).
 * @param minMicroSTX - Minimum acceptable amount in microSTX (default: 100 000).
 * @returns `null` when valid, or an error message string.
 */
export function validateStake(
  stx: number,
  minMicroSTX: number = DEFAULT_MIN_STAKE,
): string | null {
  if (isNaN(stx) || !Number.isFinite(stx) || stx <= 0) {
    return 'Stake amount must be positive';
  }
  const micro = stx * MICRO_PER_STX;
  if (micro < minMicroSTX) {
    return `Minimum stake is ${minMicroSTX / MICRO_PER_STX} STX`;
  }
  return null;
}

/**
 * Validate a Stacks principal (standard or contract).
 *
 * @param principal - The string to validate.
 * @returns `null` when valid, or an error message string.
 */
export function validatePrincipal(principal: string): string | null {
  if (!principal) return 'Principal is required';

  // Contract principal: address.name
  if (principal.includes('.')) {
    const dot = principal.indexOf('.');
    const addr = principal.slice(0, dot);
    const name = principal.slice(dot + 1);
    if (!/^S[PT][A-Z0-9]{38,40}$/.test(addr)) {
      return 'Invalid deployer address';
    }
    if (!/^[a-zA-Z][\w-]{0,127}$/.test(name)) {
      return 'Invalid contract name';
    }
    return null;
  }

  // Standard principal
  if (!/^S[PT][A-Z0-9]{38,40}$/.test(principal)) {
    return 'Invalid Stacks address';
  }
  return null;
}
