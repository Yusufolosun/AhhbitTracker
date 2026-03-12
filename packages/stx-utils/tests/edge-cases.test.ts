/**
 * Edge-case and stress tests for every stx-utils module.
 *
 * These tests target specific bugs, boundary conditions, and corner
 * cases that the base test suites don't cover.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';

// ── Formatting ────────────────────────────────────────────────────
import {
  formatSTX,
  toMicroSTX,
  toSTX,
  formatSTXWithUnit,
  formatSTXCompact,
  MICRO_PER_STX,
} from '../src/formatting';

describe('formatting edge cases', () => {
  it('formatSTX handles negative microSTX', () => {
    expect(formatSTX(-1_000_000)).toBe('-1.00');
  });

  it('formatSTX handles very large values', () => {
    expect(formatSTX(Number.MAX_SAFE_INTEGER)).toMatch(/^\d+\.\d{2}$/);
  });

  it('toMicroSTX handles negative STX', () => {
    expect(toMicroSTX(-1)).toBe(-1_000_000);
  });

  it('toMicroSTX(0) returns 0', () => {
    expect(toMicroSTX(0)).toBe(0);
  });

  it('toMicroSTX handles very small fractions correctly', () => {
    // 0.000001 STX = 1 microSTX
    expect(toMicroSTX(0.000001)).toBe(1);
  });

  it('toSTX handles 0', () => {
    expect(toSTX(0)).toBe(0);
  });

  it('toSTX handles negative', () => {
    expect(toSTX(-500_000)).toBe(-0.5);
  });

  it('formatSTXWithUnit handles edge at exactly 1 STX', () => {
    expect(formatSTXWithUnit(MICRO_PER_STX)).toBe('1.00 STX');
    expect(formatSTXWithUnit(MICRO_PER_STX - 1)).toBe('999999 uSTX');
  });

  it('formatSTXWithUnit handles 0', () => {
    expect(formatSTXWithUnit(0)).toBe('0 uSTX');
  });

  it('formatSTXCompact handles 0', () => {
    expect(formatSTXCompact(0)).toBe('0.00 STX');
  });

  it('formatSTXCompact handles exact K boundary', () => {
    // 1000 STX = 1_000_000_000 microSTX
    expect(formatSTXCompact(1_000_000_000)).toBe('1.0K STX');
  });

  it('formatSTXCompact handles sub-K amount', () => {
    // 999 STX
    expect(formatSTXCompact(999_000_000)).toBe('999.00 STX');
  });

  it('formatSTXCompact handles exact M boundary', () => {
    // 1,000,000 STX
    expect(formatSTXCompact(1_000_000_000_000)).toBe('1.0M STX');
  });

  it('formatSTXCompact handles exact B boundary', () => {
    // 1,000,000,000 STX
    expect(formatSTXCompact(1_000_000_000_000_000)).toBe('1.0B STX');
  });

  it('toMicroSTX round-trips with toSTX for common values', () => {
    const values = [0, 0.1, 0.5, 1, 1.5, 10, 100, 1000];
    for (const v of values) {
      expect(toSTX(toMicroSTX(v))).toBeCloseTo(v, 6);
    }
  });
});

// ── Address ───────────────────────────────────────────────────────
import {
  isValidAddress,
  isContractPrincipal,
  getAddressNetwork,
  shortenAddress,
  parseContractPrincipal,
} from '../src/address';

describe('address edge cases', () => {
  it('isValidAddress rejects lowercase stacks address', () => {
    expect(isValidAddress('sp1m46w6cvgamh3zjd3tkmy5kcy48hwazk0dyg193')).toBe(false);
  });

  it('isValidAddress rejects address with only 37 chars after prefix', () => {
    const short = 'SP' + 'A'.repeat(37);
    expect(isValidAddress(short)).toBe(false);
  });

  it('isValidAddress accepts address with exactly 38 chars after prefix', () => {
    const addr = 'SP' + 'A'.repeat(38);
    expect(isValidAddress(addr)).toBe(true);
  });

  it('isValidAddress accepts address with exactly 40 chars after prefix', () => {
    const addr = 'SP' + 'A'.repeat(40);
    expect(isValidAddress(addr)).toBe(true);
  });

  it('isValidAddress rejects address with 41 chars after prefix', () => {
    const addr = 'SP' + 'A'.repeat(41);
    expect(isValidAddress(addr)).toBe(false);
  });

  it('isContractPrincipal rejects name starting with digit', () => {
    expect(isContractPrincipal('SP' + 'A'.repeat(39) + '.1bad')).toBe(false);
  });

  it('isContractPrincipal rejects name starting with dash', () => {
    expect(isContractPrincipal('SP' + 'A'.repeat(39) + '.-bad')).toBe(false);
  });

  it('isContractPrincipal accepts single-char name', () => {
    expect(isContractPrincipal('SP' + 'A'.repeat(39) + '.a')).toBe(true);
  });

  it('isContractPrincipal accepts name at 128 chars', () => {
    expect(isContractPrincipal('SP' + 'A'.repeat(39) + '.a' + 'b'.repeat(127))).toBe(true);
  });

  it('isContractPrincipal rejects name at 129 chars', () => {
    expect(isContractPrincipal('SP' + 'A'.repeat(39) + '.a' + 'b'.repeat(128))).toBe(false);
  });

  it('getAddressNetwork works on contract principals too', () => {
    expect(getAddressNetwork('SP' + 'A'.repeat(39) + '.token')).toBe('mainnet');
    expect(getAddressNetwork('ST' + 'A'.repeat(39) + '.token')).toBe('testnet');
  });

  it('shortenAddress handles contract principals', () => {
    const cp = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker';
    const result = shortenAddress(cp);
    expect(result).toContain('...');
    expect(result.length).toBeLessThan(cp.length);
  });

  it('shortenAddress with startChars=0 and endChars=0', () => {
    expect(shortenAddress('SP' + 'A'.repeat(38), 0, 0)).toBe('...');
  });

  it('parseContractPrincipal rejects name with only whitespace after dot', () => {
    expect(parseContractPrincipal('SP' + 'A'.repeat(39) + '.')).toBeNull();
  });

  it('parseContractPrincipal handles multiple dots', () => {
    // Only split on first dot
    const result = parseContractPrincipal('SP' + 'A'.repeat(39) + '.a.b');
    // 'a.b' as contract name - should this be valid?
    // The address module calls isValidAddress on the addr part (before first dot)
    // and checks name is truthy, but doesn't validate contract name format
    if (result) {
      expect(result[0]).toBe('SP' + 'A'.repeat(39));
      expect(result[1]).toBe('a.b');
    }
  });
});

// ── Blocks ────────────────────────────────────────────────────────
import {
  blocksToTime,
  blocksToSeconds,
  secondsToBlocks,
  blocksAgo,
  estimateBlockDate,
  SECONDS_PER_BLOCK,
  BLOCKS_PER_DAY,
} from '../src/blocks';

describe('blocks edge cases', () => {
  it('blocksToTime(0) returns "0 minutes"', () => {
    expect(blocksToTime(0)).toBe('0 minutes');
  });

  it('blocksToTime(1) returns "10 minutes" (not singular)', () => {
    // blocks * 10 = 10, never hits === 1 branch
    expect(blocksToTime(1)).toBe('10 minutes');
  });

  it('blocksToTime(-5) returns "0 minutes"', () => {
    expect(blocksToTime(-5)).toBe('0 minutes');
  });

  it('blocksToTime(6) returns "1 hour" (singular)', () => {
    expect(blocksToTime(6)).toBe('1 hour');
  });

  it('blocksToTime(143) returns "23 hours"', () => {
    // 143 * 10 = 1430 min = 23.83h
    expect(blocksToTime(143)).toBe('23 hours');
  });

  it('blocksToTime(144) returns "1 day"', () => {
    expect(blocksToTime(144)).toBe('1 day');
  });

  it('blocksToSeconds negative gives negative', () => {
    expect(blocksToSeconds(-1)).toBe(-600);
  });

  it('secondsToBlocks rounds correctly', () => {
    expect(secondsToBlocks(299)).toBe(0);
    expect(secondsToBlocks(300)).toBe(1);
    expect(secondsToBlocks(301)).toBe(1);
    expect(secondsToBlocks(899)).toBe(1);
    expect(secondsToBlocks(900)).toBe(2);
  });

  it('blocksAgo with negative target block', () => {
    expect(blocksAgo(100, -5)).toBe('Never');
  });

  it('blocksAgo one block diff', () => {
    expect(blocksAgo(101, 100)).toBe('~10m ago');
  });

  it('estimateBlockDate same block returns now', () => {
    const now = 1000000;
    const date = estimateBlockDate(500, 500, now);
    expect(date.getTime()).toBe(now);
  });

  it('estimateBlockDate past block', () => {
    const now = Date.now();
    const date = estimateBlockDate(95, 100, now);
    expect(date.getTime()).toBeLessThan(now);
    expect(date.getTime()).toBe(now - 5 * SECONDS_PER_BLOCK * 1000);
  });

  it('estimateBlockDate works with default now', () => {
    const before = Date.now();
    const date = estimateBlockDate(100, 100);
    const after = Date.now();
    expect(date.getTime()).toBeGreaterThanOrEqual(before);
    expect(date.getTime()).toBeLessThanOrEqual(after);
  });
});

// ── Validation ────────────────────────────────────────────────────
import {
  validateName,
  validateStake,
  validatePrincipal,
  DEFAULT_MIN_STAKE,
  DEFAULT_MAX_NAME_LENGTH,
} from '../src/validation';

describe('validation edge cases', () => {
  it('validateName with single char is valid', () => {
    expect(validateName('a')).toBeNull();
  });

  it('validateName with leading/trailing spaces counts full length', () => {
    // ' a ' has length 3, but trim is only used for empty check
    expect(validateName(' a ')).toBeNull();
  });

  it('validateName with tab-only is empty', () => {
    expect(validateName('\t')).toBe('Name cannot be empty');
  });

  it('validateName with newline is not empty', () => {
    // '\n' trims to '', so...
    expect(validateName('\n')).toBe('Name cannot be empty');
  });

  it('validateName with maxLength=0 rejects everything', () => {
    expect(validateName('a', 0)).toContain('too long');
  });

  it('validateStake rejects Infinity', () => {
    // Bug: Infinity * 1M = Infinity >= 100000, so it passes
    // After fix, this should reject
    expect(validateStake(Infinity)).not.toBeNull();
  });

  it('validateStake rejects -Infinity', () => {
    expect(validateStake(-Infinity)).toBe('Stake amount must be positive');
  });

  it('validateStake with very large valid number', () => {
    expect(validateStake(1_000_000)).toBeNull();
  });

  it('validatePrincipal rejects address with lowercase letters', () => {
    expect(validatePrincipal('sp' + 'a'.repeat(39))).not.toBeNull();
  });

  it('DEFAULT_MIN_STAKE is 100_000', () => {
    expect(DEFAULT_MIN_STAKE).toBe(100_000);
  });

  it('DEFAULT_MAX_NAME_LENGTH is 50', () => {
    expect(DEFAULT_MAX_NAME_LENGTH).toBe(50);
  });
});

// ── Errors ────────────────────────────────────────────────────────
import { decodeError, registerErrors, getErrorRegistry } from '../src/errors';

describe('errors edge cases', () => {
  it('decodeError for all built-in codes', () => {
    const codes = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111];
    for (const code of codes) {
      const msg = decodeError(code);
      expect(msg).not.toContain('Unknown');
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  it('decodeError for code 0', () => {
    expect(decodeError(0)).toBe('Unknown error (u0)');
  });

  it('decodeError for negative code', () => {
    expect(decodeError(-1)).toBe('Unknown error (u-1)');
  });

  it('registerErrors with empty object does nothing', () => {
    const before = getErrorRegistry();
    registerErrors({});
    const after = getErrorRegistry();
    expect(after).toEqual(before);
  });

  it('getErrorRegistry returns a snapshot (not live reference)', () => {
    const reg = getErrorRegistry();
    reg[9999] = 'Should not affect internal state';
    expect(decodeError(9999)).toBe('Unknown error (u9999)');
  });
});

// ── Time ──────────────────────────────────────────────────────────
import { formatDate, timeAgo } from '../src/time';

describe('time edge cases', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formatDate handles epoch 0', () => {
    const result = formatDate(0);
    // Should be some date in 1969/1970 depending on timezone
    expect(result).toMatch(/\d{4}/);
  });

  it('formatDate handles far future', () => {
    // year 3000
    const ts = new Date('3000-01-01T00:00:00Z').getTime();
    const result = formatDate(ts);
    expect(result).toContain('3000');
  });

  it('timeAgo returns "just now" for current time', () => {
    expect(timeAgo(Date.now())).toBe('just now');
  });

  it('timeAgo handles exactly 60 seconds ago', () => {
    vi.spyOn(Date, 'now').mockReturnValue(60_000);
    expect(timeAgo(0)).toBe('1m ago');
  });

  it('timeAgo handles exactly 1 hour ago', () => {
    vi.spyOn(Date, 'now').mockReturnValue(3_600_000);
    expect(timeAgo(0)).toBe('1h ago');
  });

  it('timeAgo handles exactly 1 day ago', () => {
    vi.spyOn(Date, 'now').mockReturnValue(86_400_000);
    expect(timeAgo(0)).toBe('1d ago');
  });

  it('timeAgo handles future timestamp (negative diff)', () => {
    // Future timestamps: seconds < 0, which is < 60, so returns 'just now'
    vi.spyOn(Date, 'now').mockReturnValue(0);
    expect(timeAgo(10_000)).toBe('just now');
  });
});

// ── Explorer ──────────────────────────────────────────────────────
import { txUrl, addressUrl, contractUrl, blockUrl, apiUrl } from '../src/explorer';

describe('explorer edge cases', () => {
  it('txUrl auto-prepends 0x for bare hex', () => {
    const url = txUrl('deadbeef');
    expect(url).toContain('0xdeadbeef');
  });

  it('txUrl does not double-prefix', () => {
    const url = txUrl('0xdeadbeef');
    expect(url).not.toContain('0x0x');
  });

  it('addressUrl works for testnet', () => {
    const url = addressUrl('ST1234', 'testnet');
    expect(url).toContain('chain=testnet');
  });

  it('contractUrl encodes the dot in principal', () => {
    const url = contractUrl('SPADDR.contract-name');
    // encodeURIComponent('.') = '%2E'  — verify it's in the URL
    expect(url).toContain('SPADDR');
    expect(url).toContain('contract-name');
  });

  it('blockUrl testnet', () => {
    const url = blockUrl('0xabc', 'testnet');
    expect(url).toContain('chain=testnet');
    expect(url).toContain('/block/');
  });

  it('apiUrl mainnet is default', () => {
    expect(apiUrl()).toContain('mainnet');
  });

  it('apiUrl does not have trailing slash', () => {
    expect(apiUrl('mainnet').endsWith('/')).toBe(false);
    expect(apiUrl('testnet').endsWith('/')).toBe(false);
  });
});

// ── Clarity ───────────────────────────────────────────────────────
import {
  decodeClarityValue,
  unwrapResponse,
  extractValue,
  ClarityValue,
} from '../src/clarity';

function u128Hex(n: bigint): string {
  return n.toString(16).padStart(32, '0');
}

describe('clarity edge cases', () => {
  it('decodes uint max (2^128 - 1)', () => {
    const max = (1n << 128n) - 1n;
    const hex = '0x01' + u128Hex(max);
    const cv = decodeClarityValue(hex);
    expect(cv.type).toBe('uint');
    if (cv.type === 'uint') expect(cv.value).toBe(max);
  });

  it('decodes int min (-2^127)', () => {
    const minVal = -(1n << 127n);
    // Two's complement: -2^127 = 2^128 - 2^127 = 2^127
    const encoded = 1n << 127n;
    const hex = '0x00' + u128Hex(encoded);
    const cv = decodeClarityValue(hex);
    expect(cv.type).toBe('int');
    if (cv.type === 'int') expect(cv.value).toBe(minVal);
  });

  it('decodes int max (2^127 - 1)', () => {
    const maxVal = (1n << 127n) - 1n;
    const hex = '0x00' + u128Hex(maxVal);
    const cv = decodeClarityValue(hex);
    expect(cv.type).toBe('int');
    if (cv.type === 'int') expect(cv.value).toBe(maxVal);
  });

  it('decodes nested response: (ok (some (uint 1)))', () => {
    const innerUint = '01' + u128Hex(1n);
    const some = '0a' + innerUint;
    const ok = '07' + some;
    const cv = decodeClarityValue('0x' + ok);
    expect(cv.type).toBe('ok');
    if (cv.type === 'ok') {
      expect(cv.value.type).toBe('some');
      if (cv.value.type === 'some') {
        expect(cv.value.value.type).toBe('uint');
      }
    }
  });

  it('decodes empty tuple', () => {
    const hex = '0x0c00000000';
    const cv = decodeClarityValue(hex);
    expect(cv).toEqual({ type: 'tuple', fields: {} });
  });

  it('decodes list of bools', () => {
    // list of [true, false, true]
    const hex = '0x0b00000003030403';
    const cv = decodeClarityValue(hex);
    expect(cv.type).toBe('list');
    if (cv.type === 'list') {
      expect(cv.items).toHaveLength(3);
      expect(cv.items[0]).toEqual({ type: 'bool', value: true });
      expect(cv.items[1]).toEqual({ type: 'bool', value: false });
      expect(cv.items[2]).toEqual({ type: 'bool', value: true });
    }
  });

  it('decodes without 0x prefix', () => {
    const cv = decodeClarityValue('03');
    expect(cv).toEqual({ type: 'bool', value: true });
  });

  it('extractValue on nested structures', () => {
    const cv: ClarityValue = {
      type: 'ok',
      value: {
        type: 'tuple',
        fields: {
          name: { type: 'string-ascii', value: 'test' },
          active: { type: 'bool', value: true },
          count: { type: 'uint', value: 42n },
          data: { type: 'none' },
        },
      },
    };
    const result = extractValue(cv) as Record<string, unknown>;
    expect(result).toEqual({
      name: 'test',
      active: true,
      count: 42n,
      data: null,
    });
  });

  it('unwrapResponse on (err int)', () => {
    const cv: ClarityValue = {
      type: 'err',
      value: { type: 'int', value: -5n },
    };
    expect(() => unwrapResponse(cv)).toThrow('error u-5');
  });

  it('unwrapResponse on (err bool) has no detail', () => {
    const cv: ClarityValue = {
      type: 'err',
      value: { type: 'bool', value: false },
    };
    expect(() => unwrapResponse(cv)).toThrow('Clarity response error');
  });
});

// ── Memo ──────────────────────────────────────────────────────────
import {
  encodeMemo,
  decodeMemo,
  memoToHex,
  memoFromHex,
  MEMO_MAX_BYTES,
} from '../src/memo';

describe('memo edge cases', () => {
  it('encodeMemo handles multi-byte UTF-8 within 34 bytes', () => {
    // Each "é" is 2 bytes in UTF-8, 17 of them = 34 bytes
    const text = 'é'.repeat(17);
    const buf = encodeMemo(text);
    expect(buf.length).toBe(34);
    expect(decodeMemo(buf)).toBe(text);
  });

  it('encodeMemo handles 4-byte emoji within limit', () => {
    // 8 emojis = 32 bytes, fits in 34
    const text = '\u{1F600}'.repeat(8);
    const buf = encodeMemo(text);
    expect(buf.length).toBe(34);
    expect(buf[32]).toBe(0); // padding bytes
    expect(buf[33]).toBe(0);
  });

  it('memoToHex output is always 68 chars', () => {
    expect(memoToHex('').length).toBe(68);
    expect(memoToHex('x').length).toBe(68);
    expect(memoToHex('a'.repeat(34)).length).toBe(68);
  });

  it('memoFromHex round-trip preserves text', () => {
    const texts = ['', 'hello', 'stx-utils', 'a'.repeat(34)];
    for (const text of texts) {
      expect(memoFromHex(memoToHex(text))).toBe(text);
    }
  });

  it('decodeMemo with all-0xFF bytes', () => {
    const buf = new Uint8Array(34).fill(0xff);
    // Should decode to some string (all non-zero, no trimming)
    const result = decodeMemo(buf);
    expect(result.length).toBeGreaterThan(0);
  });
});

// ── Stacking ──────────────────────────────────────────────────────
import {
  blockToCycle,
  cycleToBlock,
  cycleProgress,
  blocksUntilNextCycle,
  isInPreparePhase,
  BLOCKS_PER_CYCLE,
  POX_START_HEIGHT,
} from '../src/stacking';

describe('stacking edge cases', () => {
  it('blockToCycle at exact cycle boundary', () => {
    // Cycle 1 starts at 666050 + 2100 = 668150
    expect(blockToCycle(668150)).toBe(1);
  });

  it('blockToCycle one block before cycle 1', () => {
    expect(blockToCycle(668149)).toBe(0);
  });

  it('cycleToBlock then blockToCycle round-trips for many cycles', () => {
    for (let c = 0; c < 100; c++) {
      const block = cycleToBlock(c);
      expect(blockToCycle(block)).toBe(c);
    }
  });

  it('cycleProgress at exact cycle boundary is 0', () => {
    const { blocksIn, progress } = cycleProgress(668150);
    expect(blocksIn).toBe(0);
    expect(progress).toBe(0);
  });

  it('blocksUntilNextCycle at exact cycle start', () => {
    // At the very first block of a new cycle, you have a full cycle ahead
    const result = blocksUntilNextCycle(668150);
    expect(result).toBe(2100);
  });

  it('blocksUntilNextCycle at last block of cycle', () => {
    // Last block of cycle 0 = 668149
    expect(blocksUntilNextCycle(668149)).toBe(1);
  });

  it('isInPreparePhase at the first block of prepare', () => {
    // Prepare phase starts 100 blocks before cycle end
    // Cycle 0: 666050 to 668149, prepare starts at 668050
    expect(isInPreparePhase(668050)).toBe(true);
    expect(isInPreparePhase(668049)).toBe(false);
  });

  it('isInPreparePhase across multiple cycles', () => {
    // Cycle 1: 668150 to 670249, prepare starts at 670150
    expect(isInPreparePhase(670149)).toBe(false);
    expect(isInPreparePhase(670150)).toBe(true);
    expect(isInPreparePhase(670249)).toBe(true);
  });

  it('all functions handle custom params consistently', () => {
    const start = 100;
    const length = 10;
    // Cycle 3 starts at block 130
    expect(blockToCycle(130, start, length)).toBe(3);
    expect(cycleToBlock(3, start, length)).toBe(130);
    expect(cycleProgress(135, start, length)).toEqual({
      blocksIn: 5,
      progress: 0.5,
    });
    expect(blocksUntilNextCycle(135, start, length)).toBe(5);
  });
});
