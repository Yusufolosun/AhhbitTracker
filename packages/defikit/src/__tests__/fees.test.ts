import { describe, it, expect } from 'vitest';
import * as fees from '../fees.js';

describe('fees', () => {
  describe('onInput', () => {
    it('deducts fee from input amount', () => {
      const result = fees.onInput(1_000_000n, 30);
      expect(result.fee).toBe(3_000n);
      expect(result.net).toBe(997_000n);
    });

    it('handles zero fee', () => {
      const result = fees.onInput(1_000_000n, 0);
      expect(result.fee).toBe(0n);
      expect(result.net).toBe(1_000_000n);
    });

    it('handles 100% fee', () => {
      const result = fees.onInput(1_000_000n, 10_000);
      expect(result.fee).toBe(1_000_000n);
      expect(result.net).toBe(0n);
    });

    it('floors the fee (favors user)', () => {
      // 999 * 30 / 10000 = 2.997, floors to 2
      const result = fees.onInput(999n, 30);
      expect(result.fee).toBe(2n);
      expect(result.net).toBe(997n);
    });

    it('fee + net always equals original amount', () => {
      const amounts = [1n, 100n, 999n, 1_000_000n, 123_456_789n];
      const bpsValues = [1, 30, 100, 5000, 9999];
      for (const amount of amounts) {
        for (const bp of bpsValues) {
          const { fee, net } = fees.onInput(amount, bp);
          expect(fee + net).toBe(amount);
        }
      }
    });
  });

  describe('onOutput', () => {
    it('calculates gross amount to yield desired net', () => {
      const result = fees.onOutput(997_000n, 30);
      // gross should be >= 1_000_000 so that after 30bps fee, net >= 997_000
      expect(result.gross).toBeGreaterThanOrEqual(1_000_000n);
      // Verify: applying fee to gross yields at least the desired amount
      const check = fees.onInput(result.gross, 30);
      expect(check.net).toBeGreaterThanOrEqual(997_000n);
    });

    it('handles zero fee', () => {
      const result = fees.onOutput(1_000_000n, 0);
      expect(result.gross).toBe(1_000_000n);
      expect(result.fee).toBe(0n);
    });
  });

  describe('tiered', () => {
    it('applies single tier', () => {
      const result = fees.tiered(1_000_000n, [
        { threshold: 0n, bps: 30 },
      ]);
      expect(result.fee).toBe(3_000n);
      expect(result.net).toBe(997_000n);
    });

    it('applies multiple tiers', () => {
      const result = fees.tiered(1_500_000n, [
        { threshold: 1_000_000n, bps: 50 },
        { threshold: 0n, bps: 30 },
      ]);
      // First 1M at 50 bps = 5000
      // Remaining 500K at 30 bps = 1500
      // Total fee = 6500
      expect(result.fee).toBe(6_500n);
      expect(result.net).toBe(1_493_500n);
    });

    it('amount below first tier uses only first tier', () => {
      const result = fees.tiered(500_000n, [
        { threshold: 1_000_000n, bps: 50 },
        { threshold: 0n, bps: 30 },
      ]);
      expect(result.fee).toBe(2_500n);
    });

    it('fee + net always equals original amount', () => {
      const result = fees.tiered(1_234_567n, [
        { threshold: 500_000n, bps: 100 },
        { threshold: 1_000_000n, bps: 50 },
        { threshold: 0n, bps: 25 },
      ]);
      expect(result.fee + result.net).toBe(1_234_567n);
    });
  });
});
