/**
 * Stacks address utilities — validation, shortening, and type detection.
 *
 * Stacks addresses start with `SP` (mainnet) or `ST` (testnet).
 * This module works with both, plus contract principals
 * (`SP…ADDRESS.contract-name`).
 */

/** Regex for a valid Stacks standard principal (SP/ST + base-58 chars). */
const STX_ADDRESS_RE = /^S[PT][A-Z0-9]{38,40}$/;

/** Regex for a valid contract principal (`address.name`). */
const CONTRACT_PRINCIPAL_RE = /^S[PT][A-Z0-9]{38,40}\.[a-zA-Z][\w-]{0,127}$/;

/**
 * Check whether a string is a valid Stacks standard principal.
 *
 * @param address - The string to test.
 * @returns `true` when the string matches the standard-principal pattern.
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false;
  return STX_ADDRESS_RE.test(address);
}

/**
 * Check whether a string is a valid contract principal
 * (e.g. `SP1M46…G193.habit-tracker-v2`).
 */
export function isContractPrincipal(address: string): boolean {
  if (!address) return false;
  return CONTRACT_PRINCIPAL_RE.test(address);
}

/**
 * Determine whether an address belongs to mainnet (`SP`) or testnet (`ST`).
 *
 * @returns `"mainnet"`, `"testnet"`, or `null` if unrecognised.
 */
export function getAddressNetwork(
  address: string,
): 'mainnet' | 'testnet' | null {
  if (!address || address.length < 2) return null;
  const prefix = address.slice(0, 2);
  if (prefix === 'SP') return 'mainnet';
  if (prefix === 'ST') return 'testnet';
  return null;
}

/**
 * Shorten an address for display.
 *
 * @param address - Full Stacks address.
 * @param startChars - Characters to keep at the start (default: 6).
 * @param endChars   - Characters to keep at the end (default: 4).
 * @returns Shortened address, e.g. `"SP1M46...G193"`.
 */
export function shortenAddress(
  address: string,
  startChars = 6,
  endChars = 4,
): string {
  if (!address) return '';
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Extract the deployer address and contract name from a contract principal.
 *
 * @param principal - E.g. `"SP1M46…G193.habit-tracker-v2"`.
 * @returns Tuple `[address, contractName]`, or `null` if invalid.
 */
export function parseContractPrincipal(
  principal: string,
): [string, string] | null {
  if (!principal) return null;
  const dot = principal.indexOf('.');
  if (dot === -1) return null;
  const addr = principal.slice(0, dot);
  const name = principal.slice(dot + 1);
  if (!isValidAddress(addr) || !name) return null;
  return [addr, name];
}
