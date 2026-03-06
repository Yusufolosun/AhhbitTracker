import { describe, it, expect } from 'vitest';
import * as yieldMath from '../yield.js';

describe('yieldMath', () => {
  describe('aprToApy', () => {
    it('converts APR to APY with daily compounding', () => {
      const apy = yieldMath.aprToApy(10, 365);
      expect(apy).toBeCloseTo(10.5156, 2);
    });

    it('converts APR to APY with monthly compounding', () => {
      const apy = yieldMath.aprToApy(12, 12);
      expect(apy).toBeCloseTo(12.6825, 2);
    });

    it('returns 0 for 0 APR', () => {
      expect(yieldMath.aprToApy(0, 365)).toBe(0);
    });

    it('with 1 compound per year, APY equals APR', () => {
      expect(yieldMath.aprToApy(10, 1)).toBeCloseTo(10, 10);
    });
  });

  describe('apyToApr', () => {
    it('converts APY back to APR', () => {
      const apr = yieldMath.apyToApr(10.5156, 365);
      expect(apr).toBeCloseTo(10, 1);
    });

    it('roundtrips with aprToApy', () => {
      const originalApr = 15;
      const apy = yieldMath.aprToApy(originalApr, 365);
      const recoveredApr = yieldMath.apyToApr(apy, 365);
      expect(recoveredApr).toBeCloseTo(originalApr, 8);
    });
  });

  describe('dailyRate', () => {
    it('divides annual rate by 365', () => {
      expect(yieldMath.dailyRate(365)).toBeCloseTo(1, 10);
      expect(yieldMath.dailyRate(10)).toBeCloseTo(10 / 365, 10);
    });
  });

  describe('compoundedReturn', () => {
    it('calculates compounded growth', () => {
      // $1000 at 10% APR, daily compounding, 1 year
      const result = yieldMath.compoundedReturn(1000, 10, 365, 1);
      expect(result).toBeCloseTo(1105.16, 1);
    });

    it('returns principal at 0% rate', () => {
      expect(yieldMath.compoundedReturn(1000, 0, 365, 1)).toBe(1000);
    });

    it('handles multiple years', () => {
      const result = yieldMath.compoundedReturn(1000, 10, 1, 2);
      // Simple compounding: 1000 * 1.1 * 1.1 = 1210
      expect(result).toBeCloseTo(1210, 5);
    });
  });
});
