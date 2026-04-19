import { useQuery } from '@tanstack/react-query';
import { POLLING_INTERVAL_MS, QUERY_KEYS } from '@/core/config';
import {
  fetchHabitsByAddress,
  fetchPoolBalance,
  fetchUserStats,
} from '@/core/data';
import { fetchHiroJson } from '@/core/network';

export function usePoolBalanceQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.poolBalance,
    queryFn: fetchPoolBalance,
    staleTime: POLLING_INTERVAL_MS,
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useUserHabitsQuery(address: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userHabits(address ?? 'anonymous'),
    queryFn: async () => {
      if (!address) {
        return [];
      }

      return fetchHabitsByAddress(address);
    },
    enabled: Boolean(address),
    staleTime: POLLING_INTERVAL_MS,
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useUserStatsQuery(address: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userStats(address ?? 'anonymous'),
    queryFn: async () => {
      if (!address) {
        return null;
      }

      return fetchUserStats(address);
    },
    enabled: Boolean(address),
    staleTime: POLLING_INTERVAL_MS,
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useCurrentBlockQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.currentBlock,
    queryFn: async () => {
      const payload = await fetchHiroJson<{ stacks_tip_height: number }>('/v2/info', {
        ttlMs: POLLING_INTERVAL_MS,
      });
      return Number(payload.stacks_tip_height ?? 0);
    },
    staleTime: POLLING_INTERVAL_MS,
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
