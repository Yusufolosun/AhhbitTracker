import { describe, it, expect } from 'vitest';
import * as slippage from '../slippage.js';

describe('slippage', () => {
  it('minOutput applies slippage tolerance', () => {
    expect(slippage.minOutput(1_000_000n, 50)).toBe(995_000n); // 0.5%
    expect(slippage.minOutput(1_000_000n, 100)).toBe(990_000n); // 1%
    expect(slippage.minOutput(1_000_000n, 0)).toBe(1_000_000n); // 0%
  });

  it('maxInput applies slippage tolerance', () => {
    expect(slippage.maxInput(1_000_000n, 50)).toBe(1_005_000n); // 0.5%
    expect(slippage.maxInput(1_000_000n, 100)).toBe(1_010_000n); // 1%
  });

  it('isExcessive detects excessive slippage', () => {
    expect(slippage.isExcessive(1_000n, 995n, 50)).toBe(false); // exactly 0.5%
    expect(slippage.isExcessive(1_000n, 994n, 50)).toBe(true); // over 0.5%
    expect(slippage.isExcessive(1_000n, 1_000n, 50)).toBe(false); // no slip
  });

  it('isExcessive handles zero expected', () => {
    expect(slippage.isExcessive(0n, 0n, 50)).toBe(false);
    expect(slippage.isExcessive(0n, 1n, 50)).toBe(true);
  });

  it('fromAmounts measures realized slippage in bps', () => {
    expect(slippage.fromAmounts(1_000n, 995n)).toBe(50); // 0.5%
    expect(slippage.fromAmounts(1_000n, 990n)).toBe(100); // 1%
    expect(slippage.fromAmounts(1_000n, 1_000n)).toBe(0); // none
    expect(slippage.fromAmounts(0n, 0n)).toBe(0); // edge case
  });

  it('fromAmounts returns negative for favorable slippage', () => {
    // Actual > expected = favorable
    expect(slippage.fromAmounts(1_000n, 1_010n)).toBe(-100);
  });
});
