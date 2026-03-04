/**
 * Re-export validation utilities from the stx-utils package.
 * Wraps the generic validators to preserve the existing API
 * (validateHabitName / validateStakeAmount).
 */
import { validateName, validateStake } from 'stx-utils';
import { MIN_STAKE_AMOUNT, MAX_HABIT_NAME_LENGTH } from './constants';

export function validateHabitName(name: string): string | null {
  const err = validateName(name, MAX_HABIT_NAME_LENGTH);
  if (err === 'Name cannot be empty') return 'Habit name cannot be empty';
  if (err?.includes('too long'))
    return `Habit name too long (max ${MAX_HABIT_NAME_LENGTH} characters)`;
  return err;
}

export function validateStakeAmount(stx: number): string | null {
  return validateStake(stx, MIN_STAKE_AMOUNT);
}
