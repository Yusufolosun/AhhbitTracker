/**
 * Formatting utilities for the AhhbitTracker frontend.
 * 
 * Re-exports formatting utilities from the stx-utils package.
 * This file preserves backward compatibility for existing imports
 * while centralizing all formatting logic.
 * 
 * @module utils/formatting
 */
export {
  /** Format microSTX to human-readable STX string (e.g., "1.5 STX") */
  formatSTX,
  /** Convert STX to microSTX */
  toMicroSTX,
  /** Convert microSTX to STX */
  toSTX,
  /** Format microSTX with STX unit suffix */
  formatSTXWithUnit,
  /** Shorten a Stacks address for display (e.g., "SP1N...MP8Z") */
  shortenAddress,
  /** Convert block count to human-readable time string */
  blocksToTime,
  /** Convert blocks to human-readable "ago" format */
  blocksAgo,
  /** Format a Date to locale string */
  formatDate,
  /** Convert Date to human-readable "ago" format */
  timeAgo,
  /** Generate Hiro Explorer URL for a transaction */
  txUrl,
  /** Generate Hiro Explorer URL for an address */
  addressUrl,
  /** Generate Hiro Explorer URL for a contract */
  contractUrl,
} from '@yusufolosun/stx-utils';
