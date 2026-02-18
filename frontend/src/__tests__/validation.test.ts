import { describe, it, expect } from 'vitest';
import { validateHabitName, validateStakeAmount } from '../utils/validation';

describe('validateHabitName', () => {
  it('returns null for a valid name', () => {
    expect(validateHabitName('Daily Exercise')).toBeNull();
  });

  it('rejects empty string', () => {
    expect(validateHabitName('')).toBe('Habit name cannot be empty');
  });

  it('rejects whitespace-only string', () => {
    expect(validateHabitName('   ')).toBe('Habit name cannot be empty');
  });

  it('rejects name exceeding max length', () => {
    const longName = 'a'.repeat(51);
    expect(validateHabitName(longName)).toContain('too long');
  });

  it('accepts name at exactly max length', () => {
    const maxName = 'a'.repeat(50);
    expect(validateHabitName(maxName)).toBeNull();
  });
});

describe('validateStakeAmount', () => {
  it('returns null for a valid stake', () => {
    expect(validateStakeAmount(0.5)).toBeNull();
  });

  it('rejects zero stake', () => {
    expect(validateStakeAmount(0)).toBe('Stake amount must be positive');
  });

  it('rejects negative stake', () => {
    expect(validateStakeAmount(-1)).toBe('Stake amount must be positive');
  });

  it('rejects NaN', () => {
    expect(validateStakeAmount(NaN)).toBe('Stake amount must be positive');
  });

  it('rejects stake below minimum', () => {
    expect(validateStakeAmount(0.01)).toContain('Minimum stake');
  });

  it('accepts exact minimum stake (0.1 STX)', () => {
    expect(validateStakeAmount(0.1)).toBeNull();
  });
});
