# defikit

Lightweight, zero-dependency DeFi math utilities for TypeScript and JavaScript.

Basis points, fees, slippage, AMM math, token amounts, and yield calculations — the formulas every DeFi project reimplements from scratch.

**11.6 kB** gzipped. Works in Node.js, browsers, and any chain.

## Install

```bash
npm install defikit
```

## Modules

### bps — Basis Point Conversions

```typescript
import { bps } from 'defikit';

bps.toPercent(30)          // 0.3    (30 bps → 0.3%)
bps.toDecimal(30)          // 0.003  (30 bps → multiplier)
bps.fromPercent(0.3)       // 30     (0.3% → 30 bps)
bps.fromDecimal(0.003)     // 30

bps.apply(1_000_000n, 30)      // 3_000n   (30 bps of 1M)
bps.complement(1_000_000n, 30) // 997_000n (1M minus 30 bps)

bps.MAX // 10_000 (100%)
```

### fees — Protocol Fee Calculations

```typescript
import { fees } from 'defikit';

// Fee-on-input: deduct fee from input amount
fees.onInput(1_000_000n, 30)
// → { fee: 3_000n, net: 997_000n }

// Fee-on-output: how much gross input yields a desired net
fees.onOutput(997_000n, 30)
// → { fee: 3_009n, gross: 1_000_009n }

// Tiered fee schedule
fees.tiered(1_500_000n, [
  { threshold: 1_000_000n, bps: 50 },  // first 1M at 50 bps
  { threshold: 0n, bps: 30 },           // rest at 30 bps
])
// → { fee: 6_500n, net: 1_493_500n }
```

### slippage — Slippage Tolerance

```typescript
import { slippage } from 'defikit';

slippage.minOutput(1_000_000n, 50)    // 995_000n (0.5% tolerance)
slippage.maxInput(1_000_000n, 50)     // 1_005_000n

slippage.isExcessive(1000n, 994n, 50) // true (> 0.5% slip)
slippage.fromAmounts(1000n, 995n)     // 50 (realized slip in bps)
```

### amm — Constant-Product AMM Math

```typescript
import { amm } from 'defikit';

const reserveIn  = 1_000_000_000n; // 1000 tokens (6 decimals)
const reserveOut = 2_000_000_000n; // 2000 tokens

// Output amount (x*y=k)
amm.constantProduct.getOutputAmount(1_000_000n, reserveIn, reserveOut)
// → 1_998_001n

// With 30 bps swap fee
amm.constantProduct.getOutputAmount(1_000_000n, reserveIn, reserveOut, 30)
// → 1_992_017n

// Required input for desired output
amm.constantProduct.getInputAmount(1_998_001n, reserveIn, reserveOut)
// → 1_000_000n

// Price impact in basis points
amm.constantProduct.priceImpact(100_000_000n, reserveIn, reserveOut)
// → 909 (9.09%)

// Spot price adjusted for decimals
amm.constantProduct.spotPrice(reserveIn, reserveOut, 6, 6)
// → 2.0

// Impermanent loss
amm.impermanentLoss(2.0)  // -0.05719 (~5.7% loss at 2x price change)
amm.impermanentLoss(0.5)  // -0.05719 (symmetric)
```

### tokenAmount — Precision-Safe Token Amounts

```typescript
import { tokenAmount } from 'defikit';

// Human-readable → raw integer (no floating-point errors)
tokenAmount.fromHuman('1.5', 6)     // 1_500_000n
tokenAmount.fromHuman('0.001', 18)  // 1_000_000_000_000_000n

// Raw integer → human-readable
tokenAmount.toHuman(1_500_000n, 6)  // '1.5'

// Formatted display
tokenAmount.format(1_500_000n, 6, 2) // '1.50'
tokenAmount.format(1_500_000n, 6)    // '1.5'

// Re-scale between different token decimals
tokenAmount.scale(1_500_000n, 6, 18) // 1_500_000_000_000_000_000n
```

### yieldMath — APR / APY Conversions

