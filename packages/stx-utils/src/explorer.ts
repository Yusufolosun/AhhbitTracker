/**
 * Stacks explorer URL builders.
 *
 * Generate links to the Hiro explorer for transactions, addresses,
 * and contracts on mainnet or testnet.
 */

const EXPLORER_BASE = 'https://explorer.hiro.so';

export type Network = 'mainnet' | 'testnet';

/**
 * Build an explorer URL for a transaction.
 *
 * @param txId    - The transaction ID (hex string).
 * @param network - `"mainnet"` or `"testnet"` (default: `"mainnet"`).
 */
export function txUrl(txId: string, network: Network = 'mainnet'): string {
  return `${EXPLORER_BASE}/txid/${txId}?chain=${network}`;
}

/**
 * Build an explorer URL for an address.
 */
export function addressUrl(
  address: string,
  network: Network = 'mainnet',
): string {
  return `${EXPLORER_BASE}/address/${address}?chain=${network}`;
}

/**
 * Build an explorer URL for a deployed contract.
 *
 * @param principal - Contract principal, e.g. `"SP1M46…G193.habit-tracker-v2"`.
 */
export function contractUrl(
  principal: string,
  network: Network = 'mainnet',
): string {
  return `${EXPLORER_BASE}/txid/${principal}?chain=${network}`;
}
