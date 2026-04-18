import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { walletService } from '../services/walletService';
import { WalletState } from '../types/habit';

interface WalletContextType {
  walletState: WalletState;
  connect: () => void;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  isLoading: boolean;
  isBalanceLoading: boolean;
  isDisconnecting: boolean;
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
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchAndSetBalance = async (address: string) => {
    setIsBalanceLoading(true);
    try {
      const balance = await walletService.fetchBalance(address);
      setWalletState((prev) => ({ ...prev, balance }));
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsBalanceLoading(false);
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
        const isSignedIn = walletService.isSignedIn();
        if (isSignedIn) {
          const address = walletService.getAddress();
          setWalletState({
            isConnected: true,
            address,
            balance: 0,
          });
          if (address) {
            await fetchAndSetBalance(address);
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void checkConnection();
  }, []);

  const connect = () => {
    setIsLoading(true);
    try {
      walletService.connect(
        (_payload) => {
          const address = walletService.getAddress();
          setWalletState({
            isConnected: true,
            address,
            balance: 0,
          });
          if (address) {
            void fetchAndSetBalance(address);
          }
          setIsLoading(false);
        },
        () => {
          // User cancelled the wallet picker
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const disconnect = async () => {
    setIsDisconnecting(true);

    try {
      walletService.disconnect();
      setWalletState({
        isConnected: false,
        address: null,
        balance: 0,
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <WalletContext.Provider value={{ walletState, connect, disconnect, refreshBalance, isLoading, isBalanceLoading, isDisconnecting }}>
      {children}
    </WalletContext.Provider>
  );
};
