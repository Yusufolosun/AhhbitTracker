import { MIN_STAKE_AMOUNT, MAX_HABIT_NAME_LENGTH } from './constants';

/**
 * Validate habit name
 */
export function validateHabitName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Habit name cannot be empty';
  }
  
  if (name.length > MAX_HABIT_NAME_LENGTH) {
    return `Habit name too long (max ${MAX_HABIT_NAME_LENGTH} characters)`;
  }
  
  return null;
}

/**
 * Validate stake amount
 */
export function validateStakeAmount(stx: number): string | null {
  if (isNaN(stx) || stx <= 0) {
    return 'Stake amount must be positive';
  }
  
  const microSTX = stx * 1000000;
  
  if (microSTX < MIN_STAKE_AMOUNT) {
    return `Minimum stake is ${MIN_STAKE_AMOUNT / 1000000} STX`;
  }
  
  return null;
}
