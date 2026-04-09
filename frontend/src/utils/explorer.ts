type ExplorerChain = 'mainnet' | 'testnet';

/**
 * Build a Stacks Explorer URL for a contract principal.
 * Explorer uses the address route for contract IDs.
 */
export function contractExplorerUrl(
  contractPrincipal: string,
  chain: ExplorerChain = 'mainnet',
): string {
  return `https://explorer.hiro.so/address/${contractPrincipal}?chain=${chain}`;
}
