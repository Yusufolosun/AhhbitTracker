/**
 * Stacks block-time estimation helpers.
 *
 * Stacks produces roughly 1 block every 10 minutes (~144 blocks/day).
 * These helpers convert between block counts and human-readable durations,
 * and compute approximate wall-clock times from block differences.
 */

/** Estimated seconds per Stacks block (~10 minutes). */
export const SECONDS_PER_BLOCK = 600;

/** Estimated blocks produced per day (~144). */
export const BLOCKS_PER_DAY = 144;

/**
 * Convert a block count to an approximate duration string.
 *
 * @param blocks - Number of blocks.
 * @returns Human-readable duration, e.g. `"30 minutes"`, `"2 hours"`, `"3 days"`.
 */
export function blocksToTime(blocks: number): string {
  const minutes = blocks * 10;
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Convert a block count to estimated total seconds.
 */
export function blocksToSeconds(blocks: number): number {
  return blocks * SECONDS_PER_BLOCK;
}

/**
 * Convert a duration in seconds to an approximate block count.
 */
export function secondsToBlocks(seconds: number): number {
  return Math.round(seconds / SECONDS_PER_BLOCK);
}

/**
 * Describe how long ago a block was relative to the current block height.
 *
 * @param currentBlock - The latest known block height.
 * @param targetBlock  - The block height to describe.
 * @returns Human-readable "time ago" string, e.g. `"~30m ago"`, `"~2h ago"`, `"~3d ago"`.
 */
export function blocksAgo(currentBlock: number, targetBlock: number): string {
  if (targetBlock <= 0) return 'Never';
  const diff = currentBlock - targetBlock;
  if (diff < 0) return 'Just now';
  if (diff === 0) return 'This block';

  const minutes = diff * 10;
  if (minutes < 60) return `~${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `~${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `~${days}d ago`;
}

/**
 * Estimate the wall-clock Date for a given block height.
 *
 * @param targetBlock  - The block height to estimate.
 * @param currentBlock - The current block height.
 * @param now          - Current time in ms since epoch (defaults to `Date.now()`).
 * @returns Estimated `Date` object.
 */
export function estimateBlockDate(
  targetBlock: number,
  currentBlock: number,
  now: number = Date.now(),
): Date {
  const diff = targetBlock - currentBlock;
  return new Date(now + diff * SECONDS_PER_BLOCK * 1000);
}
