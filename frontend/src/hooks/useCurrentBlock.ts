import { useQuery } from '@tanstack/react-query';

/**
 * Fetch the current Stacks block height from the Hiro API.
 *
 * The block height is cached for 5 minutes — it only changes every ~10 min on
 * mainnet, so aggressive polling is unnecessary.
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

export function useCurrentBlock(): number | null {
  const { data } = useQuery({
    queryKey: ['currentBlock'],
    queryFn: fetchCurrentBlock,
    staleTime: 120_000, // 2 minutes — keep in sync with habit data freshness
    refetchInterval: 120_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return data ?? null;
}
