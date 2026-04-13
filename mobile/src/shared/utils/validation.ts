import { toMicroSTX, validateName, validatePrincipal, validateStake } from '@yusufolosun/stx-utils';
import { MAX_HABIT_NAME_LENGTH, MAX_STAKE_AMOUNT, MIN_STAKE_AMOUNT } from '@/core/config';

export function validateStacksAddress(value: string): string | null {
  return validatePrincipal(value.trim());
}

export function validateHabitName(value: string): string | null {
  return validateName(value.trim(), MAX_HABIT_NAME_LENGTH);
}

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
