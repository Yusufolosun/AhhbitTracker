import { AppConfig, UserSession, showConnect, clearSelectedProviderId } from '@stacks/connect';
import { NETWORK } from '../utils/constants';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export const walletService = {
  /**
   * Connect wallet — shows picker if no wallet was previously selected
   */
  connect: (onFinish?: (payload: any) => void) => {
    showConnect({
      appDetails: {
        name: 'AhhbitTracker',
        icon: window.location.origin + '/logos/icon-only-dark.jpg',
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
    clearSelectedProviderId();
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
   *
   * The Hiro API returns the balance as a decimal string that can exceed
   * Number.MAX_SAFE_INTEGER for large holders (~1.8B STX ≈ 1.8e15 µSTX).
   * We parse through BigInt first to avoid silent precision loss.
   */
  fetchBalance: async (address: string): Promise<number> => {
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev
      ? `${window.location.origin}/api/stacks`
      : 'https://api.mainnet.hiro.so';
    const url = `${baseUrl}/v2/accounts/${address}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }
      const data = await response.json();
      const raw = BigInt(data.balance);
      if (raw > BigInt(Number.MAX_SAFE_INTEGER)) {
        console.warn(
          'Balance exceeds Number.MAX_SAFE_INTEGER — display may lose precision:',
          data.balance,
        );
      }
      return Number(raw);
    } finally {
      clearTimeout(timeout);
    }
  },
};
