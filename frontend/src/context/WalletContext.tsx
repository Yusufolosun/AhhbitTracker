import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { walletService } from '../services/walletService';
import { WalletState } from '../types/habit';

interface WalletContextType {
  walletState: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
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
  });
  const [isLoading, setIsLoading] = useState(true);

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
          });
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
      await walletService.connect();
      const address = await walletService.getAddress();
      setWalletState({
        isConnected: true,
        address,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    walletService.disconnect();
    setWalletState({
      isConnected: false,
      address: null,
    });
  };

  return (
    <WalletContext.Provider value={{ walletState, connect, disconnect, isLoading }}>
      {children}
    </WalletContext.Provider>
  );
};
