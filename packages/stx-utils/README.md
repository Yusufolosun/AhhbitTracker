# stx-utils

Lightweight, zero-dependency utilities for Stacks (STX) dApp development.

## Install

```bash
npm install stx-utils
```

## Features

| Module | Description |
|---|---|
| **Formatting** | Convert between STX and microSTX, display with units |
| **Address** | Validate, shorten, and parse Stacks principals |
| **Blocks** | Estimate durations from block counts, "time ago" helpers |
| **Validation** | Validate names, stake amounts, and principals |
| **Errors** | Decode Clarity error codes into human-readable messages |
| **Time** | Format dates and relative timestamps |
| **Explorer** | Build Hiro explorer URLs for txs, addresses, contracts |

## Usage

```ts
import {
  formatSTX,
  toMicroSTX,
  shortenAddress,
  isValidAddress,
  blocksToTime,
  blocksAgo,
  validateStake,
  decodeError,
  txUrl,
} from 'stx-utils';

// STX formatting
formatSTX(1_500_000);        // "1.50"
formatSTX(1_500_000, 4);     // "1.5000"
toMicroSTX(2.5);             // 2_500_000

// Address utilities
shortenAddress('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193');
// "SP1M46...G193"

isValidAddress('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193'); // true
isValidAddress('not-valid');  // false

// Block time
blocksToTime(144);           // "1 day"
blocksAgo(1000, 994);        // "~1h ago"

// Validation
validateStake(0.5);          // null (valid)
validateStake(0.01);         // "Minimum stake is 0.1 STX"

// Error decoding
decodeError(105);            // "Already checked in today"
decodeError(999);            // "Unknown error (u999)"

// Explorer URLs
txUrl('0xabc123');
// "https://explorer.hiro.so/txid/0xabc123?chain=mainnet"
```

## API Reference

### Formatting

- `formatSTX(microSTX, decimals?)` — Convert microSTX to display string
- `toMicroSTX(stx)` — Convert STX to microSTX (floored)
- `toSTX(microSTX)` — Convert microSTX to numeric STX
- `formatSTXWithUnit(microSTX)` — Format with automatic unit suffix

### Address

- `isValidAddress(address)` — Check standard principal validity
- `isContractPrincipal(address)` — Check contract principal validity
- `getAddressNetwork(address)` — Returns `"mainnet"`, `"testnet"`, or `null`
- `shortenAddress(address, startChars?, endChars?)` — Truncate for display
- `parseContractPrincipal(principal)` — Extract `[address, name]` tuple

### Blocks

- `blocksToTime(blocks)` — Human-readable duration from block count
- `blocksToSeconds(blocks)` — Convert blocks to seconds
- `secondsToBlocks(seconds)` — Convert seconds to blocks
- `blocksAgo(currentBlock, targetBlock)` — Relative block time
- `estimateBlockDate(targetBlock, currentBlock, now?)` — Estimated Date

### Validation

- `validateName(name, maxLength?)` — Validate a Clarity string input
- `validateStake(stx, minMicroSTX?)` — Validate stake amount
- `validatePrincipal(principal)` — Validate standard or contract principal

### Errors

- `decodeError(code)` — Look up a Clarity error code
- `registerErrors(errors)` — Add or override error codes
- `getErrorRegistry()` — Get all registered codes

### Time

- `formatDate(timestamp, locale?)` — Format a UNIX timestamp
- `timeAgo(timestamp)` — Relative time string

### Explorer

- `txUrl(txId, network?)` — Transaction explorer link
- `addressUrl(address, network?)` — Address explorer link
- `contractUrl(principal, network?)` — Contract explorer link

## Constants

| Name | Value | Description |
|---|---|---|
| `MICRO_PER_STX` | `1_000_000` | microSTX per STX |
| `SECONDS_PER_BLOCK` | `600` | Estimated seconds per block |
| `BLOCKS_PER_DAY` | `144` | Estimated blocks per day |
| `DEFAULT_MIN_STAKE` | `100_000` | Default minimum stake (microSTX) |
| `DEFAULT_MAX_NAME_LENGTH` | `50` | Default max name length |

## License

MIT
