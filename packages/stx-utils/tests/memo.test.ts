import { describe, it, expect } from 'vitest';
import {
  MEMO_MAX_BYTES,
  encodeMemo,
  decodeMemo,
  memoToHex,
  memoFromHex,
} from '../src/memo';

describe('MEMO_MAX_BYTES', () => {
  it('is 34', () => {
    expect(MEMO_MAX_BYTES).toBe(34);
  });
});

describe('encodeMemo', () => {
  it('encodes a short string to 34 bytes', () => {
    const buf = encodeMemo('hello');
    expect(buf.length).toBe(34);
    expect(buf[0]).toBe(0x68); // 'h'
    expect(buf[4]).toBe(0x6f); // 'o'
    expect(buf[5]).toBe(0x00); // padding
    expect(buf[33]).toBe(0x00); // padding
  });

  it('encodes an empty string', () => {
    const buf = encodeMemo('');
    expect(buf.length).toBe(34);
    expect(buf.every((b) => b === 0)).toBe(true);
  });

  it('fills exactly 34 bytes without error', () => {
    const text = 'a'.repeat(34);
    const buf = encodeMemo(text);
    expect(buf.length).toBe(34);
    expect(buf[33]).toBe(0x61); // 'a'
  });

  it('throws when text exceeds 34 bytes', () => {
    const text = 'a'.repeat(35);
    expect(() => encodeMemo(text)).toThrow('exceeds 34 bytes');
  });

  it('throws for multi-byte UTF-8 that exceeds limit', () => {
    // Each emoji is 4 bytes UTF-8, so 9 of them = 36 bytes > 34
    const text = '\u{1F600}'.repeat(9);
    expect(() => encodeMemo(text)).toThrow('exceeds 34 bytes');
  });
});

describe('decodeMemo', () => {
  it('decodes a padded buffer to a string', () => {
    const buf = new Uint8Array(34);
    buf[0] = 0x68; // h
    buf[1] = 0x69; // i
    expect(decodeMemo(buf)).toBe('hi');
  });

  it('returns empty string for all-zero buffer', () => {
    expect(decodeMemo(new Uint8Array(34))).toBe('');
  });

  it('throws for wrong buffer size', () => {
    expect(() => decodeMemo(new Uint8Array(10))).toThrow('must be 34 bytes');
  });
});

describe('memoToHex', () => {
  it('produces a 68-char hex string', () => {
    const hex = memoToHex('hi');
    expect(hex.length).toBe(68);
    expect(hex.startsWith('6869')).toBe(true);
    expect(hex.endsWith('00')).toBe(true);
  });

  it('round-trips with memoFromHex', () => {
    const text = 'stx-utils test memo';
    expect(memoFromHex(memoToHex(text))).toBe(text);
  });
});

describe('memoFromHex', () => {
  it('decodes a hex memo string', () => {
    // "hi" = 0x6869 + 32 zero bytes
    const hex = '6869' + '00'.repeat(32);
    expect(memoFromHex(hex)).toBe('hi');
  });

  it('handles 0x prefix', () => {
    const hex = '0x' + '6869' + '00'.repeat(32);
    expect(memoFromHex(hex)).toBe('hi');
  });

  it('throws for wrong hex length', () => {
    expect(() => memoFromHex('aabb')).toThrow('must be 68 characters');
  });
});
