# Changelog

All notable changes to `@yusufolosun/stx-utils` will be documented in this file.

## [2.0.0] — 2026-03-12

### Added

- **Clarity module** — `decodeClarityValue`, `unwrapResponse`, `extractValue` for decoding hex-encoded Clarity values (SIP-005). Supports int, uint, bool, buffer, string, optional, response, list, tuple, and principal types.
- **Memo module** — `encodeMemo`, `decodeMemo`, `memoToHex`, `memoFromHex` for encoding/decoding 34-byte STX transfer memos with UTF-8 support.
- **Stacking module** — `blockToCycle`, `cycleToBlock`, `cycleProgress`, `blocksUntilNextCycle`, `isInPreparePhase` for PoX reward cycle calculations. All functions accept custom start height and cycle length parameters.
- `formatSTXCompact(microSTX)` — compact formatting with K/M/B suffixes for large amounts.
- `blockUrl(blockHash, network?)` — explorer URL for blocks.
- `apiUrl(network?)` — Stacks node API base URL for mainnet/testnet.
- `txUrl` now auto-prepends `0x` prefix for bare hex transaction IDs.
- 97 new edge-case tests covering boundary conditions across all modules.

### Fixed

- `validateStake(Infinity)` no longer returns `null` (valid). Uses `Number.isFinite()` to reject `Infinity` and `-Infinity`.
- `shortenAddress(addr, 0, 0)` now correctly returns `"..."` instead of the full address. Added explicit handling for zero `endChars`.
- `blocksToTime(-5)` now returns `"0 minutes"` instead of `"-50 minutes"`. Negative block counts are clamped to zero.

### Changed

- **BREAKING**: Package version bumped from 1.1.0 to 2.0.0 due to new modules and API surface changes.

## [1.1.0] — 2026-03-05

### Added

- Initial public release with 7 modules: formatting, address, blocks, validation, errors, time, explorer.
- Dual ESM/CJS build with TypeScript declarations.
- 162 tests across 7 test files.
