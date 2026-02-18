import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { walletService } from '../services/walletService';
import { WalletState } from '../types/habit';

interface WalletContextType {
  walletState: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetBalance = async (address: string) => {
    try {
      const balance = await walletService.fetchBalance(address);
      setWalletState((prev) => ({ ...prev, balance }));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const refreshBalance = async () => {
    if (walletState.address) {
      await fetchAndSetBalance(walletState.address);
    }
  };

  useEffect(() => {
    // Check if wallet is already connected on mount
    const checkConnection = async () => {
      try {
        const isSignedIn = await walletService.isSignedIn();
        if (isSignedIn) {
          const address = await walletService.getAddress();
          setWalletState({
            isConnected: true,
            address,
            balance: 0,
          });
          if (address) {
            fetchAndSetBalance(address);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const connect = async () => {
    setIsLoading(true);
    try {
      walletService.connect(() => {
        const address = walletService.getAddress();
        setWalletState({
          isConnected: true,
          address,
          balance: 0,
        });
        if (address) {
          fetchAndSetBalance(address);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const disconnect = () => {
    walletService.disconnect();
    setWalletState({
      isConnected: false,
      address: null,
      balance: 0,
    });
  };

  return (
    <WalletContext.Provider value={{ walletState, connect, disconnect, refreshBalance, isLoading }}>
      {children}
    </WalletContext.Provider>
  );
};
