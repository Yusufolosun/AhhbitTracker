/**
 * @module useCurrentBlock
 * Hook for fetching and tracking the current Stacks block height.
 * In demo mode, returns the simulated block height from localStorage.
 */
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { POLLING_INTERVAL, CACHE_TIME } from '../utils/constants';
import { fetchHiroApiJson } from '../services/hiroApiClient';
import { queryKeys } from '../utils/queryKeys';
import { demoService } from '../services/demoService';

/**
 * Fetch the current Stacks block height from the Hiro API.
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
 * In demo mode, returns the simulated block from demoService and
 * re-reads it on a short interval so the UI stays in sync after
 * fast-forward actions.
 *
 * @returns Current block height or null if unavailable
 */
export function useCurrentBlock(): number | null {
  const isDemo = demoService.isDemoMode();

  const [demoBlock, setDemoBlock] = useState<number | null>(
    isDemo ? demoService.getCurrentBlock() : null,
  );

  const refreshDemoBlock = useCallback(() => {
    if (demoService.isDemoMode()) {
      setDemoBlock(demoService.getCurrentBlock());
    }
  }, []);

  useEffect(() => {
    if (!isDemo) return;
    refreshDemoBlock();
    const id = setInterval(refreshDemoBlock, 1000);
    return () => clearInterval(id);
  }, [isDemo, refreshDemoBlock]);

  const { data } = useQuery({
    queryKey: queryKeys.currentBlock,
    queryFn: fetchCurrentBlock,
    staleTime: CACHE_TIME,
    refetchInterval: POLLING_INTERVAL,
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !isDemo,
  });

  if (isDemo) return demoBlock;
  return data ?? null;
}
