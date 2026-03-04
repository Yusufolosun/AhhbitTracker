import { describe, it, expect } from 'vitest';
import { txUrl, addressUrl, contractUrl } from '../src/explorer';

const ADDR = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
const TX = '0xabc123';
const CONTRACT = `${ADDR}.habit-tracker`;

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
