import { describe, it, expect } from 'vitest';
import * as bps from '../bps.js';

describe('bps', () => {
  it('toPercent converts basis points to percentage', () => {
    expect(bps.toPercent(30)).toBe(0.3);
    expect(bps.toPercent(100)).toBe(1);
    expect(bps.toPercent(10_000)).toBe(100);
    expect(bps.toPercent(0)).toBe(0);
    expect(bps.toPercent(1)).toBe(0.01);
  });

  it('toDecimal converts basis points to decimal', () => {
    expect(bps.toDecimal(30)).toBe(0.003);
    expect(bps.toDecimal(100)).toBe(0.01);
    expect(bps.toDecimal(10_000)).toBe(1);
  });

  it('fromPercent converts percentage to basis points', () => {
    expect(bps.fromPercent(0.3)).toBe(30);
    expect(bps.fromPercent(1)).toBe(100);
    expect(bps.fromPercent(100)).toBe(10_000);
    expect(bps.fromPercent(0.01)).toBe(1);
  });

  it('fromDecimal converts decimal to basis points', () => {
    expect(bps.fromDecimal(0.003)).toBe(30);
    expect(bps.fromDecimal(0.01)).toBe(100);
    expect(bps.fromDecimal(1)).toBe(10_000);
  });

  it('apply calculates bps fraction of a bigint amount', () => {
    expect(bps.apply(1_000_000n, 30)).toBe(3_000n);
    expect(bps.apply(1_000_000n, 100)).toBe(10_000n);
    expect(bps.apply(1_000_000n, 0)).toBe(0n);
    expect(bps.apply(999n, 30)).toBe(2n); // floor division
  });

  it('complement returns amount minus bps fraction', () => {
    expect(bps.complement(1_000_000n, 30)).toBe(997_000n);
    expect(bps.complement(1_000_000n, 100)).toBe(990_000n);
    expect(bps.complement(1_000_000n, 0)).toBe(1_000_000n);
  });

  it('MAX is 10000', () => {
    expect(bps.MAX).toBe(10_000);
  });

  it('roundtrips percent correctly', () => {
    for (const pct of [0, 0.01, 0.5, 1, 5, 10, 50, 100]) {
      expect(bps.toPercent(bps.fromPercent(pct))).toBeCloseTo(pct);
    }
  });
});
