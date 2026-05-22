import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { walletService } from '../services/walletService';
import { demoService, DEMO_ADDRESS } from '../services/demoService';
import { WalletState } from '../types/habit';
import { trackEvent, toWalletAddressHash } from '../analytics';

interface WalletContextType {
  walletState: WalletState;
  connect: () => void;
  connectDemo: () => void;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  isLoading: boolean;
  isBalanceLoading: boolean;
  isDisconnecting: boolean;
  isDemoMode: boolean;
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
    const checkConnection = async () => {
      try {
        if (demoService.isDemoMode()) {
          setWalletState({
            isConnected: true,
            address: DEMO_ADDRESS,
            balance: demoService.getUserBalance(),
          });
          setIsLoading(false);
          return;
        }

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

  const connectDemo = () => {
    demoService.enableDemoMode();
    setWalletState({
      isConnected: true,
      address: DEMO_ADDRESS,
      balance: demoService.getUserBalance(),
    });
    trackEvent('demo_mode_started');
  };

  const connect = () => {
    setIsLoading(true);
    trackEvent('wallet_connect_started', { source: 'header' });
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
          trackEvent('wallet_connected', {
            walletAddressHash: toWalletAddressHash(address),
          });
          setIsLoading(false);
        },
        () => {
          trackEvent('wallet_connect_cancelled');
          setIsLoading(false);
        },
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
      if (demoService.isDemoMode()) {
        demoService.disableDemoMode();
        trackEvent('demo_mode_ended');
      } else {
        walletService.disconnect();
        trackEvent('wallet_disconnected', {
          walletAddressHash: toWalletAddressHash(walletState.address),
        });
      }
      await Promise.resolve();
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

  const isDemoMode = demoService.isDemoMode();

  return (
    <WalletContext.Provider
      value={{
        walletState,
        connect,
        connectDemo,
        disconnect,
        refreshBalance,
        isLoading,
        isBalanceLoading,
        isDisconnecting,
        isDemoMode,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
