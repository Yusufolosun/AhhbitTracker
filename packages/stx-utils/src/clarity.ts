/**
 * Clarity value hex decoder.
 *
 * Stacks API endpoints (e.g. `callReadOnlyFunction`) return Clarity
 * values as hex-encoded byte strings prefixed with `0x`.  This module
 * decodes those hex strings into plain JavaScript objects — no
 * external dependencies required.
 *
 * Supported Clarity types: int, uint, bool, buffer, string-ascii,
 * string-utf8, optional (none/some), response (ok/err), list, and tuple.
 * Principal types are decoded to their raw components (version byte +
 * hash160 hex) since full c32check encoding requires SHA-256.
 *
 * Reference: SIP-005 § Clarity Value Representation.
 */

// ── Type IDs (SIP-005) ────────────────────────────────────────────

const CV_INT = 0x00;
const CV_UINT = 0x01;
const CV_BUFFER = 0x02;
const CV_TRUE = 0x03;
const CV_FALSE = 0x04;
const CV_PRINCIPAL_STANDARD = 0x05;
const CV_PRINCIPAL_CONTRACT = 0x06;
const CV_RESPONSE_OK = 0x07;
const CV_RESPONSE_ERR = 0x08;
const CV_NONE = 0x09;
const CV_SOME = 0x0a;
const CV_LIST = 0x0b;
const CV_TUPLE = 0x0c;
const CV_STRING_ASCII = 0x0d;
const CV_STRING_UTF8 = 0x0e;

// ── Public Types ──────────────────────────────────────────────────

export type ClarityValue =
  | { type: 'int'; value: bigint }
  | { type: 'uint'; value: bigint }
  | { type: 'bool'; value: boolean }
  | { type: 'buffer'; hex: string }
  | { type: 'string-ascii'; value: string }
  | { type: 'string-utf8'; value: string }
  | { type: 'none' }
  | { type: 'some'; value: ClarityValue }
  | { type: 'ok'; value: ClarityValue }
  | { type: 'err'; value: ClarityValue }
  | { type: 'list'; items: ClarityValue[] }
  | { type: 'tuple'; fields: Record<string, ClarityValue> }
  | { type: 'principal'; address: string }
  | { type: 'contract-principal'; address: string; contractName: string };

// ── Internal Reader ───────────────────────────────────────────────

class ByteReader {
  private pos = 0;
  constructor(private bytes: Uint8Array) {}

  read(n: number): Uint8Array {
    if (this.pos + n > this.bytes.length) {
      throw new RangeError(
        `Clarity decode: unexpected end of input at offset ${this.pos}, need ${n} more bytes`,
      );
    }
    const slice = this.bytes.subarray(this.pos, this.pos + n);
    this.pos += n;
    return slice;
  }

  readByte(): number {
    return this.read(1)[0];
  }

  readU32(): number {
    const b = this.read(4);
    return ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
  }

  get remaining(): number {
    return this.bytes.length - this.pos;
  }
}

// ── Hex Helpers ───────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error('Clarity decode: hex string has odd length');
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const hi = parseInt(clean[i * 2], 16);
    const lo = parseInt(clean[i * 2 + 1], 16);
    if (Number.isNaN(hi) || Number.isNaN(lo)) {
      throw new Error(`Clarity decode: invalid hex char at position ${i * 2}`);
    }
    bytes[i] = (hi << 4) | lo;
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// ── Int128 Helper ─────────────────────────────────────────────────

function readInt128(bytes: Uint8Array): bigint {
  let value = 0n;
  for (let i = 0; i < 16; i++) {
    value = (value << 8n) | BigInt(bytes[i]);
  }
  // Interpret as signed 128-bit (two's complement)
  if (value >= 1n << 127n) {
    value -= 1n << 128n;
  }
  return value;
}

function readUint128(bytes: Uint8Array): bigint {
  let value = 0n;
  for (let i = 0; i < 16; i++) {
    value = (value << 8n) | BigInt(bytes[i]);
  }
  return value;
}

// ── Principal Helper ──────────────────────────────────────────────

/**
 * Decode a standard principal from a ByteReader.
 * Returns a human-readable hex representation: `"v<version>:<hash160hex>"`.
 */
function readStandardPrincipal(reader: ByteReader): string {
  const version = reader.readByte();
  const hash160 = reader.read(20);
  return `v${version}:${bytesToHex(hash160)}`;
}

// ── Core Decoder ──────────────────────────────────────────────────

