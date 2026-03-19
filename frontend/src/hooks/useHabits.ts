import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { contractService } from '../services/contractService';
import { useWallet } from '../context/WalletContext';
import {
  Habit,
  UserStats,
  HabitContractResponse,
  UserHabitsContractResponse,
  UserStatsContractResponse,
} from '../types/habit';
import { POLLING_INTERVAL, CACHE_TIME, POOL_CACHE_TIME } from '../utils/constants';

/**
 * Type guard to safely parse integer from Clarity response
 */
const parseIntSafe = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  }
  if (value && typeof value === 'object' && 'value' in value) {
    return parseIntSafe((value as { value: unknown }).value, fallback);
  }
  console.warn('[useHabits] Failed to parse integer, using fallback:', value);
  return fallback;
};

/**
 * Type guard to safely parse string from Clarity response
 */
const parseStringSafe = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'value' in value) {
    return parseStringSafe((value as { value: unknown }).value, fallback);
  }
  console.warn('[useHabits] Failed to parse string, using fallback:', value);
  return fallback;
};

/**
 * Type guard to safely parse boolean from Clarity response
 */
const parseBooleanSafe = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (value && typeof value === 'object' && 'value' in value) {
    return parseBooleanSafe((value as { value: unknown }).value, fallback);
  }
  console.warn('[useHabits] Failed to parse boolean, using fallback:', value);
  return fallback;
};

/**
 * Custom hook for managing habits
 */
