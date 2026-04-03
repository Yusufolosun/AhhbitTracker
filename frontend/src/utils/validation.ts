/**
 * Re-export validation utilities from the stx-utils package.
 * Wraps the generic validators to preserve the existing API
 * (validateHabitName / validateStakeAmount).
 */
import { validateName, validateStake, toMicroSTX } from '@yusufolosun/stx-utils';
import { MIN_STAKE_AMOUNT, MAX_STAKE_AMOUNT, MAX_HABIT_NAME_LENGTH } from './constants';

/**
 * Validates a habit name for the contract requirements.
 * @param name - The habit name to validate
 * @returns Error message string if invalid, null if valid
 */
export function validateHabitName(name: string): string | null {
  const err = validateName(name, MAX_HABIT_NAME_LENGTH);
  if (err === 'Name cannot be empty') return 'Habit name cannot be empty';
  if (err?.includes('too long'))
    return `Habit name too long (max ${MAX_HABIT_NAME_LENGTH} characters)`;
  return err;
}

/**
 * Validates a stake amount in STX for the contract requirements.
 * @param stx - The stake amount in STX (not microSTX)
 * @returns Error message string if invalid, null if valid
 */
export function validateStakeAmount(stx: number): string | null {
  // validateStake v2.0.1 only checks minimum; we add max check here
  const minErr = validateStake(stx, MIN_STAKE_AMOUNT);
  if (minErr) return minErr;

  const microSTX = toMicroSTX(stx);
  if (microSTX > MAX_STAKE_AMOUNT) {
    return `Maximum stake is ${MAX_STAKE_AMOUNT / 1_000_000} STX`;
  }
  return null;
}
