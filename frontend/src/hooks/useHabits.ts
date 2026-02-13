import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractService } from '../services/contractService';
import { useWallet } from '../context/WalletContext';
import { Habit, UserStats } from '../types/habit';

/**
 * Custom hook for managing habits
 */
export const useHabits = () => {
  const { walletState } = useWallet();
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
      console.log('getUserHabits result:', result);
      
      // Parse habit IDs from result
      // get-user-habits returns: { habit-ids: (list) }
      if (result.type === 'ok' && result.value) {
        const habitIdsData = result.value.value;
        const habitIds = habitIdsData['habit-ids']?.value || [];
        console.log('Habit IDs:', habitIds);
        
        // Fetch each habit's details
        const habitPromises = habitIds.map(async (id: any) => {
          const habitId = parseInt(id.value);
          const habitData = await contractService.getHabit(habitId);
          console.log(`Habit ${habitId} data:`, habitData);
          
          if (habitData.type === 'some') {
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
        console.log('Fetched habits:', habitsData);
        return habitsData.filter((h): h is Habit => h !== null);
      }
      
      return [];
    },
    enabled: !!walletState.address,
    staleTime: 30000, // 30 seconds
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
      
      if (result.type === 'ok') {
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
    staleTime: 30000,
  });

  // Fetch pool balance
  const { data: poolBalance } = useQuery({
    queryKey: ['poolBalance'],
    queryFn: () => contractService.getPoolBalance(),
    staleTime: 60000, // 1 minute
  });

  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: ({ name, stakeAmount }: { name: string; stakeAmount: number }) =>
      contractService.createHabit(name, stakeAmount),
    onSuccess: () => {
      // Invalidate queries to refetch data after transaction confirmation
      queryClient.invalidateQueries({ queryKey: ['habits', walletState.address] });
      queryClient.invalidateQueries({ queryKey: ['userStats', walletState.address] });
      
      // Refetch again after additional delay to ensure blockchain state is updated
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['habits', walletState.address] });
        queryClient.invalidateQueries({ queryKey: ['userStats', walletState.address] });
      }, 5000); // Additional 5 second delay
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (habitId: number) => contractService.checkIn(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', walletState.address] });
      queryClient.invalidateQueries({ queryKey: ['userStats', walletState.address] });
    },
  });

  // Withdraw stake mutation
  const withdrawStakeMutation = useMutation({
    mutationFn: (habitId: number) => contractService.withdrawStake(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', walletState.address] });
      queryClient.invalidateQueries({ queryKey: ['userStats', walletState.address] });
      queryClient.invalidateQueries({ queryKey: ['poolBalance'] });
    },
  });

  // Claim bonus mutation
  const claimBonusMutation = useMutation({
    mutationFn: (habitId: number) => contractService.claimBonus(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', walletState.address] });
      queryClient.invalidateQueries({ queryKey: ['poolBalance'] });
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
    createHabit: createHabitMutation.mutate,
    checkIn: checkInMutation.mutate,
    withdrawStake: withdrawStakeMutation.mutate,
    claimBonus: claimBonusMutation.mutate,
    
    // Mutation states
    isCreatingHabit: createHabitMutation.isPending,
    isCheckingIn: checkInMutation.isPending,
    isWithdrawing: withdrawStakeMutation.isPending,
    isClaiming: claimBonusMutation.isPending,
  };
};
