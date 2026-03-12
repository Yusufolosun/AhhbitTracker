import { describe, it, expect } from 'vitest';
import {
  BLOCKS_PER_CYCLE,
  POX_START_HEIGHT,
  blockToCycle,
  cycleToBlock,
  cycleProgress,
  blocksUntilNextCycle,
  isInPreparePhase,
} from '../src/stacking';

describe('constants', () => {
  it('BLOCKS_PER_CYCLE is 2100', () => {
    expect(BLOCKS_PER_CYCLE).toBe(2100);
  });

  it('POX_START_HEIGHT is 666050', () => {
    expect(POX_START_HEIGHT).toBe(666050);
  });
});

describe('blockToCycle', () => {
  it('returns 0 for blocks before PoX start', () => {
    expect(blockToCycle(600000)).toBe(0);
  });

  it('returns 0 for the first block of cycle 0', () => {
    expect(blockToCycle(666050)).toBe(0);
  });

  it('returns 0 for the last block of cycle 0', () => {
    expect(blockToCycle(666050 + 2099)).toBe(0);
  });

  it('returns 1 for the first block of cycle 1', () => {
    expect(blockToCycle(666050 + 2100)).toBe(1);
  });

  it('calculates a high cycle correctly', () => {
    // cycle 10 starts at 666050 + 21000
    expect(blockToCycle(666050 + 21000)).toBe(10);
    expect(blockToCycle(666050 + 21000 + 500)).toBe(10);
  });

  it('supports custom start height and cycle length', () => {
    expect(blockToCycle(110, 100, 10)).toBe(1);
    expect(blockToCycle(119, 100, 10)).toBe(1);
    expect(blockToCycle(120, 100, 10)).toBe(2);
  });
});

describe('cycleToBlock', () => {
  it('returns start height for cycle 0', () => {
    expect(cycleToBlock(0)).toBe(666050);
  });

  it('returns correct block for cycle 1', () => {
    expect(cycleToBlock(1)).toBe(666050 + 2100);
  });

  it('round-trips with blockToCycle', () => {
    const cycle = 42;
    const block = cycleToBlock(cycle);
    expect(blockToCycle(block)).toBe(cycle);
  });

  it('supports custom parameters', () => {
    expect(cycleToBlock(5, 100, 10)).toBe(150);
  });
});

describe('cycleProgress', () => {
  it('returns 0 progress for blocks before PoX start', () => {
    const result = cycleProgress(600000);
    expect(result.blocksIn).toBe(0);
    expect(result.progress).toBe(0);
  });

  it('returns 0 progress at cycle start', () => {
    const result = cycleProgress(666050);
    expect(result.blocksIn).toBe(0);
    expect(result.progress).toBe(0);
  });

  it('returns correct mid-cycle progress', () => {
    const result = cycleProgress(666050 + 1050);
    expect(result.blocksIn).toBe(1050);
    expect(result.progress).toBe(0.5);
  });

  it('returns near-100% at end of cycle', () => {
    const result = cycleProgress(666050 + 2099);
    expect(result.blocksIn).toBe(2099);
    expect(result.progress).toBeCloseTo(2099 / 2100, 5);
  });
});

describe('blocksUntilNextCycle', () => {
  it('counts from before PoX start', () => {
    expect(blocksUntilNextCycle(666000)).toBe(50);
  });

  it('returns full cycle at cycle start', () => {
    expect(blocksUntilNextCycle(666050)).toBe(2100);
  });

  it('returns 1 at last block of a cycle', () => {
    expect(blocksUntilNextCycle(666050 + 2099)).toBe(1);
  });

  it('returns correct mid-cycle value', () => {
    expect(blocksUntilNextCycle(666050 + 1000)).toBe(1100);
  });
});

describe('isInPreparePhase', () => {
  it('returns false before PoX start', () => {
    expect(isInPreparePhase(600000)).toBe(false);
  });

  it('returns false at cycle start', () => {
    expect(isInPreparePhase(666050)).toBe(false);
  });

  it('returns false just before prepare phase', () => {
    // Prepare starts at block 2000 within a cycle (2100 - 100)
    expect(isInPreparePhase(666050 + 1999)).toBe(false);
  });

  it('returns true at start of prepare phase', () => {
    expect(isInPreparePhase(666050 + 2000)).toBe(true);
  });

  it('returns true at last block of cycle (in prepare)', () => {
    expect(isInPreparePhase(666050 + 2099)).toBe(true);
  });

  it('supports custom prepare length', () => {
    // With 200-block prepare phase, prepare starts at 1900
    expect(isInPreparePhase(666050 + 1899, POX_START_HEIGHT, BLOCKS_PER_CYCLE, 200)).toBe(false);
    expect(isInPreparePhase(666050 + 1900, POX_START_HEIGHT, BLOCKS_PER_CYCLE, 200)).toBe(true);
  });
});
