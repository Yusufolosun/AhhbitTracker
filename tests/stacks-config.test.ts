import { describe, expect, it } from 'vitest';
import {
  assertContractName,
  assertStacksAddress,
  assertStacksApiUrl,
  buildRuntimeConfig,
  getRuntimeConfigSummary,
  parseContractPrincipal,
} from '../scripts/shared/stacks-config';

describe('stacks config validation', () => {
  it('accepts valid stacks addresses', () => {
    expect(assertStacksAddress('SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z', 'CONTRACT_ADDRESS')).toBe(
      'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
    );
    expect(assertStacksAddress('st1m46w6cvgamh3zjd3tkmy5kcy48hwazk1ga0cf0', 'DEPLOYER_ADDRESS')).toBe(
      'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0',
    );
  });

  it('rejects malformed stacks addresses', () => {
    expect(() => assertStacksAddress('invalid-address', 'CONTRACT_ADDRESS')).toThrow(
      'Invalid Stacks address',
    );
  });

  it('accepts valid contract names and rejects invalid names', () => {
    expect(assertContractName('habit-tracker-v2', 'CONTRACT_NAME')).toBe('habit-tracker-v2');
    expect(() => assertContractName('2bad-name', 'CONTRACT_NAME')).toThrow('Invalid contract name');
  });

  it('accepts https API URLs and localhost http', () => {
    expect(assertStacksApiUrl('https://api.mainnet.hiro.so/', 'STACKS_API_URL', 'mainnet')).toBe(
      'https://api.mainnet.hiro.so',
    );
    expect(assertStacksApiUrl('http://localhost:3999', 'STACKS_API_URL', 'testnet')).toBe(
      'http://localhost:3999',
    );
  });

  it('rejects non-local http API URLs', () => {
    expect(() => assertStacksApiUrl('http://api.mainnet.hiro.so', 'STACKS_API_URL', 'mainnet')).toThrow(
      'must use https',
    );
  });

  it('rejects obvious network/API mismatches', () => {
    expect(() =>
      assertStacksApiUrl('https://api.testnet.hiro.so', 'STACKS_API_URL', 'mainnet'),
    ).toThrow('points to testnet');
  });

  it('builds runtime config from env with defaults and normalization', () => {
    const config = buildRuntimeConfig(
      {
        STACKS_NETWORK: 'MAINNET',
        STACKS_API_URL: 'https://api.mainnet.hiro.so/',
        CONTRACT_ADDRESS: 'sp1n3809w9cbwwx04kn3tcqhp8a9gn520bd4jmp8z',
        CONTRACT_NAME: 'habit-tracker-v2',
        DEPLOYER_ADDRESS: 'sp1n3809w9cbwwx04kn3tcqhp8a9gn520bd4jmp8z',
      },
      'production',
    );

    expect(config.stacksNetwork).toBe('mainnet');
    expect(config.stacksApiUrl).toBe('https://api.mainnet.hiro.so');
    expect(config.contractAddress).toBe('SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z');
  });

  it('parses contract principal safely', () => {
    expect(parseContractPrincipal('SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2')).toEqual({
      contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      contractName: 'habit-tracker-v2',
    });

    expect(() => parseContractPrincipal('not-a-principal')).toThrow('ADDRESS.CONTRACT_NAME');
  });

  it('builds a sanitized config summary', () => {
    const config = buildRuntimeConfig({}, 'production');
    const summary = getRuntimeConfigSummary(config);

    expect(summary.contractPrincipal).toBe('SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2');
    expect(summary.stacksNetwork).toBe('mainnet');
  });
});
