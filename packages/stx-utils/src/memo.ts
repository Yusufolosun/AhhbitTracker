/**
 * STX transfer memo encoder / decoder.
 *
 * On-chain STX transfers accept an optional memo field — a fixed 34-byte
 * buffer.  This module converts between UTF-8 strings and the padded
 * byte representation expected by the Stacks blockchain.
 */

/** Maximum memo length in bytes. */
export const MEMO_MAX_BYTES = 34;

/**
 * Encode a UTF-8 string into a 34-byte memo buffer.
 *
 * The string is encoded as UTF-8 and right-padded with `0x00` bytes to
 * exactly 34 bytes.  Throws if the encoded result exceeds 34 bytes.
 *
 * @param text - The memo text to encode.
 * @returns A 34-byte `Uint8Array`.
 */
export function encodeMemo(text: string): Uint8Array {
  const encoded = new TextEncoder().encode(text);
  if (encoded.length > MEMO_MAX_BYTES) {
    throw new RangeError(
      `Memo exceeds ${MEMO_MAX_BYTES} bytes (got ${encoded.length})`,
    );
  }
  const buf = new Uint8Array(MEMO_MAX_BYTES);
  buf.set(encoded);
  return buf;
}

/**
 * Decode a 34-byte memo buffer to a UTF-8 string.
 *
 * Trailing `0x00` padding bytes are stripped before decoding.
 *
 * @param bytes - The raw memo bytes (must be exactly 34 bytes).
 * @returns The decoded UTF-8 string (may be empty).
 */
export function decodeMemo(bytes: Uint8Array): string {
  if (bytes.length !== MEMO_MAX_BYTES) {
    throw new RangeError(
      `Memo buffer must be ${MEMO_MAX_BYTES} bytes (got ${bytes.length})`,
    );
  }
  // Find last non-zero byte
  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0) {
    end--;
  }
  return new TextDecoder().decode(bytes.subarray(0, end));
}

/**
 * Encode a memo string to a hex string (without `0x` prefix).
 *
 * Convenience wrapper around `encodeMemo` for use with Stacks.js
 * transaction builders that accept hex-string memos.
 *
 * @param text - The memo text.
 * @returns 68-character hex string (34 bytes).
 */
export function memoToHex(text: string): string {
  const buf = encodeMemo(text);
  let hex = '';
  for (let i = 0; i < buf.length; i++) {
    hex += buf[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Decode a hex-encoded memo to a UTF-8 string.
 *
 * @param hex - A hex string (with or without `0x` prefix), 68 hex characters.
 * @returns The decoded memo text.
 */
export function memoFromHex(hex: string): string {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length !== MEMO_MAX_BYTES * 2) {
    throw new RangeError(
      `Memo hex must be ${MEMO_MAX_BYTES * 2} characters (got ${clean.length})`,
    );
  }
  const bytes = new Uint8Array(MEMO_MAX_BYTES);
  for (let i = 0; i < MEMO_MAX_BYTES; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return decodeMemo(bytes);
}
