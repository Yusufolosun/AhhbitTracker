/**
 * @module useCurrentBlock
 * Hook for fetching and tracking the current Stacks block height.
 */
import { useQuery } from '@tanstack/react-query';
import { POLLING_INTERVAL, CACHE_TIME } from '../utils/constants';

/**
 * Fetch the current Stacks block height from the Hiro API.
 *
 * The block height is cached for 5 minutes — it only changes every ~10 min on
 * mainnet, so aggressive polling is unnecessary.
 *
 * @returns Promise resolving to the current block height
 * @throws Error if the API request fails
 */
async function fetchCurrentBlock(): Promise<number> {
  const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
  const baseUrl = isDev ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/stacks` : 'https://api.mainnet.hiro.so';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${baseUrl}/v2/info`, { signal: controller.signal });
    if (!res.ok) throw new Error('Failed to fetch block height');
    const data = await res.json();
    return data.stacks_tip_height as number;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * React hook to get the current Stacks block height.
 *
 * Uses React Query for caching and automatic refetching. Returns null
 * while loading or if the fetch fails.
 *
 * @returns Current block height or null if unavailable
 * @example
 * ```tsx
 * const block = useCurrentBlock();
 * if (block !== null) {
 *   console.log(`Current block: ${block}`);
 * }
 * ```
 */
export function useCurrentBlock(): number | null {
  const { data } = useQuery({
    queryKey: ['currentBlock'],
    queryFn: fetchCurrentBlock,
    staleTime: CACHE_TIME,
    refetchInterval: POLLING_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return data ?? null;
}
