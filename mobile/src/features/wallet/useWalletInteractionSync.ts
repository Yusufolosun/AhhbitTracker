import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStateContext } from '@/app/state';
import { QUERY_KEYS } from '@/core/config';
import { invalidateAddressReadCache, invalidatePoolReadCache } from '@/core/data';
import { useNotificationCenter } from '@/features/notifications';
import {
  buildTransactionNotificationPlan,
  toNotificationRecord,
} from '@/features/notifications/planner';
import {
  scheduleNotification,
} from '@/features/notifications/service';
import {
  fetchWalletTransactionStatus,
  getWalletInteractionSyncTargets,
} from './transactionSync';
import { trackMobileEvent } from '@/analytics';

const TX_POLL_INTERVAL_MS = 15_000;
const TX_POLL_TIMEOUT_MS = 30 * 60_000;

export function useWalletInteractionSync() {
  const { state } = useAppStateContext();
  const queryClient = useQueryClient();
  const notificationCenter = useNotificationCenter();
  const notificationStateRef = useRef(notificationCenter.state);
  const handledTxIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    notificationStateRef.current = notificationCenter.state;
  }, [notificationCenter.state]);

  const notifyTransaction = async (status: 'confirmed' | 'failed') => {
    const walletInteraction = state.walletInteraction;
    const notificationState = notificationStateRef.current;
    const txId = walletInteraction?.txId ?? null;

    if (
      !walletInteraction ||
      !txId ||
      !notificationState.eventAlertsEnabled ||
      notificationState.permissionStatus !== 'granted'
    ) {
      return;
    }

    const plan = buildTransactionNotificationPlan({
      txId,
      functionName: walletInteraction.functionName,
      status,
    });

    if (notificationState.deliveredEventKeys.includes(plan.key)) {
      return;
    }

    const identifier = await scheduleNotification(plan);
    await notificationCenter.recordNotification(plan.key, toNotificationRecord(plan, identifier));
  };

  useEffect(() => {
    const walletInteraction = state.walletInteraction;

    if (!walletInteraction || walletInteraction.status !== 'success' || !walletInteraction.txId) {
      return;
    }

    const txId = walletInteraction.txId;

    if (handledTxIdsRef.current.has(txId)) {
      return;
    }

    const syncTargets = getWalletInteractionSyncTargets(walletInteraction.functionName);
    const queryAddress = state.trackedAddress ?? 'anonymous';
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    const invalidateQueries = () => {
      if (syncTargets.invalidateHabits) {
        invalidateAddressReadCache(queryAddress);
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userHabits(queryAddress) });
      }

      if (syncTargets.invalidateUserStats) {
        invalidateAddressReadCache(queryAddress);
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats(queryAddress) });
      }

      if (syncTargets.invalidatePoolBalance) {
        invalidatePoolReadCache();
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.poolBalance });
      }
    };

    const markHandled = () => {
      handledTxIdsRef.current.add(txId);

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
        const status = await fetchWalletTransactionStatus(txId);

        if (cancelled) {
          return;
        }

        if (status === 'confirmed') {
          markHandled();
          trackMobileEvent('wallet_tx_confirmed', {
            functionName: walletInteraction.functionName,
            source: 'wallet-sync',
          });
          void notifyTransaction('confirmed').catch(() => undefined);
          invalidateQueries();
          return;
        }

        if (status === 'failed') {
          markHandled();
          trackMobileEvent('wallet_tx_failed', {
            functionName: walletInteraction.functionName,
            source: 'wallet-sync',
          });
          void notifyTransaction('failed').catch(() => undefined);
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