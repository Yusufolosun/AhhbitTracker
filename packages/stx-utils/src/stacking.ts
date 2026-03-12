/**
 * Proof-of-Transfer (PoX) cycle helpers.
 *
 * Stacks uses PoX consensus where STX holders lock tokens for reward
 * cycles.  Each cycle is a fixed number of Bitcoin blocks.  This module
 * provides helpers to calculate cycle numbers, boundaries, and progress
 * from block heights.
 *
 * Constants are based on the Stacks mainnet PoX-4 parameters.
 */

/** Number of Bitcoin blocks per PoX reward cycle (mainnet). */
export const BLOCKS_PER_CYCLE = 2100;

/**
 * Bitcoin block height at which PoX rewards started (mainnet).
 * This is the `first-burnchain-block-height` in pox-4.
 */
export const POX_START_HEIGHT = 666050;

/**
 * Calculate the PoX reward cycle number for a given Bitcoin block height.
 *
 * @param burnBlockHeight - The Bitcoin (burn-chain) block height.
 * @param startHeight     - PoX start height (default: mainnet).
 * @param cycleLength     - Blocks per cycle (default: mainnet 2100).
 * @returns The reward cycle number (0-indexed).
 */
export function blockToCycle(
  burnBlockHeight: number,
  startHeight: number = POX_START_HEIGHT,
  cycleLength: number = BLOCKS_PER_CYCLE,
): number {
  if (burnBlockHeight < startHeight) return 0;
  return Math.floor((burnBlockHeight - startHeight) / cycleLength);
}

/**
 * Get the first Bitcoin block height of a given PoX cycle.
 *
 * @param cycle       - The reward cycle number.
 * @param startHeight - PoX start height (default: mainnet).
 * @param cycleLength - Blocks per cycle (default: mainnet 2100).
 * @returns The first burn-chain block height of the cycle.
 */
export function cycleToBlock(
  cycle: number,
  startHeight: number = POX_START_HEIGHT,
  cycleLength: number = BLOCKS_PER_CYCLE,
): number {
  return startHeight + cycle * cycleLength;
}

/**
 * Calculate how far into the current PoX cycle a block height is.
 *
 * @param burnBlockHeight - The Bitcoin block height.
 * @param startHeight     - PoX start height (default: mainnet).
 * @param cycleLength     - Blocks per cycle (default: mainnet 2100).
 * @returns An object with `blocksIn` (position within cycle) and
 *          `progress` (0–1 fraction).
 */
export function cycleProgress(
  burnBlockHeight: number,
  startHeight: number = POX_START_HEIGHT,
  cycleLength: number = BLOCKS_PER_CYCLE,
): { blocksIn: number; progress: number } {
  if (burnBlockHeight < startHeight) {
    return { blocksIn: 0, progress: 0 };
  }
  const blocksIn = (burnBlockHeight - startHeight) % cycleLength;
  return { blocksIn, progress: blocksIn / cycleLength };
}

/**
 * Estimate how many Bitcoin blocks remain in the current PoX cycle.
 *
 * @param burnBlockHeight - The current Bitcoin block height.
 * @param startHeight     - PoX start height (default: mainnet).
 * @param cycleLength     - Blocks per cycle (default: mainnet 2100).
 * @returns Number of blocks remaining until the next cycle.
 */
export function blocksUntilNextCycle(
  burnBlockHeight: number,
  startHeight: number = POX_START_HEIGHT,
  cycleLength: number = BLOCKS_PER_CYCLE,
): number {
  if (burnBlockHeight < startHeight) {
    return startHeight - burnBlockHeight;
  }
  const blocksIn = (burnBlockHeight - startHeight) % cycleLength;
  return cycleLength - blocksIn;
}

/**
 * Determine whether a given burn block height falls within the
 * "prepare phase" of a PoX cycle.
 *
 * The prepare phase is the last 100 blocks of each cycle, during
 * which stacking commitments for the next cycle are finalised.
 *
 * @param burnBlockHeight - The Bitcoin block height.
 * @param startHeight     - PoX start height (default: mainnet).
 * @param cycleLength     - Blocks per cycle (default: mainnet 2100).
 * @param prepareLength   - Prepare phase length in blocks (default: 100).
 * @returns `true` if the height is in the prepare phase.
 */
export function isInPreparePhase(
  burnBlockHeight: number,
  startHeight: number = POX_START_HEIGHT,
  cycleLength: number = BLOCKS_PER_CYCLE,
  prepareLength: number = 100,
): boolean {
  if (burnBlockHeight < startHeight) return false;
  const blocksIn = (burnBlockHeight - startHeight) % cycleLength;
  return blocksIn >= cycleLength - prepareLength;
}
