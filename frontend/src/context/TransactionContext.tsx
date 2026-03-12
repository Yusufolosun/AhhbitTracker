import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { EXPLORER_TX_URL } from '../utils/constants';

export interface TrackedTransaction {
  txId: string;
  functionName: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
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
async function fetchTxStatus(txId: string): Promise<'confirmed' | 'failed' | 'pending'> {
  const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
  const baseUrl = isDev
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/stacks`
    : 'https://api.mainnet.hiro.so';

  const cleanTxId = txId.startsWith('0x') ? txId : `0x${txId}`;
  const url = `${baseUrl}/extended/v1/tx/${cleanTxId}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      // 404 usually means the tx hasn't been picked up yet — still pending
      if (response.status === 404) return 'pending';
      return 'pending';
    }

    const data = await response.json();
    const status: string = data.tx_status;

    if (status === 'success') return 'confirmed';
    if (status === 'pending') return 'pending';
    // Any abort or drop status counts as failed
    if (status.startsWith('abort_') || status.startsWith('dropped_')) return 'failed';
    return 'pending';
  } catch {
    // Network error or timeout — assume still pending
    return 'pending';
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
        status: 'pending',
        timestamp: Date.now(),
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
    return `${EXPLORER_TX_URL}${txId}?chain=mainnet`;
  }, []);

  // Poll pending transactions for confirmation
  useEffect(() => {
    const pollPendingTransactions = async () => {
      const now = Date.now();

      const pendingTxs = transactions.filter(
        (tx) => tx.status === 'pending' && now - tx.timestamp < TX_POLL_TIMEOUT
      );

      if (pendingTxs.length === 0) return;

      const updates: { txId: string; status: 'confirmed' | 'failed' }[] = [];

      await Promise.all(
        pendingTxs.map(async (tx) => {
          const status = await fetchTxStatus(tx.txId);
          if (status !== 'pending') {
            updates.push({ txId: tx.txId, status });
          }
        })
      );

      if (updates.length > 0) {
        setTransactions((prev) =>
          prev.map((tx) => {
            const update = updates.find((u) => u.txId === tx.txId);
            return update ? { ...tx, status: update.status } : tx;
          })
        );
      }
    };

    // Only set up polling if there are pending transactions
    const hasPending = transactions.some((tx) => tx.status === 'pending');

    if (hasPending) {
      // Poll immediately on first pending tx
      pollPendingTransactions();

      intervalRef.current = setInterval(pollPendingTransactions, TX_POLL_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [transactions.filter((tx) => tx.status === 'pending').map((tx) => tx.txId).join(',')]);

  // Auto-dismiss confirmed/failed transactions after TX_AUTO_DISMISS_DELAY
  useEffect(() => {
    const settled = transactions.filter((tx) => tx.status !== 'pending');
    if (settled.length === 0) return;

    const timers = settled.map((tx) => {
      const elapsed = Date.now() - tx.timestamp;
      const remaining = Math.max(TX_AUTO_DISMISS_DELAY - elapsed, 0);
      return setTimeout(() => {
        setTransactions((prev) => prev.filter((t) => t.txId !== tx.txId));
      }, remaining);
    });

    return () => timers.forEach(clearTimeout);
  }, [transactions.filter((tx) => tx.status !== 'pending').map((tx) => tx.txId).join(',')]);

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, dismissTransaction, clearAll, getExplorerUrl }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
