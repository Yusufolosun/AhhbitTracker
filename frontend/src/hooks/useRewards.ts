import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { rewardService } from '../services/rewardService';
import { useWallet } from '../context/WalletContext';
import { useTransactions } from '../context/TransactionContext';
import { CACHE_TIME } from '../utils/constants';

export const useRewards = () => {
  const { refreshBalance } = useWallet();
  const { addTransaction } = useTransactions();
  const queryClient = useQueryClient();
  const [pendingRewardClaims, setPendingRewardClaims] = useState<Set<string>>(new Set());

  // Fetch reward pool balance
  const { data: rewardPoolBalance } = useQuery({
    queryKey: ['rewardPoolBalance'],
    queryFn: () => rewardService.readRewardPoolBalance(),
    staleTime: CACHE_TIME,
  });

  // Claim milestone reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: ({ habitId, milestone }: { habitId: number; milestone: number }) =>
      rewardService.claimMilestoneReward(habitId, milestone),
    onMutate: ({ habitId, milestone }) => {
      const key = `${habitId}-${milestone}`;
      setPendingRewardClaims((prev) => new Set(prev).add(key));
    },
    onSettled: (_data, _err, { habitId, milestone }) => {
      const key = `${habitId}-${milestone}`;
      setPendingRewardClaims((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    onSuccess: (txId) => {
      addTransaction(txId, 'claim-milestone-reward');
      void refreshBalance();
      // Invalidate relevant queries if any
      void queryClient.invalidateQueries({ queryKey: ['rewardPoolBalance'] });
    },
  });

  // Fund reward pool mutation
  const fundRewardPoolMutation = useMutation({
    mutationFn: (amount: number) => rewardService.fundRewardPool(amount),
    onSuccess: (txId) => {
      addTransaction(txId, 'fund-reward-pool');
      void refreshBalance();
      void queryClient.invalidateQueries({ queryKey: ['rewardPoolBalance'] });
    },
  });

  return {
    rewardPoolBalance: rewardPoolBalance || 0,
    claimReward: claimRewardMutation.mutateAsync,
    fundRewardPool: fundRewardPoolMutation.mutateAsync,
    pendingRewardClaims,
    isClaimingReward: claimRewardMutation.isPending,
    isFundingRewardPool: fundRewardPoolMutation.isPending,
  };
};
