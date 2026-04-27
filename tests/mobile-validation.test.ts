import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@/core/config', () => ({
  MAX_HABIT_NAME_LENGTH: 50,
  MIN_STAKE_AMOUNT: 100_000,
  MAX_STAKE_AMOUNT: 100_000_000,
}));

let validateStacksAddress: (value: string) => string | null;
let validateHabitName: (value: string) => string | null;
let validateHabitStake: (value: number) => string | null;

beforeAll(async () => {
  ({
    validateStacksAddress,
    validateHabitName,
    validateHabitStake,
  } = await import('../mobile/src/shared/utils/validation'));
});

describe('mobile validation helpers', () => {
  it('validates and normalizes Stacks principal input', () => {
    expect(validateStacksAddress('  SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z  ')).toBeNull();
    expect(validateStacksAddress('invalid-address')).not.toBeNull();
  });

  it('validates habit names against app constraints', () => {
    expect(validateHabitName('Read 20 pages')).toBeNull();
    expect(validateHabitName('')).not.toBeNull();
    expect(validateHabitName('a'.repeat(51))).not.toBeNull();
  });

  it('enforces minimum and maximum stake bounds', () => {
    expect(validateHabitStake(0.05)).not.toBeNull();
    expect(validateHabitStake(100)).toBeNull();
    expect(validateHabitStake(100.000001)).toBe('Maximum stake is 100 STX');
  });
});
