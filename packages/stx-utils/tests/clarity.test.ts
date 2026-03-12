import { describe, it, expect } from 'vitest';
import {
  decodeClarityValue,
  unwrapResponse,
  extractValue,
  ClarityValue,
} from '../src/clarity';

// ── Hex builder helpers ───────────────────────────────────────────
// These build hex payloads matching the SIP-005 binary format.

function u128Hex(n: bigint): string {
  return n.toString(16).padStart(32, '0');
}

describe('decodeClarityValue', () => {
  describe('uint', () => {
    it('decodes uint 0', () => {
      const hex = '0x01' + u128Hex(0n);
      const cv = decodeClarityValue(hex);
      expect(cv).toEqual({ type: 'uint', value: 0n });
    });

    it('decodes uint 42', () => {
      const hex = '0x01' + u128Hex(42n);
      const cv = decodeClarityValue(hex);
      expect(cv).toEqual({ type: 'uint', value: 42n });
    });

    it('decodes large uint (u340282366920938463463374607431768211455)', () => {
      const max = (1n << 128n) - 1n;
      const hex = '0x01' + u128Hex(max);
      const cv = decodeClarityValue(hex);
      expect(cv).toEqual({ type: 'uint', value: max });
    });
  });

  describe('int', () => {
    it('decodes int 0', () => {
      const hex = '0x00' + u128Hex(0n);
      const cv = decodeClarityValue(hex);
      expect(cv).toEqual({ type: 'int', value: 0n });
    });

    it('decodes positive int 100', () => {
      const hex = '0x00' + u128Hex(100n);
      const cv = decodeClarityValue(hex);
      expect(cv).toEqual({ type: 'int', value: 100n });
    });

    it('decodes negative int -1', () => {
      // -1 in two's complement 128-bit = all ff bytes
      const hex = '0x00' + 'ff'.repeat(16);
      const cv = decodeClarityValue(hex);
      expect(cv).toEqual({ type: 'int', value: -1n });
    });

    it('decodes negative int -100', () => {
      // -100 in two's complement 128-bit
      const val = (1n << 128n) - 100n;
      const hex = '0x00' + u128Hex(val);
      const cv = decodeClarityValue(hex);
      expect(cv).toEqual({ type: 'int', value: -100n });
    });
  });

  describe('bool', () => {
    it('decodes true', () => {
      expect(decodeClarityValue('0x03')).toEqual({ type: 'bool', value: true });
    });

    it('decodes false', () => {
      expect(decodeClarityValue('0x04')).toEqual({ type: 'bool', value: false });
    });
  });

  describe('buffer', () => {
    it('decodes empty buffer', () => {
      // type 0x02 + length 0x00000000
      expect(decodeClarityValue('0x0200000000')).toEqual({
        type: 'buffer',
        hex: '',
      });
    });

    it('decodes buffer with data', () => {
      // type 0x02 + length 3 + bytes cafe01
      expect(decodeClarityValue('0x0200000003cafe01')).toEqual({
        type: 'buffer',
        hex: 'cafe01',
      });
    });
  });

  describe('string-ascii', () => {
    it('decodes empty string', () => {
      expect(decodeClarityValue('0x0d00000000')).toEqual({
        type: 'string-ascii',
        value: '',
      });
    });

    it('decodes "hello"', () => {
      // 0x0d + length 5 + "hello" in ASCII
      const hex = '0x0d00000005' + '68656c6c6f';
      expect(decodeClarityValue(hex)).toEqual({
        type: 'string-ascii',
        value: 'hello',
      });
    });
  });

  describe('string-utf8', () => {
    it('decodes ASCII text', () => {
      // 0x0e + length 3 + "abc"
      const hex = '0x0e00000003' + '616263';
      expect(decodeClarityValue(hex)).toEqual({
        type: 'string-utf8',
        value: 'abc',
      });
    });
  });

  describe('none / some', () => {
    it('decodes none', () => {
      expect(decodeClarityValue('0x09')).toEqual({ type: 'none' });
    });

    it('decodes some wrapping a uint', () => {
      const inner = '01' + u128Hex(7n);
      const hex = '0x0a' + inner;
      const cv = decodeClarityValue(hex);
      expect(cv).toEqual({
        type: 'some',
        value: { type: 'uint', value: 7n },
      });
    });
  });

  describe('response (ok / err)', () => {
    it('decodes (ok true)', () => {
      const cv = decodeClarityValue('0x0703');
      expect(cv).toEqual({
        type: 'ok',
        value: { type: 'bool', value: true },
      });
    });

    it('decodes (err u100)', () => {
      const hex = '0x08' + '01' + u128Hex(100n);
      const cv = decodeClarityValue(hex);
      expect(cv).toEqual({
        type: 'err',
        value: { type: 'uint', value: 100n },
      });
    });
  });

  describe('list', () => {
    it('decodes empty list', () => {
      // 0x0b + count 0
      expect(decodeClarityValue('0x0b00000000')).toEqual({
        type: 'list',
        items: [],
      });
    });

    it('decodes list of two uints', () => {
      const u1 = '01' + u128Hex(1n);
      const u2 = '01' + u128Hex(2n);
      const hex = '0x0b00000002' + u1 + u2;
      const cv = decodeClarityValue(hex);
      expect(cv).toEqual({
        type: 'list',
        items: [
          { type: 'uint', value: 1n },
          { type: 'uint', value: 2n },
        ],
      });
    });
  });

  describe('tuple', () => {
    it('decodes tuple with one field', () => {
      // 0x0c + count 1 + name-len 2 + "id" + uint 42
      const nameHex = '026964'; // len=2, "id"
      const valHex = '01' + u128Hex(42n);
      const hex = '0x0c00000001' + nameHex + valHex;
      const cv = decodeClarityValue(hex);
      expect(cv).toEqual({
        type: 'tuple',
        fields: { id: { type: 'uint', value: 42n } },
      });
    });
  });

  describe('principal', () => {
    it('decodes standard principal', () => {
      // 0x05 + version byte + 20-byte hash160
      const version = '16'; // SP = 0x16
      const hash = 'aa'.repeat(20);
      const hex = '0x05' + version + hash;
      const cv = decodeClarityValue(hex);
      expect(cv.type).toBe('principal');
      if (cv.type === 'principal') {
        expect(cv.address).toBe(`v22:${'aa'.repeat(20)}`);
      }
    });

    it('decodes contract principal', () => {
      // 0x06 + version + hash160 + name-len + name
      const version = '16';
      const hash = 'bb'.repeat(20);
      const name = 'my-contract';
      let nameHex = name.length.toString(16).padStart(2, '0');
      for (let i = 0; i < name.length; i++) {
        nameHex += name.charCodeAt(i).toString(16).padStart(2, '0');
      }
      const hex = '0x06' + version + hash + nameHex;
      const cv = decodeClarityValue(hex);
      expect(cv.type).toBe('contract-principal');
      if (cv.type === 'contract-principal') {
        expect(cv.contractName).toBe('my-contract');
      }
    });
  });

  describe('error handling', () => {
    it('throws on empty input', () => {
      expect(() => decodeClarityValue('')).toThrow('empty input');
    });

    it('throws on odd-length hex', () => {
      expect(() => decodeClarityValue('0x0')).toThrow('odd length');
    });

    it('throws on unknown type ID', () => {
      expect(() => decodeClarityValue('0xff')).toThrow('unknown type ID');
    });

    it('throws on truncated data', () => {
      // uint needs 16 bytes after type byte, only provide 2
      expect(() => decodeClarityValue('0x010001')).toThrow('unexpected end');
    });

    it('throws on trailing bytes', () => {
      // bool true (0x03) followed by extra byte
      expect(() => decodeClarityValue('0x03ff')).toThrow('trailing byte');
    });
  });
});

