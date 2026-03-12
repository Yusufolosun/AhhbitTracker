# @yusufolosun/stx-utils

[![npm version](https://img.shields.io/npm/v/@yusufolosun/stx-utils)](https://www.npmjs.com/package/@yusufolosun/stx-utils)
[![license](https://img.shields.io/npm/l/@yusufolosun/stx-utils)](./LICENSE)
[![tests](https://img.shields.io/badge/tests-259%20passing-brightgreen)]()
[![zero deps](https://img.shields.io/badge/dependencies-0-brightgreen)]()

Lightweight, zero-dependency utilities for **Stacks (STX)** dApp development.

- **10 modules** — formatting, addresses, blocks, validation, errors, time, explorer, Clarity decoder, memos, and PoX stacking
- **Dual format** — ESM + CommonJS with full TypeScript declarations
- **Tree-shakeable** — import only what you need
- **259 tests** — comprehensive coverage including edge cases

## Install

```bash
# npm
npm install @yusufolosun/stx-utils

# yarn
yarn add @yusufolosun/stx-utils

# pnpm
pnpm add @yusufolosun/stx-utils
```

## Modules

| Module | Description |
|---|---|
| **Formatting** | Convert between STX / microSTX, compact display (K/M/B) |
| **Address** | Validate, shorten, and parse Stacks principals |
| **Blocks** | Estimate durations from block counts, "time ago" helpers |
| **Validation** | Validate names, stake amounts, and principals |
| **Errors** | Decode Clarity error codes into human-readable messages |
| **Time** | Format dates and relative timestamps |
| **Explorer** | Build Hiro explorer URLs for txs, addresses, contracts, blocks |
| **Clarity** | Decode hex-encoded Clarity values (SIP-005) into JS objects |
| **Memo** | Encode/decode 34-byte STX transfer memos |
| **Stacking** | PoX reward cycle calculations and progress tracking |

## Quick Start

```ts
import {
  formatSTX,
  toMicroSTX,
  formatSTXCompact,
  shortenAddress,
  isValidAddress,
  blocksToTime,
  blocksAgo,
  validateStake,
  decodeError,
  txUrl,
  blockUrl,
  apiUrl,
  decodeClarityValue,
  encodeMemo,
  blockToCycle,
} from '@yusufolosun/stx-utils';

// STX formatting
formatSTX(1_500_000);            // "1.50"
toMicroSTX(2.5);                 // 2_500_000
formatSTXCompact(1_500_000_000); // "1.5K STX"

// Addresses
shortenAddress('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193');
// → "SP1M46...G193"
isValidAddress('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193'); // true

// Block time
blocksToTime(144);   // "1 day"
blocksAgo(1000, 994); // "~1h ago"

// Validation
validateStake(0.5);  // null (valid)
validateStake(0.01); // "Minimum stake is 0.1 STX"

// Error decoding
decodeError(105);    // "Already checked in today"

// Explorer URLs
txUrl('0xabc123');   // "https://explorer.hiro.so/txid/0xabc123?chain=mainnet"
txUrl('deadbeef');   // auto-prepends 0x
blockUrl('0xabc', 'testnet');
apiUrl('mainnet');   // "https://stacks-node-api.mainnet.stacks.co"

// Clarity value decoding
const cv = decodeClarityValue('0x0100000000000000000000000000000064');
// → { type: 'uint', value: 100n }

// Memo encoding
const memo = encodeMemo('Hello Stacks');
// → Uint8Array(34) [ 72, 101, 108, ... 0, 0 ]

// PoX stacking
blockToCycle(670000); // → 1 (reward cycle number)
```

## API Reference

### Formatting

| Function | Description |
|---|---|
| `formatSTX(microSTX, decimals?)` | Convert microSTX to display string |
| `toMicroSTX(stx)` | Convert STX to microSTX |
| `toSTX(microSTX)` | Convert microSTX to numeric STX |
| `formatSTXWithUnit(microSTX)` | Format with automatic unit suffix (`uSTX` or `STX`) |
| `formatSTXCompact(microSTX)` | Compact format with K/M/B suffixes |
| `MICRO_PER_STX` | Constant: `1_000_000` |

### Address

| Function | Description |
|---|---|
| `isValidAddress(address)` | Check standard principal validity |
| `isContractPrincipal(address)` | Check contract principal validity |
| `getAddressNetwork(address)` | Returns `"mainnet"`, `"testnet"`, or `null` |
| `shortenAddress(address, startChars?, endChars?)` | Truncate for display |
| `parseContractPrincipal(principal)` | Extract `[address, name]` tuple |

### Blocks

| Function | Description |
|---|---|
| `blocksToTime(blocks)` | Human-readable duration from block count |
| `blocksToSeconds(blocks)` | Convert blocks to seconds |
| `secondsToBlocks(seconds)` | Convert seconds to blocks |
| `blocksAgo(currentBlock, targetBlock)` | Relative block time string |
| `estimateBlockDate(targetBlock, currentBlock, now?)` | Estimated `Date` object |
| `SECONDS_PER_BLOCK` | Constant: `600` |
| `BLOCKS_PER_DAY` | Constant: `144` |

### Validation

| Function | Description |
|---|---|
| `validateName(name, maxLength?)` | Validate a Clarity string input |
| `validateStake(stx, minMicroSTX?)` | Validate stake amount (rejects NaN, Infinity) |
| `validatePrincipal(principal)` | Validate standard or contract principal |
| `DEFAULT_MIN_STAKE` | Constant: `100_000` (0.1 STX in microSTX) |
| `DEFAULT_MAX_NAME_LENGTH` | Constant: `50` |

### Errors

| Function | Description |
|---|---|
| `decodeError(code)` | Look up a Clarity error code |
| `registerErrors(errors)` | Add or override error codes |
| `getErrorRegistry()` | Get snapshot of all registered codes |

### Time

| Function | Description |
|---|---|
| `formatDate(timestamp, locale?)` | Format a UNIX timestamp |
| `timeAgo(timestamp)` | Relative time string |

### Explorer

| Function | Description |
|---|---|
| `txUrl(txId, network?)` | Transaction explorer link (auto-prepends `0x`) |
| `addressUrl(address, network?)` | Address explorer link |
| `contractUrl(principal, network?)` | Contract explorer link |
| `blockUrl(blockHash, network?)` | Block explorer link |
| `apiUrl(network?)` | Stacks node API base URL |

### Clarity

| Function | Description |
|---|---|
| `decodeClarityValue(hex)` | Decode hex-encoded Clarity value to typed JS object |
| `unwrapResponse(cv)` | Unwrap an `ok` response or throw on `err` |
| `extractValue(cv)` | Recursively extract plain JS values from Clarity types |

Supported types: `int`, `uint`, `bool`, `buffer`, `string-ascii`, `string-utf8`, `none`, `some`, `ok`, `err`, `list`, `tuple`, `principal`.

### Memo

| Function | Description |
|---|---|
| `encodeMemo(text)` | Encode UTF-8 string to 34-byte memo buffer |
| `decodeMemo(bytes)` | Decode 34-byte memo buffer to string |
| `memoToHex(text)` | Encode memo and return hex string |
| `memoFromHex(hex)` | Decode hex memo to string |
| `MEMO_MAX_BYTES` | Constant: `34` |

### Stacking (PoX)

| Function | Description |
|---|---|
| `blockToCycle(burnBlockHeight, startHeight?, cycleLength?)` | Get cycle number from block height |
| `cycleToBlock(cycle, startHeight?, cycleLength?)` | Get first block of a cycle |
| `cycleProgress(burnBlockHeight, startHeight?, cycleLength?)` | Blocks into cycle + progress ratio |
| `blocksUntilNextCycle(burnBlockHeight, startHeight?, cycleLength?)` | Blocks remaining in current cycle |
| `isInPreparePhase(burnBlockHeight, startHeight?, cycleLength?, prepareLength?)` | Whether block is in prepare phase |
| `BLOCKS_PER_CYCLE` | Constant: `2100` |
| `POX_START_HEIGHT` | Constant: `666050` |

## License

MIT
