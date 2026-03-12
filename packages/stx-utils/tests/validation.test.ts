import { describe, it, expect } from 'vitest';
import { validateName, validateStake, validatePrincipal } from '../src/validation';

describe('validateName', () => {
  it('returns null for valid name', () => {
    expect(validateName('Daily Exercise')).toBeNull();
  });

  it('rejects empty string', () => {
    expect(validateName('')).toBe('Name cannot be empty');
  });

  it('rejects whitespace-only', () => {
    expect(validateName('   ')).toBe('Name cannot be empty');
  });

  it('rejects name exceeding max length', () => {
    expect(validateName('a'.repeat(51))).toContain('too long');
  });

  it('accepts name at exactly max length', () => {
    expect(validateName('a'.repeat(50))).toBeNull();
  });

  it('respects custom max length', () => {
    expect(validateName('hello', 3)).toContain('too long');
    expect(validateName('hi', 3)).toBeNull();
  });
});

describe('validateStake', () => {
  it('returns null for valid stake', () => {
    expect(validateStake(0.5)).toBeNull();
  });

  it('rejects zero', () => {
    expect(validateStake(0)).toBe('Stake amount must be positive');
  });

  it('rejects negative', () => {
    expect(validateStake(-1)).toBe('Stake amount must be positive');
  });

  it('rejects NaN', () => {
    expect(validateStake(NaN)).toBe('Stake amount must be positive');
  });

  it('rejects below minimum', () => {
    expect(validateStake(0.01)).toContain('Minimum stake');
  });

  it('accepts exact minimum (0.1 STX)', () => {
    expect(validateStake(0.1)).toBeNull();
  });

  it('respects custom minimum', () => {
    expect(validateStake(0.5, 1_000_000)).toContain('Minimum stake');
    expect(validateStake(1.0, 1_000_000)).toBeNull();
  });
});

describe('validatePrincipal', () => {
  it('accepts valid mainnet address', () => {
    expect(
      validatePrincipal('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193'),
    ).toBeNull();
  });

  it('accepts valid testnet address', () => {
    expect(
      validatePrincipal('ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5'),
    ).toBeNull();
  });

  it('accepts valid contract principal', () => {
    expect(
      validatePrincipal(
        'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker-v2',
      ),
    ).toBeNull();
  });

  it('rejects empty', () => {
    expect(validatePrincipal('')).toBe('Principal is required');
  });

  it('rejects invalid address', () => {
    expect(validatePrincipal('not-valid')).toBe('Invalid Stacks address');
  });

  it('rejects invalid contract name', () => {
    expect(
      validatePrincipal('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.123bad'),
    ).toBe('Invalid contract name');
  });
});
