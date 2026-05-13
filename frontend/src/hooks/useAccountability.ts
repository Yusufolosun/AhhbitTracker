import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { accountabilityService } from '../services/accountabilityService';
import { useWallet } from '../context/WalletContext';
import { useTransactions } from '../context/TransactionContext';
import { CACHE_TIME, POLLING_INTERVAL } from '../utils/constants';

export const useAccountability = () => {
  const { walletState, refreshBalance } = useWallet();
  const { addTransaction } = useTransactions();
  const queryClient = useQueryClient();
  const [pendingGroupJoins, setPendingGroupJoins] = useState<Set<number>>(new Set());

  // Fetch user groups
  const {
    data: userGroups,
    isLoading: isLoadingGroups,
  } = useQuery({
    queryKey: ['userGroups', walletState.address],
    queryFn: async () => {
      if (!walletState.address) return [];
      return accountabilityService.readUserGroups(walletState.address);
    },
    enabled: !!walletState.address,
    staleTime: CACHE_TIME,
    refetchInterval: POLLING_INTERVAL,
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: ({ stakeAmount, duration, habitId }: { stakeAmount: number; duration: number; habitId: number }) =>
      accountabilityService.createGroup(stakeAmount, duration, habitId),
    onSuccess: (txId) => {
      addTransaction(txId, 'create-group');
      void refreshBalance();
      void queryClient.invalidateQueries({ queryKey: ['userGroups', walletState.address] });
    },
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: ({ groupId, habitId }: { groupId: number; habitId: number }) =>
      accountabilityService.joinGroup(groupId, habitId),
    onMutate: ({ groupId }) => {
      setPendingGroupJoins((prev) => new Set(prev).add(groupId));
    },
    onSettled: (_data, _err, { groupId }) => {
      setPendingGroupJoins((prev) => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
    },
    onSuccess: (txId) => {
      addTransaction(txId, 'join-group');
      void refreshBalance();
      void queryClient.invalidateQueries({ queryKey: ['userGroups', walletState.address] });
    },
  });

  return {
    userGroups,
    isLoadingGroups,
    createGroup: createGroupMutation.mutateAsync,
    joinGroup: joinGroupMutation.mutateAsync,
    pendingGroupJoins,
    isCreatingGroup: createGroupMutation.isPending,
    isJoiningGroup: joinGroupMutation.isPending,
  };
};
