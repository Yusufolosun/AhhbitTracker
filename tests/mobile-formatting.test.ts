import { describe, expect, it } from 'vitest';
import {
  formatAddress,
  formatMicroStx,
  formatStreakDays,
  toMicroSTX,
} from '../mobile/src/shared/utils/formatting';

describe('mobile formatting helpers', () => {
  it('formats streak day labels with singular and plural forms', () => {
    expect(formatStreakDays(1)).toBe('1 day');
    expect(formatStreakDays(2)).toBe('2 days');
  });

  it('appends STX unit when formatting micro STX values', () => {
    expect(formatMicroStx(1_000_000)).toMatch(/ STX$/);
    expect(formatMicroStx(123_456)).toMatch(/ STX$/);
  });

  it('shortens addresses for compact display', () => {
    const fullAddress = 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z';
    const shortened = formatAddress(fullAddress);

    expect(shortened).not.toBe(fullAddress);
    expect(shortened.length).toBeLessThan(fullAddress.length);
  });

  it('re-exports toMicroSTX conversion helper', () => {
    expect(toMicroSTX(0.1)).toBe(100_000);
    expect(toMicroSTX(1)).toBe(1_000_000);
  });
});
