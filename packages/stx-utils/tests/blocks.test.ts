import { describe, it, expect } from 'vitest';
import {
  blocksToTime,
  blocksToSeconds,
  secondsToBlocks,
  blocksAgo,
  estimateBlockDate,
  SECONDS_PER_BLOCK,
  BLOCKS_PER_DAY,
} from '../src/blocks';

describe('constants', () => {
  it('SECONDS_PER_BLOCK is 600', () => {
    expect(SECONDS_PER_BLOCK).toBe(600);
  });

  it('BLOCKS_PER_DAY is 144', () => {
    expect(BLOCKS_PER_DAY).toBe(144);
  });
});

describe('blocksToTime', () => {
  it('returns minutes for small block counts', () => {
    expect(blocksToTime(3)).toBe('30 minutes');
  });

  it('returns singular hour', () => {
    expect(blocksToTime(6)).toBe('1 hour');
  });

  it('returns plural hours', () => {
    expect(blocksToTime(12)).toBe('2 hours');
  });

  it('returns singular day', () => {
    expect(blocksToTime(144)).toBe('1 day');
  });

  it('returns plural days for large counts', () => {
    expect(blocksToTime(432)).toBe('3 days');
  });
});

describe('blocksToSeconds / secondsToBlocks', () => {
  it('round-trips', () => {
    expect(blocksToSeconds(10)).toBe(6000);
    expect(secondsToBlocks(6000)).toBe(10);
  });
});

describe('blocksAgo', () => {
  it('handles zero target', () => {
    expect(blocksAgo(100, 0)).toBe('Never');
  });

  it('handles future block', () => {
    expect(blocksAgo(100, 200)).toBe('Just now');
  });

  it('handles same block', () => {
    expect(blocksAgo(100, 100)).toBe('This block');
  });

  it('shows minutes', () => {
    expect(blocksAgo(105, 100)).toBe('~50m ago');
  });

  it('shows hours', () => {
    expect(blocksAgo(118, 100)).toBe('~3h ago');
  });

  it('shows yesterday', () => {
    expect(blocksAgo(244, 100)).toBe('Yesterday');
  });

  it('shows days', () => {
    expect(blocksAgo(400, 100)).toBe('~2d ago');
  });
});

describe('estimateBlockDate', () => {
  it('returns future date for higher target', () => {
    const now = Date.now();
    const date = estimateBlockDate(110, 100, now);
    expect(date.getTime()).toBe(now + 10 * SECONDS_PER_BLOCK * 1000);
  });

  it('returns past date for lower target', () => {
    const now = Date.now();
    const date = estimateBlockDate(90, 100, now);
    expect(date.getTime()).toBe(now - 10 * SECONDS_PER_BLOCK * 1000);
  });
});
