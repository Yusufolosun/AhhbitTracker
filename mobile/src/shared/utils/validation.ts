import { toMicroSTX, validateName, validatePrincipal, validateStake } from '@yusufolosun/stx-utils';
import { MAX_HABIT_NAME_LENGTH, MAX_STAKE_AMOUNT, MIN_STAKE_AMOUNT } from '@/core/config';

/**
 * Validates a Stacks address / principal.
 *
 * @param value - The Stacks address to validate.
 * @returns An error message string if invalid, or null if valid.
 */
export function validateStacksAddress(value: string): string | null {
  return validatePrincipal(value.trim());
}

/**
 * Validates a habit name against the maximum allowed length.
 *
 * @param value - The habit name string.
 * @returns An error message string if invalid, or null if valid.
 */
export function validateHabitName(value: string): string | null {
  return validateName(value.trim(), MAX_HABIT_NAME_LENGTH);
}

/**
 * Validates a habit stake amount against minimum and maximum constraints.
 *
 * @param stxAmount - The stake amount in STX.
 * @returns An error message string if invalid, or null if valid.
 */
export function validateHabitStake(stxAmount: number): string | null {
  const minErr = validateStake(stxAmount, MIN_STAKE_AMOUNT);

  if (minErr) {
    return minErr;
  }

  if (toMicroSTX(stxAmount) > MAX_STAKE_AMOUNT) {
    return `Maximum stake is ${MAX_STAKE_AMOUNT / 1_000_000} STX`;
  }

  return null;
}
