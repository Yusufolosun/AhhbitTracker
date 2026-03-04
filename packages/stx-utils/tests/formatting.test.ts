import { describe, it, expect } from 'vitest';
import {
  MICRO_PER_STX,
  formatSTX,
  toMicroSTX,
  toSTX,
  formatSTXWithUnit,
} from '../src/formatting';

describe('MICRO_PER_STX', () => {
  it('equals 1 000 000', () => {
    expect(MICRO_PER_STX).toBe(1_000_000);
  });
});

describe('formatSTX', () => {
  it('converts microSTX to STX string with 2 decimals', () => {
    expect(formatSTX(1_000_000)).toBe('1.00');
  });

  it('handles zero', () => {
    expect(formatSTX(0)).toBe('0.00');
  });

  it('rounds correctly', () => {
    expect(formatSTX(100_000)).toBe('0.10');
    expect(formatSTX(1_500_000)).toBe('1.50');
  });

  it('handles fractional microSTX', () => {
    expect(formatSTX(123_456)).toBe('0.12');
  });

  it('supports custom decimal places', () => {
    expect(formatSTX(1_234_567, 4)).toBe('1.2346');
    expect(formatSTX(1_234_567, 0)).toBe('1');
  });
});

describe('toMicroSTX', () => {
  it('converts 1 STX to 1 000 000 microSTX', () => {
    expect(toMicroSTX(1)).toBe(1_000_000);
  });

  it('floors the result', () => {
    expect(toMicroSTX(0.000_000_1)).toBe(0);
  });

  it('handles decimal STX', () => {
    expect(toMicroSTX(0.1)).toBe(100_000);
  });

  it('handles large values', () => {
    expect(toMicroSTX(1000)).toBe(1_000_000_000);
  });
});

describe('toSTX', () => {
  it('converts microSTX to numeric STX', () => {
    expect(toSTX(1_000_000)).toBe(1);
    expect(toSTX(500_000)).toBe(0.5);
  });
});

describe('formatSTXWithUnit', () => {
  it('uses uSTX for sub-STX amounts', () => {
    expect(formatSTXWithUnit(500)).toBe('500 uSTX');
    expect(formatSTXWithUnit(999_999)).toBe('999999 uSTX');
  });

  it('uses STX for >= 1 STX', () => {
    expect(formatSTXWithUnit(1_000_000)).toBe('1.00 STX');
    expect(formatSTXWithUnit(2_500_000)).toBe('2.50 STX');
  });
});
