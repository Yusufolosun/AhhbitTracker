/**
 * stx-utils — Lightweight utilities for Stacks / STX dApp development.
 *
 * @packageDocumentation
 */

// STX formatting & conversion
export {
  MICRO_PER_STX,
  formatSTX,
  toMicroSTX,
  toSTX,
  formatSTXWithUnit,
  formatSTXCompact,
} from './formatting';

// Address utilities
export {
  isValidAddress,
  isContractPrincipal,
  getAddressNetwork,
  shortenAddress,
  parseContractPrincipal,
} from './address';

// Block-time helpers
export {
  SECONDS_PER_BLOCK,
  BLOCKS_PER_DAY,
  blocksToTime,
  blocksToSeconds,
  secondsToBlocks,
  blocksAgo,
  estimateBlockDate,
} from './blocks';

// Validation
export {
  DEFAULT_MIN_STAKE,
  DEFAULT_MAX_NAME_LENGTH,
  validateName,
  validateStake,
  validatePrincipal,
} from './validation';

// Clarity error codes
export { decodeError, registerErrors, getErrorRegistry } from './errors';

// Time formatting
export { formatDate, timeAgo } from './time';

// Explorer URLs
export type { Network } from './explorer';
export { txUrl, addressUrl, contractUrl, blockUrl, apiUrl } from './explorer';

// Clarity value decoder
export { decodeClarityValue, unwrapResponse, extractValue } from './clarity';
export type { ClarityValue } from './clarity';

// Memo encoder/decoder
export {
  MEMO_MAX_BYTES,
  encodeMemo,
  decodeMemo,
  memoToHex,
  memoFromHex,
} from './memo';

// PoX stacking helpers
export {
  BLOCKS_PER_CYCLE,
  POX_START_HEIGHT,
  blockToCycle,
  cycleToBlock,
  cycleProgress,
  blocksUntilNextCycle,
  isInPreparePhase,
} from './stacking';
