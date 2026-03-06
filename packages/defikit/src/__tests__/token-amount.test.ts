import { describe, it, expect } from 'vitest';
import * as tokenAmount from '../token-amount.js';

describe('tokenAmount', () => {
  describe('fromHuman', () => {
    it('converts whole numbers', () => {
      expect(tokenAmount.fromHuman('100', 6)).toBe(100_000_000n);
      expect(tokenAmount.fromHuman('1', 18)).toBe(1_000_000_000_000_000_000n);
    });

    it('converts decimal amounts', () => {
      expect(tokenAmount.fromHuman('1.5', 6)).toBe(1_500_000n);
      expect(tokenAmount.fromHuman('0.001', 6)).toBe(1_000n);
      expect(tokenAmount.fromHuman('1.123456', 6)).toBe(1_123_456n);
    });

    it('truncates excess decimals', () => {
      expect(tokenAmount.fromHuman('1.1234567', 6)).toBe(1_123_456n);
    });

    it('pads insufficient decimals', () => {
      expect(tokenAmount.fromHuman('1.1', 6)).toBe(1_100_000n);
    });

    it('handles edge cases', () => {
      expect(tokenAmount.fromHuman('0', 6)).toBe(0n);
      expect(tokenAmount.fromHuman('', 6)).toBe(0n);
      expect(tokenAmount.fromHuman('.', 6)).toBe(0n);
      expect(tokenAmount.fromHuman('0.0', 6)).toBe(0n);
    });

    it('handles negative amounts', () => {
      expect(tokenAmount.fromHuman('-1.5', 6)).toBe(-1_500_000n);
    });

    it('handles zero decimals', () => {
      expect(tokenAmount.fromHuman('100', 0)).toBe(100n);
    });
  });

  describe('toHuman', () => {
    it('converts raw to human-readable', () => {
      expect(tokenAmount.toHuman(1_500_000n, 6)).toBe('1.5');
      expect(tokenAmount.toHuman(100_000_000n, 6)).toBe('100');
      expect(tokenAmount.toHuman(1_000_000_000_000_000_000n, 18)).toBe('1');
    });

    it('handles amounts less than 1', () => {
      expect(tokenAmount.toHuman(500_000n, 6)).toBe('0.5');
      expect(tokenAmount.toHuman(1n, 6)).toBe('0.000001');
    });

    it('strips trailing zeros', () => {
      expect(tokenAmount.toHuman(1_100_000n, 6)).toBe('1.1');
      expect(tokenAmount.toHuman(1_000_000n, 6)).toBe('1');
    });

    it('handles zero', () => {
      expect(tokenAmount.toHuman(0n, 6)).toBe('0');
    });

    it('handles negative amounts', () => {
      expect(tokenAmount.toHuman(-1_500_000n, 6)).toBe('-1.5');
    });

    it('handles zero decimals', () => {
      expect(tokenAmount.toHuman(100n, 0)).toBe('100');
    });
  });

  describe('format', () => {
    it('formats with fixed display decimals', () => {
      expect(tokenAmount.format(1_500_000n, 6, 2)).toBe('1.50');
      expect(tokenAmount.format(1_123_456n, 6, 4)).toBe('1.1234');
      expect(tokenAmount.format(1_000_000n, 6, 2)).toBe('1.00');
    });

    it('without displayDecimals strips trailing zeros', () => {
      expect(tokenAmount.format(1_500_000n, 6)).toBe('1.5');
      expect(tokenAmount.format(1_000_000n, 6)).toBe('1');
    });
  });

  describe('scale', () => {
    it('scales up decimals', () => {
      expect(tokenAmount.scale(1_500_000n, 6, 18)).toBe(1_500_000_000_000_000_000n);
    });

    it('scales down decimals', () => {
      expect(tokenAmount.scale(1_500_000_000_000_000_000n, 18, 6)).toBe(1_500_000n);
    });

    it('returns same value for equal decimals', () => {
      expect(tokenAmount.scale(1_500_000n, 6, 6)).toBe(1_500_000n);
    });
  });

  describe('roundtrip', () => {
    it('fromHuman → toHuman preserves value', () => {
      const cases = ['0', '1', '1.5', '0.000001', '123456.789012'];
      for (const c of cases) {
        expect(tokenAmount.toHuman(tokenAmount.fromHuman(c, 6), 6)).toBe(c);
      }
    });
  });
});
