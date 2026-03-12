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
  const normalizedId = /^0x/i.test(txId) ? txId : `0x${txId}`;
  return `${EXPLORER_BASE}/txid/${normalizedId}?chain=${network}`;
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

/**
 * Build an explorer URL for a block.
 *
 * @param blockHash - The block hash (hex string).
 * @param network   - `"mainnet"` or `"testnet"` (default: `"mainnet"`).
 */
export function blockUrl(
  blockHash: string,
  network: Network = 'mainnet',
): string {
  return `${EXPLORER_BASE}/block/${blockHash}?chain=${network}`;
}

const API_BASE: Record<Network, string> = {
  mainnet: 'https://stacks-node-api.mainnet.stacks.co',
  testnet: 'https://stacks-node-api.testnet.stacks.co',
};

/**
 * Return the Stacks API base URL for a given network.
 *
 * @param network - `"mainnet"` or `"testnet"` (default: `"mainnet"`).
 */
export function apiUrl(network: Network = 'mainnet'): string {
  return API_BASE[network];
}
