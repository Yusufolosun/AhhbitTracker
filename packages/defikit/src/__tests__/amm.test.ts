import { describe, it, expect } from 'vitest';
import { constantProduct, impermanentLoss } from '../amm.js';

describe('amm.constantProduct', () => {
  const reserveIn = 1_000_000_000n; // 1000 tokens (6 decimals)
  const reserveOut = 2_000_000_000n; // 2000 tokens

  describe('getOutputAmount', () => {
    it('calculates output for simple swap', () => {
      const out = constantProduct.getOutputAmount(1_000_000n, reserveIn, reserveOut);
      // 1_000_000 * 2_000_000_000 / (1_000_000_000 + 1_000_000) = 1_998_001
      expect(out).toBe(1_998_001n);
    });

    it('applies fee correctly', () => {
      const outNoFee = constantProduct.getOutputAmount(1_000_000n, reserveIn, reserveOut, 0);
      const outWithFee = constantProduct.getOutputAmount(1_000_000n, reserveIn, reserveOut, 30);
      expect(outWithFee).toBeLessThan(outNoFee);
    });

    it('returns 0 for zero input', () => {
      expect(constantProduct.getOutputAmount(0n, reserveIn, reserveOut)).toBe(0n);
    });

    it('returns 0 for zero reserves', () => {
      expect(constantProduct.getOutputAmount(1_000n, 0n, reserveOut)).toBe(0n);
      expect(constantProduct.getOutputAmount(1_000n, reserveIn, 0n)).toBe(0n);
    });

    it('large trade gets worse price (constant product curve)', () => {
      const small = constantProduct.getOutputAmount(1_000_000n, reserveIn, reserveOut);
      const large = constantProduct.getOutputAmount(100_000_000n, reserveIn, reserveOut);
      // Price per unit should be worse for larger trade
      const priceSmall = Number(small) / 1_000_000;
      const priceLarge = Number(large) / 100_000_000;
      expect(priceLarge).toBeLessThan(priceSmall);
    });
  });

  describe('getInputAmount', () => {
    it('calculates input for desired output', () => {
      const input = constantProduct.getInputAmount(1_998_002n, reserveIn, reserveOut);
      // Should be approximately 1_000_000
      expect(input).toBeGreaterThanOrEqual(1_000_000n);
      expect(input).toBeLessThan(1_000_002n);
    });

    it('is inverse of getOutputAmount', () => {
      const amountIn = 5_000_000n;
      const amountOut = constantProduct.getOutputAmount(amountIn, reserveIn, reserveOut);
      const recoveredIn = constantProduct.getInputAmount(amountOut, reserveIn, reserveOut);
      // Due to rounding, should be >= original
      expect(recoveredIn).toBeGreaterThanOrEqual(amountIn);
      // But very close
      expect(recoveredIn - amountIn).toBeLessThanOrEqual(1n);
    });

    it('returns 0 for zero or excessive output', () => {
      expect(constantProduct.getInputAmount(0n, reserveIn, reserveOut)).toBe(0n);
      expect(constantProduct.getInputAmount(reserveOut, reserveIn, reserveOut)).toBe(0n);
    });
  });

  describe('priceImpact', () => {
    it('returns higher impact for larger trades', () => {
      const smallImpact = constantProduct.priceImpact(1_000_000n, reserveIn, reserveOut);
      const largeImpact = constantProduct.priceImpact(100_000_000n, reserveIn, reserveOut);
      expect(largeImpact).toBeGreaterThan(smallImpact);
    });

    it('returns 0 for zero values', () => {
      expect(constantProduct.priceImpact(0n, reserveIn, reserveOut)).toBe(0);
      expect(constantProduct.priceImpact(1_000n, 0n, reserveOut)).toBe(0);
    });

    it('small trade has low impact', () => {
      // 0.001% of reserve should have ~1 bps impact
      const impact = constantProduct.priceImpact(1_000n, reserveIn, reserveOut);
      expect(impact).toBeLessThan(10); // < 0.1%
    });
  });

  describe('spotPrice', () => {
    it('calculates spot price with same decimals', () => {
      const price = constantProduct.spotPrice(1_000_000_000n, 2_000_000_000n, 6, 6);
      expect(price).toBe(2);
    });

    it('adjusts for different decimals', () => {
      // 1000 TOKEN-A (8 dec) : 3000 TOKEN-B (6 dec)
      const reserveA = 1_000n * 10n ** 8n;
      const reserveB = 3_000n * 10n ** 6n;
      const price = constantProduct.spotPrice(reserveA, reserveB, 8, 6);
      // ratio = 3_000_000_000 / 100_000_000_000 = 0.03, scale = 10^(6-8) = 0.01
      // price = 0.03 * 0.01 = 0.0003
      expect(price).toBeCloseTo(0.0003, 8);
    });

    it('returns 0 for zero reserves', () => {
      expect(constantProduct.spotPrice(0n, 1_000n, 6, 6)).toBe(0);
    });
  });
});

describe('impermanentLoss', () => {
  it('returns 0 at 1:1 price ratio (no change)', () => {
    expect(impermanentLoss(1)).toBeCloseTo(0, 10);
  });

  it('returns ~5.7% loss at 2x price', () => {
    const il = impermanentLoss(2);
    expect(il).toBeCloseTo(-0.05719, 4);
  });

  it('is symmetric for inverse ratios', () => {
    // IL at 2x should equal IL at 0.5x
    expect(impermanentLoss(2)).toBeCloseTo(impermanentLoss(0.5), 10);
  });

  it('increases with larger price divergence', () => {
    const il2x = impermanentLoss(2);
    const il5x = impermanentLoss(5);
    expect(il5x).toBeLessThan(il2x); // more negative = more loss
  });

  it('returns 0 for invalid ratio', () => {
    expect(impermanentLoss(0)).toBe(0);
    expect(impermanentLoss(-1)).toBe(0);
  });
});
