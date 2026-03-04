import { describe, it, expect } from 'vitest';
import {
  isValidAddress,
  isContractPrincipal,
  getAddressNetwork,
  shortenAddress,
  parseContractPrincipal,
} from '../src/address';

const MAINNET_ADDR = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
const TESTNET_ADDR = 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5';
const CONTRACT = `${MAINNET_ADDR}.habit-tracker`;

describe('isValidAddress', () => {
  it('accepts valid mainnet address', () => {
    expect(isValidAddress(MAINNET_ADDR)).toBe(true);
  });

  it('accepts valid testnet address', () => {
    expect(isValidAddress(TESTNET_ADDR)).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidAddress('')).toBe(false);
  });

  it('rejects contract principal', () => {
    expect(isValidAddress(CONTRACT)).toBe(false);
  });

  it('rejects random string', () => {
    expect(isValidAddress('not-an-address')).toBe(false);
  });
});

describe('isContractPrincipal', () => {
  it('accepts valid contract principal', () => {
    expect(isContractPrincipal(CONTRACT)).toBe(true);
  });

  it('rejects standard principal', () => {
    expect(isContractPrincipal(MAINNET_ADDR)).toBe(false);
  });

  it('rejects empty', () => {
    expect(isContractPrincipal('')).toBe(false);
  });
});

describe('getAddressNetwork', () => {
  it('identifies mainnet', () => {
    expect(getAddressNetwork(MAINNET_ADDR)).toBe('mainnet');
  });

  it('identifies testnet', () => {
    expect(getAddressNetwork(TESTNET_ADDR)).toBe('testnet');
  });

  it('returns null for unknown', () => {
    expect(getAddressNetwork('0x1234')).toBeNull();
    expect(getAddressNetwork('')).toBeNull();
  });
});

describe('shortenAddress', () => {
  it('shortens a standard Stacks address', () => {
    expect(shortenAddress(MAINNET_ADDR)).toBe('SP1M46...G193');
  });

  it('returns empty string for falsy input', () => {
    expect(shortenAddress('')).toBe('');
  });

  it('preserves short strings', () => {
    expect(shortenAddress('SPABCDE')).toBe('SPABCDE');
  });

  it('supports custom slice sizes', () => {
    expect(shortenAddress(MAINNET_ADDR, 4, 3)).toBe('SP1M...193');
  });
});

describe('parseContractPrincipal', () => {
  it('parses valid contract principal', () => {
    const result = parseContractPrincipal(CONTRACT);
    expect(result).toEqual([MAINNET_ADDR, 'habit-tracker']);
  });

  it('returns null for standard principal', () => {
    expect(parseContractPrincipal(MAINNET_ADDR)).toBeNull();
  });

  it('returns null for empty', () => {
    expect(parseContractPrincipal('')).toBeNull();
  });

  it('returns null for invalid address part', () => {
    expect(parseContractPrincipal('invalid.contract')).toBeNull();
  });
});