describe('unwrapResponse', () => {
  it('unwraps (ok value)', () => {
    const cv: ClarityValue = {
      type: 'ok',
      value: { type: 'uint', value: 42n },
    };
    expect(unwrapResponse(cv)).toEqual({ type: 'uint', value: 42n });
  });

  it('throws on (err value) with error code', () => {
    const cv: ClarityValue = {
      type: 'err',
      value: { type: 'uint', value: 100n },
    };
    expect(() => unwrapResponse(cv)).toThrow('error u100');
  });

  it('throws on non-response type', () => {
    const cv: ClarityValue = { type: 'bool', value: true };
    expect(() => unwrapResponse(cv)).toThrow('Expected response type');
  });
});

describe('extractValue', () => {
  it('extracts uint to bigint', () => {
    expect(extractValue({ type: 'uint', value: 42n })).toBe(42n);
  });

  it('extracts bool', () => {
    expect(extractValue({ type: 'bool', value: true })).toBe(true);
  });

  it('extracts string-ascii', () => {
    expect(extractValue({ type: 'string-ascii', value: 'hello' })).toBe(
      'hello',
    );
  });

  it('extracts none as null', () => {
    expect(extractValue({ type: 'none' })).toBeNull();
  });

  it('unwraps some', () => {
    expect(
      extractValue({ type: 'some', value: { type: 'uint', value: 5n } }),
    ).toBe(5n);
  });

  it('unwraps ok', () => {
    expect(
      extractValue({ type: 'ok', value: { type: 'bool', value: false } }),
    ).toBe(false);
  });

  it('extracts list to array', () => {
    const cv: ClarityValue = {
      type: 'list',
      items: [
        { type: 'uint', value: 1n },
        { type: 'uint', value: 2n },
      ],
    };
    expect(extractValue(cv)).toEqual([1n, 2n]);
  });

  it('extracts tuple to plain object', () => {
    const cv: ClarityValue = {
      type: 'tuple',
      fields: {
        name: { type: 'string-ascii', value: 'test' },
        count: { type: 'uint', value: 3n },
      },
    };
    expect(extractValue(cv)).toEqual({ name: 'test', count: 3n });
  });

  it('extracts buffer as hex string', () => {
    expect(extractValue({ type: 'buffer', hex: 'cafe' })).toBe('cafe');
  });
});
