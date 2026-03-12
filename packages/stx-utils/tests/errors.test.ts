import { describe, it, expect } from 'vitest';
import { decodeError, registerErrors, getErrorRegistry } from '../src/errors';

describe('decodeError', () => {
  it('returns message for known code', () => {
    expect(decodeError(100)).toBe('Not authorized');
    expect(decodeError(105)).toBe('Already checked in today');
  });

  it('returns fallback for unknown code', () => {
    expect(decodeError(999)).toBe('Unknown error (u999)');
  });
});

describe('registerErrors', () => {
  it('adds new codes', () => {
    registerErrors({ 200: 'Custom error' });
    expect(decodeError(200)).toBe('Custom error');
  });

  it('overrides existing codes', () => {
    registerErrors({ 100: 'Overridden auth error' });
    expect(decodeError(100)).toBe('Overridden auth error');
    // Restore original for other tests
    registerErrors({ 100: 'Not authorized' });
  });
});

describe('getErrorRegistry', () => {
  it('returns a plain object of all codes', () => {
    const reg = getErrorRegistry();
    expect(typeof reg).toBe('object');
    expect(reg[101]).toBe('Stake amount too low (minimum 0.02 STX)');
  });
});
