import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<TrackedTransaction[]>([]);

  const addTransaction = useCallback((txId: string, functionName: string) => {
    setTransactions((prev) => [
      {
        txId,
        functionName,
        status: 'pending',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
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

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, dismissTransaction, clearAll, getExplorerUrl }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