export const useHabits = () => {
  const { walletState, refreshBalance } = useWallet();
  const queryClient = useQueryClient();

  // Track which habit IDs have in-flight mutations so each card can
  // independently show its own loading state.
  const [pendingCheckIns, setPendingCheckIns] = useState<Set<number>>(new Set());
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Set<number>>(new Set());
  const [pendingClaims, setPendingClaims] = useState<Set<number>>(new Set());
  const [pendingSlashes, setPendingSlashes] = useState<Set<number>>(new Set());

  // Fetch user habits
  const {
    data: habits,
    isLoading: isLoadingHabits,
    error: habitsError,
  } = useQuery({
    queryKey: ['habits', walletState.address],
    queryFn: async () => {
      if (!walletState.address) return [];
      const result = (await contractService.getUserHabits(
        walletState.address
      )) as UserHabitsContractResponse;

      // Parse habit IDs from result
      // get-user-habits returns: { habit-ids: (list) }
      if (result.value?.['habit-ids']?.value) {
        const habitIds = result.value['habit-ids'].value;

        // Fetch each habit's details
        const habitPromises = habitIds.map(async (id) => {
          const habitId = parseIntSafe(id);
          if (habitId === 0) {
            console.warn('[useHabits] Invalid habit ID:', id);
            return null;
          }

          const habitData = (await contractService.getHabit(habitId)) as HabitContractResponse;

          // Check if optional value exists (habitData.value will be the tuple)
          if (habitData.value?.value) {
            const habit = habitData.value.value;
            return {
              habitId,
              name: parseStringSafe(habit.name, 'Unknown Habit'),
              owner: parseStringSafe(habit.owner),
              stakeAmount: parseIntSafe(habit['stake-amount']),
              createdAtBlock: parseIntSafe(habit['created-at-block']),
              lastCheckInBlock: parseIntSafe(habit['last-check-in-block']),
              currentStreak: parseIntSafe(habit['current-streak']),
              isActive: parseBooleanSafe(habit['is-active']),
              isCompleted: parseBooleanSafe(habit['is-completed']),
              bonusClaimed: parseBooleanSafe(habit['bonus-claimed']),
            } as Habit;
          }
          return null;
        });

        const habitsData = await Promise.all(habitPromises);
        return habitsData.filter((h): h is Habit => h !== null);
      }

      return [];
    },
    enabled: !!walletState.address,
    staleTime: CACHE_TIME,
    refetchOnWindowFocus: true,
    refetchInterval: POLLING_INTERVAL,
    retry: 3,
    retryDelay: (attempt) => Math.min(15000 * Math.pow(2, attempt - 1), 60000),
  });

  // Fetch user stats
  const {
    data: userStats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['userStats', walletState.address],
    queryFn: async () => {
      if (!walletState.address) return null;
      const result = (await contractService.getUserStats(
        walletState.address
      )) as UserStatsContractResponse;

      // get-user-stats returns a response type
      if (result.success && result.value?.value) {
        const stats = result.value.value;
        const habitIdsValue = stats['habit-ids']?.value || [];
        return {
          totalHabits: parseIntSafe(stats['total-habits']),
          habitIds: habitIdsValue.map((id) => parseIntSafe(id)),
        } as UserStats;
      }

      return null;
    },
    enabled: !!walletState.address,
    staleTime: CACHE_TIME,
    retry: 3,
    retryDelay: (attempt) => Math.min(15000 * Math.pow(2, attempt - 1), 60000),
  });

  // Fetch pool balance
  const { data: poolBalance, error: poolError } = useQuery({
    queryKey: ['poolBalance'],
    queryFn: () => contractService.getPoolBalance(),
    staleTime: POOL_CACHE_TIME,
    retry: 3,
    retryDelay: (attempt) => Math.min(15000 * Math.pow(2, attempt - 1), 60000),
  });

  // Helper: schedule a deferred refetch after the tx has time to mine.
  // Stacks blocks average ~10 min; we refetch at 30s and 2min as best-effort.
  // All timers are tracked so they can be cleaned up on unmount.
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      for (const id of timersRef.current) clearTimeout(id);
      timersRef.current = [];
    };
  }, []);

  const scheduleRefetch = useCallback(
    (queryKeys: string[][]) => {
      const invalidate = () => {
        for (const key of queryKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      };
      timersRef.current.push(setTimeout(invalidate, 30_000));
      timersRef.current.push(setTimeout(invalidate, 120_000));
    },
    [queryClient],
  );

  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: ({ name, stakeAmount }: { name: string; stakeAmount: number }) =>
      contractService.createHabit(name, stakeAmount),
    onSuccess: () => {
      refreshBalance();
      scheduleRefetch([
        ['habits', walletState.address!],
        ['userStats', walletState.address!],
      ]);
    },
  });

  // Check-in mutation with optimistic streak update
  const checkInMutation = useMutation({
    mutationFn: (habitId: number) => contractService.checkIn(habitId),
    onMutate: async (habitId: number) => {
      setPendingCheckIns((prev) => new Set(prev).add(habitId));
      const queryKey = ['habits', walletState.address];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Habit[]>(queryKey);
      const currentBlock = queryClient.getQueryData<number>(['currentBlock']);
      if (previous) {
        queryClient.setQueryData<Habit[]>(queryKey, (old) =>
          (old ?? []).map((h) =>
            h.habitId === habitId
              ? {
                  ...h,
                  currentStreak: h.currentStreak + 1,
                  ...(currentBlock != null && { lastCheckInBlock: currentBlock }),
                }
              : h
          )
        );
      }
      return { previous };
    },
    onError: (_err, _habitId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['habits', walletState.address], context.previous);
      }
    },
    onSettled: (_data, _err, habitId) => {
      setPendingCheckIns((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    },
    onSuccess: () => {
      scheduleRefetch([['habits', walletState.address!], ['userStats', walletState.address!]]);
    },
  });

  // Withdraw stake mutation with optimistic update
  const withdrawStakeMutation = useMutation({
    mutationFn: ({ habitId, stakeAmount }: { habitId: number; stakeAmount: number }) =>
      contractService.withdrawStake(habitId, stakeAmount),
    onMutate: async ({ habitId }) => {
      setPendingWithdrawals((prev) => new Set(prev).add(habitId));
      const queryKey = ['habits', walletState.address];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Habit[]>(queryKey);
      if (previous) {
        queryClient.setQueryData<Habit[]>(queryKey, (old) =>
          (old ?? []).map((h) =>
            h.habitId === habitId
              ? { ...h, isActive: false, isCompleted: true }
              : h
          )
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['habits', walletState.address], context.previous);
      }
    },
    onSettled: (_data, _err, { habitId }) => {
      setPendingWithdrawals((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    },
    onSuccess: () => {
      refreshBalance();
      scheduleRefetch([
        ['habits', walletState.address!],
        ['userStats', walletState.address!],
        ['poolBalance'],
      ]);
    },
  });

  // Claim bonus mutation
  const claimBonusMutation = useMutation({
    mutationFn: (habitId: number) => contractService.claimBonus(habitId),
    onMutate: (habitId: number) => {
      setPendingClaims((prev) => new Set(prev).add(habitId));
    },
    onSettled: (_data, _err, habitId) => {
      setPendingClaims((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    },
    onSuccess: () => {
      refreshBalance();
      scheduleRefetch([['habits', walletState.address!], ['poolBalance']]);
    },
  });

  // Slash habit mutation (finalize expired habits)
  const slashHabitMutation = useMutation({
    mutationFn: (habitId: number) => contractService.slashHabit(habitId),
    onMutate: (habitId: number) => {
      setPendingSlashes((prev) => new Set(prev).add(habitId));
    },
    onSettled: (_data, _err, habitId) => {
      setPendingSlashes((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    },
    onSuccess: () => {
      scheduleRefetch([['habits', walletState.address!], ['poolBalance']]);
    },
  });

  return {
    // Data
    habits: habits || [],
    userStats,
    poolBalance: poolBalance || 0,

    // Loading states
    isLoadingHabits,
    isLoadingStats,

    // Errors
    habitsError,
    poolError,

    // Mutations
    createHabit: createHabitMutation.mutateAsync,
    checkIn: checkInMutation.mutateAsync,
    withdrawStake: withdrawStakeMutation.mutateAsync,
    claimBonus: claimBonusMutation.mutateAsync,
    slashHabit: slashHabitMutation.mutateAsync,

    // Per-habit pending states
    pendingCheckIns,
    pendingWithdrawals,
    pendingClaims,
    pendingSlashes,

    // Global mutation states (kept for backward compatibility)
    isCreatingHabit: createHabitMutation.isPending,
    isCheckingIn: checkInMutation.isPending,
    isWithdrawing: withdrawStakeMutation.isPending,
    isClaiming: claimBonusMutation.isPending,
    isSlashing: slashHabitMutation.isPending,
  };
};