function decodeCV(reader: ByteReader): ClarityValue {
  const typeId = reader.readByte();

  switch (typeId) {
    case CV_INT:
      return { type: 'int', value: readInt128(reader.read(16)) };

    case CV_UINT:
      return { type: 'uint', value: readUint128(reader.read(16)) };

    case CV_BUFFER: {
      const len = reader.readU32();
      return { type: 'buffer', hex: bytesToHex(reader.read(len)) };
    }

    case CV_TRUE:
      return { type: 'bool', value: true };

    case CV_FALSE:
      return { type: 'bool', value: false };

    case CV_PRINCIPAL_STANDARD:
      return { type: 'principal', address: readStandardPrincipal(reader) };

    case CV_PRINCIPAL_CONTRACT: {
      const address = readStandardPrincipal(reader);
      const nameLen = reader.readByte();
      const nameBytes = reader.read(nameLen);
      const contractName = new TextDecoder().decode(nameBytes);
      return { type: 'contract-principal', address, contractName };
    }

    case CV_RESPONSE_OK:
      return { type: 'ok', value: decodeCV(reader) };

    case CV_RESPONSE_ERR:
      return { type: 'err', value: decodeCV(reader) };

    case CV_NONE:
      return { type: 'none' };

    case CV_SOME:
      return { type: 'some', value: decodeCV(reader) };

    case CV_LIST: {
      const count = reader.readU32();
      const items: ClarityValue[] = [];
      for (let i = 0; i < count; i++) {
        items.push(decodeCV(reader));
      }
      return { type: 'list', items };
    }

    case CV_TUPLE: {
      const count = reader.readU32();
      const fields: Record<string, ClarityValue> = {};
      for (let i = 0; i < count; i++) {
        const nameLen = reader.readByte();
        const nameBytes = reader.read(nameLen);
        const name = new TextDecoder().decode(nameBytes);
        fields[name] = decodeCV(reader);
      }
      return { type: 'tuple', fields };
    }

    case CV_STRING_ASCII: {
      const len = reader.readU32();
      const bytes = reader.read(len);
      let str = '';
      for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      return { type: 'string-ascii', value: str };
    }

    case CV_STRING_UTF8: {
      const len = reader.readU32();
      const bytes = reader.read(len);
      return { type: 'string-utf8', value: new TextDecoder().decode(bytes) };
    }

    default:
      throw new Error(
        `Clarity decode: unknown type ID 0x${typeId.toString(16).padStart(2, '0')}`,
      );
  }
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Decode a hex-encoded Clarity value into a JavaScript object.
 *
 * @param hex - The `0x`-prefixed (or plain) hex string from the Stacks API.
 * @returns A typed `ClarityValue` object.
 *
 * @example
 * ```ts
 * // uint 42
 * decodeClarityValue('0x01000000000000000000000000000000002a');
 * // → { type: 'uint', value: 42n }
 *
 * // (ok true)
 * decodeClarityValue('0x0703');
 * // → { type: 'ok', value: { type: 'bool', value: true } }
 * ```
 */
export function decodeClarityValue(hex: string): ClarityValue {
  if (!hex) throw new Error('Clarity decode: empty input');
  const bytes = hexToBytes(hex);
  const reader = new ByteReader(bytes);
  const result = decodeCV(reader);
  if (reader.remaining > 0) {
    throw new Error(
      `Clarity decode: ${reader.remaining} trailing byte(s) after value`,
    );
  }
  return result;
}

/**
 * Unwrap a response `(ok ...)` or throw on `(err ...)`.
 *
 * A common pattern when calling read-only functions: you expect a
 * successful response and want to extract the inner value.
 *
 * @param cv - A decoded Clarity value (should be an `ok` or `err` response).
 * @returns The inner value of `(ok ...)`.
 * @throws If the value is `(err ...)` or not a response type.
 */
export function unwrapResponse(cv: ClarityValue): ClarityValue {
  if (cv.type === 'ok') return cv.value;
  if (cv.type === 'err') {
    const inner = cv.value;
    const detail =
      inner.type === 'uint' || inner.type === 'int'
        ? ` u${inner.value}`
        : '';
    throw new Error(`Clarity response error${detail}`);
  }
  throw new Error(`Expected response type, got "${cv.type}"`);
}

/**
 * Extract a plain JavaScript value from a simple Clarity value.
 *
 * Converts numeric types to `bigint`, booleans to `boolean`, strings to
 * `string`, `none` to `null`, and unwraps `some`.  Tuples become plain
 * objects with recursively extracted values.  Lists become arrays.
 *
 * @param cv - A decoded Clarity value.
 * @returns A plain JS representation.
 */
export function extractValue(cv: ClarityValue): unknown {
  switch (cv.type) {
    case 'int':
    case 'uint':
      return cv.value;
    case 'bool':
      return cv.value;
    case 'string-ascii':
    case 'string-utf8':
      return cv.value;
    case 'buffer':
      return cv.hex;
    case 'none':
      return null;
    case 'some':
      return extractValue(cv.value);
    case 'ok':
      return extractValue(cv.value);
    case 'err':
      return extractValue(cv.value);
    case 'list':
      return cv.items.map(extractValue);
    case 'tuple': {
      const obj: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(cv.fields)) {
        obj[key] = extractValue(val);
      }
      return obj;
    }
    case 'principal':
      return cv.address;
    case 'contract-principal':
      return `${cv.address}.${cv.contractName}`;
  }
}
