/**
 * @module useCurrentBlock
 * Hook for fetching and tracking the current Stacks block height.
 */
import { useQuery } from '@tanstack/react-query';
import { POLLING_INTERVAL, CACHE_TIME } from '../utils/constants';
import { fetchHiroApiJson } from '../services/hiroApiClient';
import { queryKeys } from '../utils/queryKeys';

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
  const data = await fetchHiroApiJson<{ stacks_tip_height: number }>('/v2/info', {
    ttlMs: CACHE_TIME,
  });
  return data.stacks_tip_height;
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
    queryKey: queryKeys.currentBlock,
    queryFn: fetchCurrentBlock,
    staleTime: CACHE_TIME,
    refetchInterval: POLLING_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return data ?? null;
}
