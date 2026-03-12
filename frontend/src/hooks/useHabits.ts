import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { contractService } from '../services/contractService';
import { useWallet } from '../context/WalletContext';
import { Habit, UserStats } from '../types/habit';

/**
 * Custom hook for managing habits
 */
export const useHabits = () => {
  const { walletState, refreshBalance } = useWallet();
  const queryClient = useQueryClient();

  // Fetch user habits
  const {
    data: habits,
    isLoading: isLoadingHabits,
    error: habitsError,
  } = useQuery({
    queryKey: ['habits', walletState.address],
    queryFn: async () => {
      if (!walletState.address) return [];
      const result = await contractService.getUserHabits(walletState.address);

      // Parse habit IDs from result
      // get-user-habits returns: { habit-ids: (list) }
      if (result.value && result.value['habit-ids']) {
        const habitIds = result.value['habit-ids'].value || [];

        // Fetch each habit's details
        const habitPromises = habitIds.map(async (id: any) => {
          const habitId = parseInt(id.value);
          const habitData = await contractService.getHabit(habitId);

          // Check if optional value exists (habitData.value will be the tuple)
          if (habitData.value && habitData.value.value) {
            const habit = habitData.value.value;
            return {
              habitId: habitId,
              name: habit.name.value,
              owner: habit.owner.value,
              stakeAmount: parseInt(habit['stake-amount'].value),
              createdAtBlock: parseInt(habit['created-at-block'].value),
              lastCheckInBlock: parseInt(habit['last-check-in-block'].value),
              currentStreak: parseInt(habit['current-streak'].value),
              isActive: habit['is-active'].value,
              isCompleted: habit['is-completed'].value,
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
    staleTime: 120000, // 2 minutes - reduces API calls to stay under Hiro rate limits
    refetchOnWindowFocus: true,
    refetchInterval: 120000, // re-poll every 2 min to pick up external state changes
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
      const result = await contractService.getUserStats(walletState.address);

      // get-user-stats returns a response type
      if (result.success && result.value && result.value.value) {
        const stats = result.value.value;
        const habitIdsValue = stats['habit-ids']?.value || [];
        return {
          totalHabits: parseInt(stats['total-habits'].value),
          habitIds: habitIdsValue.map((id: any) => parseInt(id.value)),
        } as UserStats;
      }

      return null;
    },
    enabled: !!walletState.address,
    staleTime: 120000,
    retry: 3,
    retryDelay: (attempt) => Math.min(15000 * Math.pow(2, attempt - 1), 60000),
  });

  // Fetch pool balance
  const { data: poolBalance } = useQuery({
    queryKey: ['poolBalance'],
    queryFn: () => contractService.getPoolBalance(),
    staleTime: 300000, // 5 minutes - pool balance changes infrequently
    retry: 3,
    retryDelay: (attempt) => Math.min(15000 * Math.pow(2, attempt - 1), 60000),
  });

  // Helper: schedule a deferred refetch after the tx has time to mine.
  // Stacks blocks average ~10 min; we refetch at 30s and 2min as best-effort.
  const scheduleRefetch = useCallback(
    (queryKeys: string[][]) => {
      const invalidate = () => {
        for (const key of queryKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      };
      setTimeout(invalidate, 30_000);
      setTimeout(invalidate, 120_000);
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
      const queryKey = ['habits', walletState.address];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Habit[]>(queryKey);
      if (previous) {
        queryClient.setQueryData<Habit[]>(queryKey, (old) =>
          (old ?? []).map((h) =>
            h.habitId === habitId
              ? { ...h, currentStreak: h.currentStreak + 1 }
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
    onSuccess: () => {
      scheduleRefetch([['habits', walletState.address!], ['userStats', walletState.address!]]);
    },
  });

  // Withdraw stake mutation with optimistic update
  const withdrawStakeMutation = useMutation({
    mutationFn: ({ habitId, stakeAmount }: { habitId: number; stakeAmount: number }) =>
      contractService.withdrawStake(habitId, stakeAmount),
    onMutate: async ({ habitId }) => {
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
    onSuccess: () => {
      refreshBalance();
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

    // Mutations
    createHabit: createHabitMutation.mutateAsync,
    checkIn: checkInMutation.mutateAsync,
    withdrawStake: withdrawStakeMutation.mutateAsync,
    claimBonus: claimBonusMutation.mutateAsync,

    // Mutation states
    isCreatingHabit: createHabitMutation.isPending,
    isCheckingIn: checkInMutation.isPending,
    isWithdrawing: withdrawStakeMutation.isPending,
    isClaiming: claimBonusMutation.isPending,
  };
};
