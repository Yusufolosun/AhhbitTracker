import { describe, it, expect } from 'vitest';
import { formatSTX, toMicroSTX, shortenAddress, blocksToTime } from '../utils/formatting';

describe('formatSTX', () => {
  it('converts microSTX to STX string with 2 decimals', () => {
    expect(formatSTX(1000000)).toBe('1.00');
  });

  it('handles zero', () => {
    expect(formatSTX(0)).toBe('0.00');
  });

  it('rounds correctly', () => {
    expect(formatSTX(100000)).toBe('0.10');
    expect(formatSTX(1500000)).toBe('1.50');
  });

  it('handles fractional microSTX', () => {
    expect(formatSTX(123456)).toBe('0.12');
  });
});

describe('toMicroSTX', () => {
  it('converts 1 STX to 1000000 microSTX', () => {
    expect(toMicroSTX(1)).toBe(1000000);
  });

  it('floors the result', () => {
    expect(toMicroSTX(0.0000001)).toBe(0);
  });

  it('handles decimal STX', () => {
    expect(toMicroSTX(0.1)).toBe(100000);
  });
});

describe('shortenAddress', () => {
  it('shortens a standard Stacks address', () => {
    const addr = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
    expect(shortenAddress(addr)).toBe('SP1M46...G193');
  });

  it('returns empty string for falsy input', () => {
    expect(shortenAddress('')).toBe('');
  });
});

describe('blocksToTime', () => {
  it('returns minutes for small block counts', () => {
    expect(blocksToTime(3)).toBe('30 minutes');
  });

  it('returns hours for moderate block counts', () => {
    expect(blocksToTime(12)).toBe('2 hours');
  });

  it('returns days for large block counts', () => {
    expect(blocksToTime(144)).toBe('1 days');
  });
});
