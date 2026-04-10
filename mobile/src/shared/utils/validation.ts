import { validateName, validatePrincipal, validateStake } from '@yusufolosun/stx-utils';
import { MIN_STAKE_AMOUNT } from '@/core/config';

export function validateStacksAddress(value: string): string | null {
  return validatePrincipal(value.trim());
}

export function validateHabitName(value: string): string | null {
  return validateName(value.trim());
}

export function validateHabitStake(stxAmount: number): string | null {
  return validateStake(stxAmount, MIN_STAKE_AMOUNT);
}
