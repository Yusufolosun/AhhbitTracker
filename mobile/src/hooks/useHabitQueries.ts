import { useQuery } from '@tanstack/react-query';
import { POLLING_INTERVAL_MS, QUERY_KEYS } from '../config/constants';
import {
  fetchHabitsByAddress,
  fetchPoolBalance,
  fetchUserStats,
} from '../services/contractService';

export function usePoolBalanceQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.poolBalance,
    queryFn: fetchPoolBalance,
    staleTime: POLLING_INTERVAL_MS,
    refetchInterval: POLLING_INTERVAL_MS,
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
  });
}
