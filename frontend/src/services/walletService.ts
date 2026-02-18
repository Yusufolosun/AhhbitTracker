import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { NETWORK } from '../utils/constants';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export const walletService = {
  /**
   * Connect wallet
   */
  connect: (onFinish?: (payload: any) => void) => {
    showConnect({
      appDetails: {
        name: 'AhhbitTracker',
        icon: window.location.origin + '/logo.svg',
      },
      redirectTo: '/',
      onFinish: (payload) => {
        if (onFinish) {
          onFinish(payload);
        }
      },
      userSession,
    });
  },

  /**
   * Disconnect wallet
   */
  disconnect: () => {
    userSession.signUserOut();
  },

  /**
   * Check if user is signed in
   */
  isSignedIn: (): boolean => {
    return userSession.isUserSignedIn();
  },

  /**
   * Get user address
   */
  getAddress: (): string | null => {
    if (!userSession.isUserSignedIn()) return null;
    const userData = userSession.loadUserData();
    return userData.profile.stxAddress.mainnet;
  },

  /**
   * Get user session
   */
  getUserSession: () => userSession,

  /**
   * Get network
   */
  getNetwork: () => NETWORK,

  /**
   * Fetch STX balance for an address from the Hiro API.
   * Returns balance in microSTX.
   */
  fetchBalance: async (address: string): Promise<number> => {
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev
      ? `${window.location.origin}/api/stacks`
      : 'https://api.mainnet.hiro.so';
    const url = `${baseUrl}/v2/accounts/${address}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.status}`);
    }
    const data = await response.json();
    return parseInt(data.balance, 10);
  },
};
