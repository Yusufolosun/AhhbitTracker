import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo, ReactNode } from 'react';
import { txUrl } from '@yusufolosun/stx-utils';
import {
  normalizeTxId,
  summarizeTransactionStatus,
  type TransactionStatusSummary,
} from '../utils/transactionStatus';
import { fetchHiroApiJson, HiroApiError } from '../services/hiroApiClient';

export interface TrackedTransaction {
  txId: string;
  functionName: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  updatedAt: number;
  errorCode?: number;
  errorMessage?: string;
}

interface TransactionContextType {
  transactions: TrackedTransaction[];
  addTransaction: (txId: string, functionName: string) => void;
  dismissTransaction: (txId: string) => void;
  clearAll: () => void;
  getExplorerUrl: (txId: string) => string;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider');
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

const TX_POLL_INTERVAL = 15_000; // 15 seconds
const TX_POLL_TIMEOUT = 30 * 60_000; // stop polling after 30 minutes
const TX_AUTO_DISMISS_DELAY = 60_000; // auto-dismiss confirmed/failed after 60s
const TX_MAX_ENTRIES = 20; // keep at most 20 transactions in state

/**
 * Fetch transaction status from the Hiro API.
 * Returns 'confirmed', 'failed', or 'pending'.
 */
async function fetchTxStatus(txId: string): Promise<TransactionStatusSummary> {
  const cleanTxId = normalizeTxId(txId);

  try {
    const data = await fetchHiroApiJson<any>(`/extended/v1/tx/${cleanTxId}`, {
      ttlMs: 5_000,
      retries: 1,
    });
    return summarizeTransactionStatus(data);
  } catch (error) {
    if (error instanceof HiroApiError && error.status === 404) {
      return { status: 'pending' };
    }

    // Network error or timeout — assume still pending
    return { status: 'pending' };
  }
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<TrackedTransaction[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addTransaction = useCallback((txId: string, functionName: string) => {
    setTransactions((prev) => [
      {
        txId,
        functionName,
        status: 'pending' as const,
        timestamp: Date.now(),
        updatedAt: Date.now(),
      },
      ...prev,
    ].slice(0, TX_MAX_ENTRIES));
  }, []);

  const dismissTransaction = useCallback((txId: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.txId !== txId));
  }, []);

  const clearAll = useCallback(() => {
    setTransactions([]);
  }, []);

  const getExplorerUrl = useCallback((txId: string) => {
    return txUrl(txId, 'mainnet');
  }, []);

  // Memoized keys for useEffect dependencies to avoid complex expressions
  const pendingTxIdsKey = useMemo(
    () => transactions.filter((tx) => tx.status === 'pending').map((tx) => tx.txId).join(','),
    [transactions]
  );

  const settledTxIdsKey = useMemo(
    () => transactions.filter((tx) => tx.status !== 'pending').map((tx) => tx.txId).join(','),
    [transactions]
  );

  // Poll pending transactions for confirmation
  useEffect(() => {
    const pollPendingTransactions = async () => {
      const now = Date.now();

      const pendingTxs = transactions.filter(
        (tx) => tx.status === 'pending' && now - tx.timestamp < TX_POLL_TIMEOUT
      );

      if (pendingTxs.length === 0) return;

      const updates: { txId: string; next: TransactionStatusSummary }[] = [];

      await Promise.all(
        pendingTxs.map(async (tx) => {
          const next = await fetchTxStatus(tx.txId);
          if (next.status !== 'pending') {
            updates.push({ txId: tx.txId, next });
          }
        })
      );

      if (updates.length > 0) {
        setTransactions((prev) =>
          prev.map((tx) => {
            const update = updates.find((u) => u.txId === tx.txId);
            return update
              ? {
                  ...tx,
                  status: update.next.status,
                  updatedAt: Date.now(),
                  errorCode: update.next.errorCode,
                  errorMessage: update.next.errorMessage,
                }
              : tx;
          })
        );
      }
    };

    // Only set up polling if there are pending transactions
    const hasPending = transactions.some((tx) => tx.status === 'pending');

    if (hasPending) {
      // Poll immediately on first pending tx
      void pollPendingTransactions();

      intervalRef.current = setInterval(() => {
        void pollPendingTransactions();
      }, TX_POLL_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pendingTxIdsKey, transactions]);

  // Auto-dismiss confirmed/failed transactions after TX_AUTO_DISMISS_DELAY
  useEffect(() => {
    const settled = transactions.filter((tx) => tx.status !== 'pending');
    if (settled.length === 0) return;

    const timers = settled.map((tx) => {
      const elapsed = Date.now() - tx.updatedAt;
      const remaining = Math.max(TX_AUTO_DISMISS_DELAY - elapsed, 0);
      return setTimeout(() => {
        setTransactions((prev) => prev.filter((t) => t.txId !== tx.txId));
      }, remaining);
    });

    return () => timers.forEach(clearTimeout);
  }, [settledTxIdsKey, transactions]);

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, dismissTransaction, clearAll, getExplorerUrl }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
