import { useQuery } from '@tanstack/react-query';

/**
 * Fetch the current Stacks block height from the Hiro API.
 *
 * The block height is cached for 5 minutes — it only changes every ~10 min on
 * mainnet, so aggressive polling is unnecessary.
 */
async function fetchCurrentBlock(): Promise<number> {
  const isDev = import.meta.env.DEV;
  const baseUrl = isDev ? `${window.location.origin}/api/stacks` : 'https://api.hiro.so';
  const res = await fetch(`${baseUrl}/v2/info`);
  if (!res.ok) throw new Error('Failed to fetch block height');
  const data = await res.json();
  return data.stacks_tip_height as number;
}

export function useCurrentBlock(): number | null {
  const { data } = useQuery({
    queryKey: ['currentBlock'],
    queryFn: fetchCurrentBlock,
    staleTime: 300_000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return data ?? null;
}
