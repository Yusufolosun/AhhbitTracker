import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStateContext } from '@/app/state';
import { QUERY_KEYS } from '@/core/config';
import {
  fetchWalletTransactionStatus,
  getWalletInteractionSyncTargets,
} from './transactionSync';

const TX_POLL_INTERVAL_MS = 15_000;
const TX_POLL_TIMEOUT_MS = 30 * 60_000;

export function useWalletInteractionSync() {
  const { state } = useAppStateContext();
  const queryClient = useQueryClient();
  const handledTxIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const walletInteraction = state.walletInteraction;

    if (!walletInteraction || walletInteraction.status !== 'success' || !walletInteraction.txId) {
      return;
    }

    if (handledTxIdsRef.current.has(walletInteraction.txId)) {
      return;
    }

    const syncTargets = getWalletInteractionSyncTargets(walletInteraction.functionName);
    const queryAddress = state.trackedAddress ?? 'anonymous';
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    const invalidateQueries = () => {
      if (syncTargets.invalidateHabits) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userHabits(queryAddress) });
      }

      if (syncTargets.invalidateUserStats) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats(queryAddress) });
      }

      if (syncTargets.invalidatePoolBalance) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.poolBalance });
      }
    };

    const markHandled = () => {
      handledTxIdsRef.current.add(walletInteraction.txId);

      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }

      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
    };

    const pollTransaction = async () => {
      try {
        const status = await fetchWalletTransactionStatus(walletInteraction.txId);

        if (cancelled) {
          return;
        }

        if (status === 'confirmed') {
          markHandled();
          invalidateQueries();
          return;
        }

        if (status === 'failed') {
          markHandled();
          return;
        }
      } catch {
        if (cancelled) {
          return;
        }
      }

      pollTimer = setTimeout(() => {
        void pollTransaction();
      }, TX_POLL_INTERVAL_MS);
    };

    void pollTransaction();

    timeoutTimer = setTimeout(() => {
      markHandled();
    }, TX_POLL_TIMEOUT_MS);

    return () => {
      cancelled = true;

      if (pollTimer) {
        clearTimeout(pollTimer);
      }

      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
    };
  }, [queryClient, state.trackedAddress, state.walletInteraction]);
}