```typescript
import { yieldMath } from 'defikit';

// APR → APY with compounding frequency
yieldMath.aprToApy(10, 365)  // 10.5156 (daily compounding)
yieldMath.aprToApy(12, 12)   // 12.6825 (monthly)

// APY → APR
yieldMath.apyToApr(10.5156, 365)  // ~10.0

// Daily rate from annual
yieldMath.dailyRate(10)  // 0.02739...

// Compounded return
yieldMath.compoundedReturn(1000, 10, 365, 1)  // 1105.16
```

## Design Decisions

- **BigInt for token math** — no floating-point rounding errors on amounts
- **Numbers for rates/percentages** — practical for display and small values
- **Floor rounding on fees** — rounding always favors the user
- **Ceiling rounding on required inputs** — ensures sufficient coverage
- **Zero dependencies** — nothing to audit, nothing to break
- **Chain-agnostic** — works with Ethereum, Solana, Stacks, or any chain

## API Reference

### bps

| Function | Signature | Description |
|----------|-----------|-------------|
| `toPercent` | `(bps: number) → number` | 30 → 0.3 |
| `toDecimal` | `(bps: number) → number` | 30 → 0.003 |
| `fromPercent` | `(pct: number) → number` | 0.3 → 30 |
| `fromDecimal` | `(dec: number) → number` | 0.003 → 30 |
| `apply` | `(amount: bigint, bps: number) → bigint` | bps fraction of amount |
| `complement` | `(amount: bigint, bps: number) → bigint` | amount minus bps fraction |

### fees

| Function | Signature | Description |
|----------|-----------|-------------|
| `onInput` | `(amount: bigint, bps: number) → { fee, net }` | Fee deducted from input |
| `onOutput` | `(amount: bigint, bps: number) → { fee, gross }` | Gross needed for desired net |
| `tiered` | `(amount: bigint, tiers: FeeTier[]) → { fee, net }` | Multi-tier fee schedule |

### slippage

| Function | Signature | Description |
|----------|-----------|-------------|
| `minOutput` | `(expected: bigint, toleranceBps: number) → bigint` | Minimum acceptable output |
| `maxInput` | `(expected: bigint, toleranceBps: number) → bigint` | Maximum acceptable input |
| `isExcessive` | `(expected: bigint, actual: bigint, toleranceBps: number) → boolean` | Check if slippage exceeds tolerance |
| `fromAmounts` | `(expected: bigint, actual: bigint) → number` | Realized slippage in bps |

### amm.constantProduct

| Function | Signature | Description |
|----------|-----------|-------------|
| `getOutputAmount` | `(amountIn, reserveIn, reserveOut, feeBps?) → bigint` | Output from constant-product curve |
| `getInputAmount` | `(amountOut, reserveIn, reserveOut, feeBps?) → bigint` | Required input (ceiling) |
| `priceImpact` | `(amountIn, reserveIn, reserveOut) → number` | Impact in basis points |
| `spotPrice` | `(reserveIn, reserveOut, decimalsIn, decimalsOut) → number` | Decimal-adjusted spot price |
| `impermanentLoss` | `(priceRatio: number) → number` | IL as negative decimal |

### tokenAmount

| Function | Signature | Description |
|----------|-----------|-------------|
| `fromHuman` | `(amount: string, decimals: number) → bigint` | Parse human amount to raw |
| `toHuman` | `(amount: bigint, decimals: number) → string` | Raw to human string |
| `format` | `(amount: bigint, decimals: number, displayDecimals?) → string` | Formatted display |
| `scale` | `(amount: bigint, fromDecimals, toDecimals) → bigint` | Re-scale between precisions |

### yieldMath

| Function | Signature | Description |
|----------|-----------|-------------|
| `aprToApy` | `(apr, compoundsPerYear) → number` | APR to APY conversion |
| `apyToApr` | `(apy, compoundsPerYear) → number` | APY to APR conversion |
| `dailyRate` | `(annualRate) → number` | Annual to daily rate |
| `compoundedReturn` | `(principal, apr, compoundsPerYear, years) → number` | Compounded growth |

## License

MIT
