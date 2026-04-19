import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { contractService } from '../services/contractService';
import { useWallet } from '../context/WalletContext';
import { useTransactions } from '../context/TransactionContext';
import {
  Habit,
} from '../types/habit';
import { POLLING_INTERVAL, CACHE_TIME, POOL_CACHE_TIME } from '../utils/constants';
import { getHabitSyncTargets } from './habitTransactionSync';
import { queryKeys } from '../utils/queryKeys';

export interface DailyCheckInEntry {
  habitId: number;
  txId?: string;
  error?: string;
}

export interface DailyCheckInResult {
  attempted: number;
  submitted: number;
  failed: number;
  entries: DailyCheckInEntry[];
}

/**
 * Custom hook for managing habits
 */
export const useHabits = () => {
  const { walletState, refreshBalance } = useWallet();
  const { addTransaction, transactions } = useTransactions();
  const queryClient = useQueryClient();

  // Track which habit IDs have in-flight mutations so each card can
  // independently show its own loading state.
  const [pendingCheckIns, setPendingCheckIns] = useState<Set<number>>(new Set());
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Set<number>>(new Set());
  const [pendingClaims, setPendingClaims] = useState<Set<number>>(new Set());
  const [pendingSlashes, setPendingSlashes] = useState<Set<number>>(new Set());
  const [isRunningDailyCheckIn, setIsRunningDailyCheckIn] = useState(false);

  // Fetch user habits
  const {
    data: habits,
    isLoading: isLoadingHabits,
    error: habitsError,
  } = useQuery({
    queryKey: queryKeys.habits(walletState.address),
    queryFn: async () => {
      if (!walletState.address) return [];
      const habitIds = await contractService.readUserHabits(walletState.address);
      if (!habitIds.length) return [];

      const habitPromises = habitIds.map(async (habitId) => {
        const habit = await contractService.readHabit(habitId);
        if (!habit) {
          return null;
        }

        return habit satisfies Habit;
      });

      const habitsData = await Promise.all(habitPromises);
      return habitsData.filter((h): h is Habit => h !== null);
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
    queryKey: queryKeys.userStats(walletState.address),
    queryFn: async () => {
      if (!walletState.address) return null;
      return contractService.readUserStats(walletState.address);
    },
    enabled: !!walletState.address,
    staleTime: CACHE_TIME,
    retry: 3,
    retryDelay: (attempt) => Math.min(15000 * Math.pow(2, attempt - 1), 60000),
  });

  // Fetch pool balance
  const { data: poolBalance, error: poolError } = useQuery({
    queryKey: queryKeys.poolBalance,
    queryFn: () => contractService.readPoolBalance(),
    staleTime: POOL_CACHE_TIME,
    retry: 3,
    retryDelay: (attempt) => Math.min(15000 * Math.pow(2, attempt - 1), 60000),
  });

  const { data: estimatedBonusShare } = useQuery({
    queryKey: ['estimatedBonusShare'],
    queryFn: () => contractService.readEstimatedBonusShare(),
    staleTime: POOL_CACHE_TIME,
    retry: 3,
    retryDelay: (attempt) => Math.min(15000 * Math.pow(2, attempt - 1), 60000),
  });

  const { data: unclaimedCompletedHabits } = useQuery({
    queryKey: ['unclaimedCompletedHabits'],
    queryFn: () => contractService.readUnclaimedCompletedHabits(),
    staleTime: POOL_CACHE_TIME,
    retry: 3,
    retryDelay: (attempt) => Math.min(15000 * Math.pow(2, attempt - 1), 60000),
  });

  // Helper: schedule a deferred refetch after the tx has time to mine.
  // Stacks blocks average ~10 min; we refetch at 30s and 2min as best-effort.
  // All timers are tracked so they can be cleaned up on unmount.
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const handledConfirmedTransactionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      for (const id of timersRef.current) clearTimeout(id);
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!walletState.address) {
      handledConfirmedTransactionsRef.current.clear();
      return;
    }

    const activeTxIds = new Set(transactions.map((tx) => tx.txId));

    for (const txId of handledConfirmedTransactionsRef.current) {
      if (!activeTxIds.has(txId)) {
        handledConfirmedTransactionsRef.current.delete(txId);
      }
    }

    const confirmedTransactions = transactions.filter(
      (tx) => tx.status === 'confirmed' && !handledConfirmedTransactionsRef.current.has(tx.txId)
    );

    if (!confirmedTransactions.length) {
      return;
    }

    for (const tx of confirmedTransactions) {
      handledConfirmedTransactionsRef.current.add(tx.txId);

      const syncTargets = getHabitSyncTargets(tx.functionName);
      if (!syncTargets) {
        continue;
      }

      if (syncTargets.invalidateHabits) {
        contractService.invalidateAddressReadCache(walletState.address);
        void queryClient.invalidateQueries({ queryKey: queryKeys.habits(walletState.address) });
      }

      if (syncTargets.invalidateUserStats) {
        contractService.invalidateAddressReadCache(walletState.address);
        void queryClient.invalidateQueries({ queryKey: queryKeys.userStats(walletState.address) });
      }

      if (syncTargets.invalidatePoolBalance) {
        contractService.invalidatePoolReadCache();
        void queryClient.invalidateQueries({ queryKey: queryKeys.poolBalance });
        void queryClient.invalidateQueries({ queryKey: ['estimatedBonusShare'] });
        void queryClient.invalidateQueries({ queryKey: ['unclaimedCompletedHabits'] });
      }

      if (syncTargets.refreshBalance) {
        void refreshBalance();
      }
    }
  }, [queryClient, refreshBalance, transactions, walletState.address]);

  const scheduleRefetch = useCallback(
    (keys: ReadonlyArray<readonly unknown[]>) => {
      const invalidate = () => {
        for (const key of keys) {
          void queryClient.invalidateQueries({ queryKey: key });
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
    onSuccess: (txId) => {
      addTransaction(txId, 'create-habit');
      void refreshBalance();
      contractService.invalidateAddressReadCache(walletState.address);
      scheduleRefetch([
        queryKeys.habits(walletState.address),
        queryKeys.userStats(walletState.address),
      ]);
    },
  });

  // Check-in mutation with optimistic streak update
  const checkInMutation = useMutation({
    mutationFn: (habitId: number) => contractService.checkIn(habitId),
    onMutate: (habitId: number) => {
      setPendingCheckIns((prev) => new Set(prev).add(habitId));
      return null;
    },
    onSettled: (_data, _err, habitId) => {
      setPendingCheckIns((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    },
    onSuccess: (txId) => {
      addTransaction(txId, 'check-in');
      contractService.invalidateAddressReadCache(walletState.address);
      scheduleRefetch([queryKeys.habits(walletState.address), queryKeys.userStats(walletState.address)]);
    },
  });

  // Withdraw stake mutation with optimistic update
  const withdrawStakeMutation = useMutation({
    mutationFn: ({ habitId, stakeAmount }: { habitId: number; stakeAmount: number }) =>
      contractService.withdrawStake(habitId, stakeAmount),
    onMutate: ({ habitId }) => {
      setPendingWithdrawals((prev) => new Set(prev).add(habitId));
      return null;
    },
    onSettled: (_data, _err, { habitId }) => {
      setPendingWithdrawals((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    },
    onSuccess: (txId) => {
      addTransaction(txId, 'withdraw-stake');
      void refreshBalance();
      contractService.invalidateAddressReadCache(walletState.address);
      contractService.invalidatePoolReadCache();
      scheduleRefetch([
        queryKeys.habits(walletState.address),
        queryKeys.userStats(walletState.address),
        queryKeys.poolBalance,
        ['estimatedBonusShare'],
        ['unclaimedCompletedHabits'],
      ]);
    },
  });

  // Claim bonus mutation with optimistic update
  const claimBonusMutation = useMutation({
    mutationFn: (habitId: number) => contractService.claimBonus(habitId),
    onMutate: (habitId: number) => {
      setPendingClaims((prev) => new Set(prev).add(habitId));
      return null;
    },
    onSettled: (_data, _err, habitId) => {
      setPendingClaims((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    },
    onSuccess: (txId) => {
      addTransaction(txId, 'claim-bonus');
      void refreshBalance();
      contractService.invalidateAddressReadCache(walletState.address);
      contractService.invalidatePoolReadCache();
      scheduleRefetch([
        queryKeys.habits(walletState.address),
        queryKeys.poolBalance,
        ['estimatedBonusShare'],
        ['unclaimedCompletedHabits'],
      ]);
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
    onSuccess: (txId) => {
      addTransaction(txId, 'slash-habit');
      contractService.invalidateAddressReadCache(walletState.address);
      contractService.invalidatePoolReadCache();
      scheduleRefetch([
        queryKeys.habits(walletState.address),
        queryKeys.poolBalance,
        ['estimatedBonusShare'],
      ]);
    },
  });

  const runDailyCheckIn = useCallback(async (habitIds: number[]): Promise<DailyCheckInResult> => {
    if (habitIds.length === 0) {
      return {
        attempted: 0,
        submitted: 0,
        failed: 0,
        entries: [],
      };
    }

    setIsRunningDailyCheckIn(true);
    const entries: DailyCheckInEntry[] = [];

    try {
      for (const habitId of habitIds) {
        try {
          const txId = await checkInMutation.mutateAsync(habitId);
          entries.push({ habitId, txId });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          entries.push({ habitId, error: message });

          // User cancellation should stop the remaining queue to avoid repeatedly
          // reopening the wallet popup after an intentional cancel action.
          if (message === 'Transaction cancelled') {
            break;
          }
        }
      }
    } finally {
      setIsRunningDailyCheckIn(false);
    }

    const submitted = entries.filter((entry) => entry.txId).length;
    const failed = entries.length - submitted;

    return {
      attempted: entries.length,
      submitted,
      failed,
      entries,
    };
  }, [checkInMutation]);

  return {
    // Data
    habits: habits || [],
    userStats,
    poolBalance: poolBalance || 0,
    estimatedBonusShare: estimatedBonusShare || 0,
    unclaimedCompletedHabits: unclaimedCompletedHabits || 0,

    // Loading states
    isLoadingHabits,
    isLoadingStats,

    // Errors
    habitsError,
    poolError,

    // Mutations
    createHabit: createHabitMutation.mutateAsync,
    checkIn: checkInMutation.mutateAsync,
    runDailyCheckIn,
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
    isRunningDailyCheckIn,
    isWithdrawing: withdrawStakeMutation.isPending,
    isClaiming: claimBonusMutation.isPending,
    isSlashing: slashHabitMutation.isPending,
  };
};
