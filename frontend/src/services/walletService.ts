/**
 * @module walletService
 * Service for Stacks wallet integration and account management.
 */
import { AppConfig, UserSession, showConnect, clearSelectedProviderId, FinishedAuthData } from '@stacks/connect';
import { NETWORK } from '../utils/constants';
import { fetchHiroApiJson } from './hiroApiClient';

/** Application configuration for Stacks wallet permissions. */
const appConfig = new AppConfig(['store_write', 'publish_data']);

/** User session instance for managing wallet authentication state. */
const userSession = new UserSession({ appConfig });

/**
 * Wallet service providing authentication and account utilities.
 */
export const walletService = {
  /**
   * Connect wallet — shows picker if no wallet was previously selected.
   *
   * @param onFinish - Callback invoked after successful authentication
   * @param onCancel - Callback invoked if user cancels the connection
   */
  connect: (onFinish?: (payload: FinishedAuthData) => void, onCancel?: () => void) => {
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
      onCancel: () => {
        if (onCancel) {
          onCancel();
        }
      },
      userSession,
    });
  },

  /**
   * Disconnect wallet and clear provider selection.
   */
  disconnect: () => {
    clearSelectedProviderId();
    userSession.signUserOut();
  },

  /**
   * Check if user is currently signed in.
   *
   * @returns True if authenticated, false otherwise
   */
  isSignedIn: (): boolean => {
    return userSession.isUserSignedIn();
  },

  /**
   * Get the user's mainnet STX address.
   *
   * @returns STX address string or null if not signed in
   */
  getAddress: (): string | null => {
    if (!userSession.isUserSignedIn()) return null;
    const userData = userSession.loadUserData();
    return userData.profile.stxAddress.mainnet;
  },

  /**
   * Get the underlying UserSession instance.
   *
   * @returns UserSession for advanced operations
   */
  getUserSession: () => userSession,

  /**
   * Get the configured Stacks network.
   *
   * @returns Network configuration object
   */
  getNetwork: () => NETWORK,

  /**
   * Fetch STX balance for an address from the Hiro API.
   *
   * The Hiro API returns the balance as a decimal string that can exceed
   * Number.MAX_SAFE_INTEGER for large holders (~1.8B STX ≈ 1.8e15 µSTX).
   * We parse through BigInt first to avoid silent precision loss.
   *
   * @param address - Stacks address to query
   * @returns Balance in microSTX
   * @throws Error if the API request fails
   */
  fetchBalance: async (address: string): Promise<number> => {
    const payload = await fetchHiroApiJson<{ balance: string }>(`/v2/accounts/${address}`, {
      ttlMs: 15_000,
    });
    const raw = BigInt(payload.balance);
    if (raw > BigInt(Number.MAX_SAFE_INTEGER)) {
      console.warn(
        'Balance exceeds Number.MAX_SAFE_INTEGER — display may lose precision:',
        payload.balance,
      );
    }
    return Number(raw);
  },
};
