import { describe, it, expect } from 'vitest';
import { txUrl, addressUrl, contractUrl } from '../src/explorer';

const ADDR = 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z';
const TX = '0xabc123';
const CONTRACT = `${ADDR}.habit-tracker-v2`;

describe('txUrl', () => {
  it('builds mainnet URL by default', () => {
    expect(txUrl(TX)).toBe(
      `https://explorer.hiro.so/txid/${TX}?chain=mainnet`,
    );
  });

  it('builds testnet URL', () => {
    expect(txUrl(TX, 'testnet')).toBe(
      `https://explorer.hiro.so/txid/${TX}?chain=testnet`,
    );
  });
});

describe('addressUrl', () => {
  it('builds address URL', () => {
    expect(addressUrl(ADDR)).toBe(
      `https://explorer.hiro.so/address/${ADDR}?chain=mainnet`,
    );
  });
});

describe('contractUrl', () => {
  it('builds contract URL', () => {
    expect(contractUrl(CONTRACT, 'mainnet')).toBe(
      `https://explorer.hiro.so/txid/${CONTRACT}?chain=mainnet`,
    );
  });
});
